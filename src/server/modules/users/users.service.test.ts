import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/server/http/errors';

vi.mock('server-only', () => ({}));

const hashPassword = vi.fn();
const findUser = vi.fn();
const findRole = vi.fn();
const createUserRecord = vi.fn();
const updateUserRecord = vi.fn();
const createAuditLog = vi.fn();

vi.mock('@/server/auth/password', () => ({
  hashPassword: (...args: unknown[]) => hashPassword(...args),
}));

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./users.repository', () => ({
  findUser: (...args: unknown[]) => findUser(...args),
  findRole: (...args: unknown[]) => findRole(...args),
  listUsers: vi.fn(),
  listRoles: vi.fn(),
  createUserRecord: (...args: unknown[]) => createUserRecord(...args),
  updateUserRecord: (...args: unknown[]) => updateUserRecord(...args),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
}));

import {
  assertSelfUpdateAllowed,
  createUser,
  SYSTEM_ADMIN_ROLE_NAME,
  updateUser,
} from './users.service';

const adminRole = {
  id: 'admin-role',
  name: SYSTEM_ADMIN_ROLE_NAME,
  isSystem: true,
  isActive: true,
};

const operativeRole = {
  id: 'op-role',
  name: 'Operativo',
  isSystem: true,
  isActive: true,
};

function userRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'user-2',
    name: 'Ana Pérez',
    email: 'ana@casa.test',
    roleId: operativeRole.id,
    isActive: true,
    mustChangePassword: false,
    role: operativeRole,
    ...overrides,
  };
}

describe('assertSelfUpdateAllowed', () => {
  it('blocks self deactivation and leaving the administrator role', () => {
    expect(() =>
      assertSelfUpdateAllowed({
        actorId: 'me',
        targetId: 'me',
        targetRoleName: SYSTEM_ADMIN_ROLE_NAME,
        targetRoleIsSystem: true,
        currentRoleId: adminRole.id,
        nextIsActive: false,
      }),
    ).toThrow(HttpError);

    expect(() =>
      assertSelfUpdateAllowed({
        actorId: 'me',
        targetId: 'me',
        targetRoleName: SYSTEM_ADMIN_ROLE_NAME,
        targetRoleIsSystem: true,
        currentRoleId: adminRole.id,
        nextRoleId: operativeRole.id,
      }),
    ).toThrow(/Administrador/);
  });

  it('allows editing someone else and keeping your own administrator role', () => {
    expect(() =>
      assertSelfUpdateAllowed({
        actorId: 'me',
        targetId: 'other',
        targetRoleName: SYSTEM_ADMIN_ROLE_NAME,
        targetRoleIsSystem: true,
        currentRoleId: adminRole.id,
        nextRoleId: operativeRole.id,
        nextIsActive: false,
      }),
    ).not.toThrow();

    expect(() =>
      assertSelfUpdateAllowed({
        actorId: 'me',
        targetId: 'me',
        targetRoleName: SYSTEM_ADMIN_ROLE_NAME,
        targetRoleIsSystem: true,
        currentRoleId: adminRole.id,
        nextRoleId: adminRole.id,
      }),
    ).not.toThrow();
  });
});

describe('createUser', () => {
  beforeEach(() => {
    hashPassword.mockReset();
    findRole.mockReset();
    createUserRecord.mockReset();
    createAuditLog.mockReset();
    hashPassword.mockResolvedValue('hashed-value');
  });

  it('stores a hash, forces a password change and audits without the secret', async () => {
    findRole.mockResolvedValue(operativeRole);
    createUserRecord.mockResolvedValue(
      userRow({ id: 'user-new', mustChangePassword: true }),
    );
    createAuditLog.mockResolvedValue({ id: 'audit-1' });

    const result = await createUser('admin-1', {
      name: 'Ana Pérez',
      email: 'ana@casa.test',
      password: 'clave123',
      roleId: operativeRole.id,
    });

    expect(result.mustChangePassword).toBe(true);
    expect(result).not.toHaveProperty('passwordHash');
    expect(createUserRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        passwordHash: 'hashed-value',
        mustChangePassword: true,
        isActive: true,
      }),
      expect.anything(),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'admin-1',
        entity: 'user',
        action: 'user.create',
      }),
      expect.anything(),
    );
    const audited = JSON.stringify(createAuditLog.mock.calls);
    expect(audited).not.toContain('clave123');
    expect(audited).not.toContain('hashed-value');
  });

  it('rejects an inactive role', async () => {
    findRole.mockResolvedValue({ ...operativeRole, isActive: false });
    await expect(
      createUser('admin-1', {
        name: 'Ana',
        email: 'ana@casa.test',
        password: 'clave123',
        roleId: operativeRole.id,
      }),
    ).rejects.toMatchObject({ status: 409 });
    expect(createUserRecord).not.toHaveBeenCalled();
  });

  it('maps a duplicate email to 409', async () => {
    findRole.mockResolvedValue(operativeRole);
    createUserRecord.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      createUser('admin-1', {
        name: 'Ana',
        email: 'ana@casa.test',
        password: 'clave123',
        roleId: operativeRole.id,
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});

describe('updateUser', () => {
  beforeEach(() => {
    hashPassword.mockReset();
    findUser.mockReset();
    findRole.mockReset();
    updateUserRecord.mockReset();
    createAuditLog.mockReset();
    hashPassword.mockResolvedValue('hashed-value');
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('rejects self deactivation before writing', async () => {
    findUser.mockResolvedValue(
      userRow({
        id: 'me',
        roleId: adminRole.id,
        role: adminRole,
      }),
    );
    await expect(
      updateUser('me', 'me', { isActive: false }),
    ).rejects.toMatchObject({ status: 409 });
    expect(updateUserRecord).not.toHaveBeenCalled();
  });

  it('rejects removing your own administrator role', async () => {
    findUser.mockResolvedValue(
      userRow({ id: 'me', roleId: adminRole.id, role: adminRole }),
    );
    findRole.mockResolvedValue(operativeRole);
    await expect(
      updateUser('me', 'me', { roleId: operativeRole.id }),
    ).rejects.toMatchObject({ status: 409 });
    expect(updateUserRecord).not.toHaveBeenCalled();
  });

  it('writes deactivate, role change and update as separate audit rows', async () => {
    const current = userRow({ roleId: adminRole.id, role: adminRole });
    findUser.mockResolvedValue(current);
    findRole.mockResolvedValue(operativeRole);
    updateUserRecord.mockResolvedValue(
      userRow({
        name: 'Ana Actualizada',
        roleId: operativeRole.id,
        role: operativeRole,
        isActive: false,
        mustChangePassword: true,
      }),
    );

    const result = await updateUser('admin-1', current.id, {
      name: 'Ana Actualizada',
      roleId: operativeRole.id,
      isActive: false,
      password: 'nueva1234',
    });

    expect(result.mustChangePassword).toBe(true);
    expect(updateUserRecord).toHaveBeenCalledWith(
      current.id,
      expect.objectContaining({ passwordHash: 'hashed-value' }),
      expect.anything(),
    );
    const actions = createAuditLog.mock.calls.map(
      (call: [{ action: string }]) => call[0].action,
    );
    expect(actions).toEqual([
      'user.update',
      'user.deactivate',
      'user.role_change',
      'user.password_reset',
    ]);
    const audited = JSON.stringify(createAuditLog.mock.calls);
    expect(audited).not.toContain('nueva1234');
    expect(audited).not.toContain('hashed-value');
  });
});
