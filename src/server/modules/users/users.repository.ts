import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const userSelect = {
  id: true,
  name: true,
  email: true,
  roleId: true,
  isActive: true,
  mustChangePassword: true,
  role: {
    select: { id: true, name: true, isSystem: true, isActive: true },
  },
} as const;

const roleOptionSelect = {
  id: true,
  name: true,
  isSystem: true,
  isActive: true,
} as const;

export function listUsers(db: DbClient = prisma) {
  return db.user.findMany({
    select: userSelect,
    orderBy: { name: 'asc' },
  });
}

export function listRoles(db: DbClient = prisma) {
  return db.role.findMany({
    select: roleOptionSelect,
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });
}

export function findUser(id: string, db: DbClient = prisma) {
  return db.user.findUnique({ where: { id }, select: userSelect });
}

export function findRole(id: string, db: DbClient = prisma) {
  return db.role.findUnique({ where: { id }, select: roleOptionSelect });
}

export function createUserRecord(
  data: {
    name: string;
    email: string;
    passwordHash: string;
    roleId: string;
    isActive: boolean;
    mustChangePassword: boolean;
  },
  db: DbClient = prisma,
) {
  return db.user.create({
    data: {
      name: data.name,
      email: data.email,
      passwordHash: data.passwordHash,
      isActive: data.isActive,
      mustChangePassword: data.mustChangePassword,
      role: { connect: { id: data.roleId } },
    },
    select: userSelect,
  });
}

export function updateUserRecord(
  id: string,
  data: {
    name: string;
    email: string;
    isActive: boolean;
    roleId: string;
    passwordHash?: string;
  },
  db: DbClient = prisma,
) {
  return db.user.update({
    where: { id },
    data: {
      name: data.name,
      email: data.email,
      isActive: data.isActive,
      role: { connect: { id: data.roleId } },
      ...(data.passwordHash
        ? { passwordHash: data.passwordHash, mustChangePassword: true }
        : {}),
    },
    select: userSelect,
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
