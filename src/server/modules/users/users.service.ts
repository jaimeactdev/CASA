import 'server-only';

import { Prisma } from '@prisma/client';
import { hashPassword } from '@/server/auth/password';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  createAuditLog,
  createUserRecord,
  findRole,
  findUser,
  listRoles,
  listUsers,
  updateUserRecord,
  type DbClient,
} from './users.repository';
import type { CreateUserInput, UpdateUserInput } from './users.schema';

/** Seeded name of the system administrator role. It is not a code identifier. */
export const SYSTEM_ADMIN_ROLE_NAME = 'Administrador';

export type UserDto = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleIsSystem: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
};

export type RoleOptionDto = {
  id: string;
  name: string;
  isActive: boolean;
  isSystem: boolean;
};

export type UsersPageDto = {
  users: UserDto[];
  roles: RoleOptionDto[];
};

type UserRow = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  isActive: boolean;
  mustChangePassword: boolean;
  role: { id: string; name: string; isSystem: boolean; isActive: boolean };
};

export function toUserDto(row: UserRow): UserDto {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    roleId: row.roleId,
    roleName: row.role.name,
    roleIsSystem: row.role.isSystem,
    isActive: row.isActive,
    mustChangePassword: row.mustChangePassword,
  };
}

export function toRoleOption(row: {
  id: string;
  name: string;
  isActive: boolean;
  isSystem: boolean;
}): RoleOptionDto {
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    isSystem: row.isSystem,
  };
}

export function assertSelfUpdateAllowed(input: {
  actorId: string;
  targetId: string;
  targetRoleName: string;
  targetRoleIsSystem: boolean;
  currentRoleId: string;
  nextRoleId?: string;
  nextIsActive?: boolean;
}): void {
  if (input.actorId !== input.targetId) return;
  if (input.nextIsActive === false) {
    throw new HttpError(409, 'No puedes desactivar tu propio usuario.');
  }
  const leavingAdmin =
    input.nextRoleId !== undefined &&
    input.nextRoleId !== input.currentRoleId &&
    input.targetRoleIsSystem &&
    input.targetRoleName === SYSTEM_ADMIN_ROLE_NAME;
  if (leavingAdmin) {
    throw new HttpError(409, 'No puedes quitarte el rol Administrador.');
  }
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function write<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isUniqueConstraint(error)) {
      throw new HttpError(409, 'Ya existe un usuario con ese correo.');
    }
    throw error;
  }
}

async function requireAssignableRole(roleId: string, db: DbClient) {
  const role = await findRole(roleId, db);
  if (!role) {
    throw new HttpError(404, 'Ese rol no existe.');
  }
  if (!role.isActive) {
    throw new HttpError(409, 'Ese rol está inactivo y no se puede asignar.');
  }
  return role;
}

export async function getUsersPage(): Promise<UsersPageDto> {
  const [users, roles] = await Promise.all([listUsers(), listRoles()]);
  return {
    users: users.map(toUserDto),
    roles: roles.map(toRoleOption),
  };
}

export async function createUser(
  actorId: string,
  input: CreateUserInput,
): Promise<UserDto> {
  const passwordHash = await hashPassword(input.password);
  return write(() =>
    prisma.$transaction(async (tx) => {
      const role = await requireAssignableRole(input.roleId, tx);
      const created = await createUserRecord(
        {
          name: input.name,
          email: input.email,
          passwordHash,
          roleId: role.id,
          isActive: input.isActive ?? true,
          mustChangePassword: true,
        },
        tx,
      );
      const dto = toUserDto(created);
      await createAuditLog(
        {
          userId: actorId,
          entity: 'user',
          entityId: created.id,
          action: 'user.create',
          detail: { after: dto },
        },
        tx,
      );
      return dto;
    }),
  );
}

export async function updateUser(
  actorId: string,
  id: string,
  input: UpdateUserInput,
): Promise<UserDto> {
  const passwordHash = input.password
    ? await hashPassword(input.password)
    : undefined;

  return write(() =>
    prisma.$transaction(async (tx) => {
      const current = await findUser(id, tx);
      if (!current) {
        throw new HttpError(404, 'Ese usuario no existe.');
      }

      const nextRole =
        input.roleId && input.roleId !== current.roleId
          ? await requireAssignableRole(input.roleId, tx)
          : current.role;

      assertSelfUpdateAllowed({
        actorId,
        targetId: current.id,
        targetRoleName: current.role.name,
        targetRoleIsSystem: current.role.isSystem,
        currentRoleId: current.roleId,
        nextRoleId: input.roleId,
        nextIsActive: input.isActive,
      });

      const name = input.name ?? current.name;
      const email = input.email ?? current.email;
      const isActive = input.isActive ?? current.isActive;
      const updated = await updateUserRecord(
        id,
        {
          name,
          email,
          isActive,
          roleId: nextRole.id,
          ...(passwordHash ? { passwordHash } : {}),
        },
        tx,
      );

      const before = toUserDto(current);
      const after = toUserDto(updated);
      const nameChanged = name !== current.name;
      const emailChanged = email !== current.email;
      const activated = !current.isActive && isActive;
      const deactivated = current.isActive && !isActive;
      const roleChanged = nextRole.id !== current.roleId;

      if (nameChanged || emailChanged || activated) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'user',
            entityId: id,
            action: 'user.update',
            detail: { before, after },
          },
          tx,
        );
      }
      if (deactivated) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'user',
            entityId: id,
            action: 'user.deactivate',
            detail: {
              before: {
                name: current.name,
                email: current.email,
                isActive: true,
              },
              after: { name: after.name, email: after.email, isActive: false },
            },
          },
          tx,
        );
      }
      if (roleChanged) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'user',
            entityId: id,
            action: 'user.role_change',
            detail: {
              before: { roleId: current.roleId, roleName: current.role.name },
              after: { roleId: nextRole.id, roleName: nextRole.name },
            },
          },
          tx,
        );
      }
      if (passwordHash) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'user',
            entityId: id,
            action: 'user.password_reset',
            detail: { mustChangePassword: true },
          },
          tx,
        );
      }

      return after;
    }),
  );
}
