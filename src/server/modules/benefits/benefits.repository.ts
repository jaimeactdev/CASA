import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

export function listBenefits(db: DbClient = prisma) {
  return db.benefit.findMany({ orderBy: { name: 'asc' } });
}

export function findBenefit(id: string, db: DbClient = prisma) {
  return db.benefit.findUnique({ where: { id } });
}

export function createBenefitRecord(
  data: Prisma.BenefitCreateInput,
  db: DbClient = prisma,
) {
  return db.benefit.create({ data });
}

export function updateBenefitRecord(
  id: string,
  data: Prisma.BenefitUpdateInput,
  db: DbClient = prisma,
) {
  return db.benefit.update({ where: { id }, data });
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
