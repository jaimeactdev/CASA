import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

export function findSettings(db: DbClient = prisma) {
  return db.settings.findUnique({ where: { id: 1 } });
}

export function updateSettingsRecord(
  data: Prisma.SettingsUpdateInput,
  db: DbClient = prisma,
) {
  return db.settings.update({ where: { id: 1 }, data });
}

export function listActiveProfiles(db: DbClient = prisma) {
  return db.membershipProfile.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    select: { id: true, name: true, percent: true },
  });
}

export function listPaymentMethods(
  activeOnly: boolean,
  db: DbClient = prisma,
) {
  return db.paymentMethod.findMany({
    where: activeOnly ? { isActive: true } : undefined,
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export function findPaymentMethod(id: string, db: DbClient = prisma) {
  return db.paymentMethod.findUnique({ where: { id } });
}

export function maxPaymentMethodSortOrder(db: DbClient = prisma) {
  return db.paymentMethod.aggregate({ _max: { sortOrder: true } });
}

export function createPaymentMethodRecord(
  data: Prisma.PaymentMethodCreateInput,
  db: DbClient = prisma,
) {
  return db.paymentMethod.create({ data });
}

export function updatePaymentMethodRecord(
  id: string,
  data: Prisma.PaymentMethodUpdateInput,
  db: DbClient = prisma,
) {
  return db.paymentMethod.update({ where: { id }, data });
}

export function createAuditLog(
  data: Prisma.AuditLogCreateInput,
  db: DbClient = prisma,
) {
  return db.auditLog.create({ data });
}
