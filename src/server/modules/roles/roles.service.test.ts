import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '@/server/http/errors';

vi.mock('server-only', () => ({}));

const findRole = vi.fn();
const findPermissionsByIds = vi.fn();
const createRoleRecord = vi.fn();
const updateRoleRecord = vi.fn();
const replaceRolePermissions = vi.fn();
const createAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./roles.repository', () => ({
  findRole: (...args: unknown[]) => findRole(...args),
  findPermissionsByIds: (...args: unknown[]) => findPermissionsByIds(...args),
  listRoles: vi.fn(),
  listPermissions: vi.fn(),
  createRoleRecord: (...args: unknown[]) => createRoleRecord(...args),
  updateRoleRecord: (...args: unknown[]) => updateRoleRecord(...args),
  replaceRolePermissions: (...args: unknown[]) =>
    replaceRolePermissions(...args),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
}));

import {
  assertSystemRoleMutable,
  createRole,
  sameIdSet,
  sortPermissions,
  updateRole,
} from './roles.service';

const viewMembers = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const payFees = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

function roleRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'role-1',
    name: 'Caja',
    description: null,
    isSystem: false,
    isActive: true,
    permissions: [{ permissionId: viewMembers }],
    ...overrides,
  };
}

describe('sortPermissions', () => {
  it('orders the catalog by module, then by Spanish label', () => {
    expect(
      sortPermissions([
        { module: 'roles', label: 'Ver roles' },
        { module: 'members', label: 'Crear afiliados' },
        { module: 'members', label: 'Ver afiliados' },
      ]).map((item) => item.label),
    ).toEqual(['Crear afiliados', 'Ver afiliados', 'Ver roles']);
  });
});

describe('sameIdSet', () => {
  it('ignores order', () => {
    expect(sameIdSet([payFees, viewMembers], [viewMembers, payFees])).toBe(
      true,
    );
    expect(sameIdSet([viewMembers], [viewMembers, payFees])).toBe(false);
  });
});

describe('assertSystemRoleMutable', () => {
  const system = { isSystem: true, name: 'Administrador' };

  it('blocks deactivation and rename', () => {
    expect(() =>
      assertSystemRoleMutable(system, { isActive: false }),
    ).toThrow(HttpError);
    expect(() =>
      assertSystemRoleMutable(system, { name: 'Otro' }),
    ).toThrow(/no se cambia/);
  });

  it('allows permission edits that keep the name and the active flag', () => {
    expect(() =>
      assertSystemRoleMutable(system, { name: 'Administrador', isActive: true }),
    ).not.toThrow();
  });
});

describe('createRole', () => {
  beforeEach(() => {
    findPermissionsByIds.mockReset();
    createRoleRecord.mockReset();
    replaceRolePermissions.mockReset();
    findRole.mockReset();
    createAuditLog.mockReset();
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('audits the initial permission set and never marks the role as system', async () => {
    findPermissionsByIds.mockResolvedValue([{ id: viewMembers }]);
    createRoleRecord.mockResolvedValue(roleRow({ permissions: [] }));
    findRole.mockResolvedValue(roleRow());

    const result = await createRole('admin-1', {
      name: 'Caja',
      description: null,
      permissionIds: [viewMembers],
    });

    expect(result.permissionIds).toEqual([viewMembers]);
    expect(createRoleRecord).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Caja', isActive: true }),
      expect.anything(),
    );
    expect(replaceRolePermissions).toHaveBeenCalledWith(
      'role-1',
      [viewMembers],
      expect.anything(),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'role',
        action: 'role.permissions_change',
        detail: expect.objectContaining({ permissionsChanged: true }),
      }),
      expect.anything(),
    );
  });

  it('rejects unknown permissions', async () => {
    findPermissionsByIds.mockResolvedValue([]);
    await expect(
      createRole('admin-1', {
        name: 'Caja',
        description: null,
        permissionIds: [viewMembers],
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(createRoleRecord).not.toHaveBeenCalled();
  });
});

describe('updateRole', () => {
  beforeEach(() => {
    findRole.mockReset();
    findPermissionsByIds.mockReset();
    updateRoleRecord.mockReset();
    replaceRolePermissions.mockReset();
    createAuditLog.mockReset();
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('refuses to deactivate a system role', async () => {
    findRole.mockResolvedValue(
      roleRow({ name: 'Operativo', isSystem: true }),
    );
    await expect(
      updateRole('admin-1', 'role-1', { isActive: false }),
    ).rejects.toMatchObject({ status: 409 });
    expect(updateRoleRecord).not.toHaveBeenCalled();
  });

  it('allows permission changes on a system role and audits them', async () => {
    const current = roleRow({
      name: 'Administrador',
      isSystem: true,
      permissions: [{ permissionId: viewMembers }],
    });
    const next = roleRow({
      name: 'Administrador',
      isSystem: true,
      permissions: [{ permissionId: viewMembers }, { permissionId: payFees }],
    });
    findRole.mockResolvedValueOnce(current).mockResolvedValueOnce(next);
    findPermissionsByIds.mockResolvedValue([
      { id: viewMembers },
      { id: payFees },
    ]);

    const result = await updateRole('admin-1', 'role-1', {
      permissionIds: [payFees, viewMembers],
    });

    expect(result.permissionIds).toEqual([payFees, viewMembers].sort());
    expect(updateRoleRecord).not.toHaveBeenCalled();
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'role.permissions_change',
        detail: expect.objectContaining({ permissionsChanged: true }),
      }),
      expect.anything(),
    );
  });

  it('maps a duplicate name to 409', async () => {
    findRole.mockResolvedValue(roleRow());
    updateRoleRecord.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      updateRole('admin-1', 'role-1', { name: 'Operativo' }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
