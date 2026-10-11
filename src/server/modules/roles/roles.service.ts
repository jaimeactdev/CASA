import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  createAuditLog,
  createRoleRecord,
  findPermissionsByIds,
  findRole,
  listPermissions,
  listRoles,
  replaceRolePermissions,
  updateRoleRecord,
  type DbClient,
} from './roles.repository';
import type { CreateRoleInput, UpdateRoleInput } from './roles.schema';

const MODULE_ORDER = [
  'members',
  'fees',
  'benefits',
  'profiles',
  'settings',
  'users',
  'roles',
];

export type RoleDto = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionIds: string[];
};

export type PermissionDto = {
  id: string;
  key: string;
  module: string;
  label: string;
};

type RoleRow = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: { permissionId: string }[];
};

export function toRoleDto(row: RoleRow): RoleDto {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    isSystem: row.isSystem,
    isActive: row.isActive,
    permissionIds: row.permissions.map((item) => item.permissionId).sort(),
  };
}

export function sortPermissions<T extends { module: string; label: string }>(
  items: T[],
): T[] {
  return [...items].sort((left, right) => {
    const leftIndex = MODULE_ORDER.indexOf(left.module);
    const rightIndex = MODULE_ORDER.indexOf(right.module);
    const leftOrder = leftIndex === -1 ? MODULE_ORDER.length : leftIndex;
    const rightOrder = rightIndex === -1 ? MODULE_ORDER.length : rightIndex;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    return left.label.localeCompare(right.label, 'es');
  });
}

export function sameIdSet(left: string[], right: string[]): boolean {
  if (left.length !== right.length) return false;
  const sortedLeft = [...left].sort();
  const sortedRight = [...right].sort();
  return sortedLeft.every((id, index) => id === sortedRight[index]);
}

export function assertSystemRoleMutable(
  role: { isSystem: boolean; name: string },
  input: { name?: string; isActive?: boolean },
): void {
  if (!role.isSystem) return;
  if (input.isActive === false) {
    throw new HttpError(409, 'Los roles de sistema no se desactivan.');
  }
  if (input.name !== undefined && input.name !== role.name) {
    throw new HttpError(409, 'El nombre de un rol de sistema no se cambia.');
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
      throw new HttpError(409, 'Ya existe un rol con ese nombre.');
    }
    throw error;
  }
}

async function assertPermissionsExist(ids: string[], db: DbClient) {
  if (ids.length === 0) return;
  const found = await findPermissionsByIds(ids, db);
  if (found.length !== ids.length) {
    throw new HttpError(400, 'Hay permisos que no existen.');
  }
}

function roleChanged(before: RoleDto, after: RoleDto): boolean {
  return (
    before.name !== after.name ||
    before.description !== after.description ||
    before.isActive !== after.isActive ||
    !sameIdSet(before.permissionIds, after.permissionIds)
  );
}

export async function getRoles(): Promise<RoleDto[]> {
  const rows = await listRoles();
  return rows.map(toRoleDto);
}

export async function getPermissions(): Promise<PermissionDto[]> {
  const rows = await listPermissions();
  return sortPermissions(rows);
}

export async function createRole(
  actorId: string,
  input: CreateRoleInput,
): Promise<RoleDto> {
  return write(() =>
    prisma.$transaction(async (tx) => {
      await assertPermissionsExist(input.permissionIds, tx);
      const created = await createRoleRecord(
        {
          name: input.name,
          description: input.description ?? null,
          isActive: input.isActive ?? true,
        },
        tx,
      );
      await replaceRolePermissions(created.id, input.permissionIds, tx);
      const fresh = await findRole(created.id, tx);
      if (!fresh) {
        throw new HttpError(404, 'Ese rol no existe.');
      }
      const after = toRoleDto(fresh);
      await createAuditLog(
        {
          userId: actorId,
          entity: 'role',
          entityId: created.id,
          action: 'role.permissions_change',
          detail: {
            before: { permissionIds: [] },
            after,
            permissionsChanged: true,
          },
        },
        tx,
      );
      return after;
    }),
  );
}

export async function updateRole(
  actorId: string,
  id: string,
  input: UpdateRoleInput,
): Promise<RoleDto> {
  return write(() =>
    prisma.$transaction(async (tx) => {
      const current = await findRole(id, tx);
      if (!current) {
        throw new HttpError(404, 'Ese rol no existe.');
      }
      assertSystemRoleMutable(current, input);
      if (input.permissionIds) {
        await assertPermissionsExist(input.permissionIds, tx);
      }

      const data: Prisma.RoleUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.description !== undefined) data.description = input.description;
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (Object.keys(data).length > 0) {
        await updateRoleRecord(id, data, tx);
      }
      if (input.permissionIds) {
        await replaceRolePermissions(id, input.permissionIds, tx);
      }

      const fresh = await findRole(id, tx);
      if (!fresh) {
        throw new HttpError(404, 'Ese rol no existe.');
      }
      const before = toRoleDto(current);
      const after = toRoleDto(fresh);
      if (roleChanged(before, after)) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'role',
            entityId: id,
            action: 'role.permissions_change',
            detail: {
              before,
              after,
              permissionsChanged: !sameIdSet(
                before.permissionIds,
                after.permissionIds,
              ),
            },
          },
          tx,
        );
      }
      return after;
    }),
  );
}
