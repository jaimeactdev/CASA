import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const roleInclude = {
  permissions: { select: { permissionId: true } },
} as const;

export function listRoles(db: DbClient = prisma) {
  return db.role.findMany({
    include: roleInclude,
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });
}

export function listPermissions(db: DbClient = prisma) {
  return db.permission.findMany({
    select: { id: true, key: true, module: true, label: true },
  });
}

export function findRole(id: string, db: DbClient = prisma) {
  return db.role.findUnique({ where: { id }, include: roleInclude });
}

export function findPermissionsByIds(ids: string[], db: DbClient = prisma) {
  return db.permission.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
}

export function createRoleRecord(
  data: { name: string; description: string | null; isActive: boolean },
  db: DbClient = prisma,
) {
  return db.role.create({
    data: {
      name: data.name,
      description: data.description,
      isActive: data.isActive,
      isSystem: false,
    },
    include: roleInclude,
  });
}

export function updateRoleRecord(
  id: string,
  data: Prisma.RoleUpdateInput,
  db: DbClient = prisma,
) {
  return db.role.update({ where: { id }, data, include: roleInclude });
}

/** Replaces join rows. The role record itself is never deleted. */
export async function replaceRolePermissions(
  roleId: string,
  permissionIds: string[],
  db: DbClient = prisma,
) {
  await db.rolePermission.deleteMany({ where: { roleId } });
  if (permissionIds.length === 0) return;
  await db.rolePermission.createMany({
    data: permissionIds.map((permissionId) => ({ roleId, permissionId })),
  });
}

export function createAuditLog(
  data: {
    userId: string;
    entity: string;
    entityId: string;
    action: string;
    detail: Prisma.InputJsonValue;
  },
  db: DbClient = prisma,
) {
  return db.auditLog.create({ data });
}
