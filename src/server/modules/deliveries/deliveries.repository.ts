import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const deliveryInclude = {
  member: {
    select: {
      id: true,
      memberNumber: true,
      firstNames: true,
      lastNames: true,
    },
  },
  benefit: { select: { id: true, name: true } },
  deliveredBy: { select: { name: true } },
  voidedBy: { select: { name: true } },
} as const;

export type DeliveryRow = Prisma.BenefitDeliveryGetPayload<{
  include: typeof deliveryInclude;
}>;

export type MemberForDelivery = Prisma.MemberGetPayload<{
  select: {
    id: true;
    status: true;
    sex: true;
    profile: { select: { benefits: { select: { benefitId: true } } } };
    fees: { select: { type: true; status: true; periodYear: true } };
  };
}>;

export type BenefitForDelivery = Prisma.BenefitGetPayload<{
  select: {
    id: true;
    name: true;
    isActive: true;
    audience: true;
    minPaidFeesInYear: true;
    maxDeliveriesPerYear: true;
    requiresMinimumSetup: true;
  };
}>;

export function listDeliveriesForYear(
  year: number,
  filters: { benefitId?: string; memberId?: string },
  db: DbClient = prisma,
) {
  return db.benefitDelivery.findMany({
    where: {
      year,
      ...(filters.benefitId ? { benefitId: filters.benefitId } : {}),
      ...(filters.memberId ? { memberId: filters.memberId } : {}),
    },
    include: deliveryInclude,
    orderBy: [{ deliveredOn: 'desc' }, { createdAt: 'desc' }],
  });
}

export function listBenefitOptions(db: DbClient = prisma) {
  return db.benefit.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
}

/**
 * Holds the member row so two deliveries of the same person cannot both
 * pass the annual quota count.
 */
export function lockMemberRow(id: string, db: DbClient = prisma) {
  return db.$queryRaw`SELECT id FROM members WHERE id = ${id}::uuid FOR UPDATE`;
}

export function findMemberForDelivery(id: string, db: DbClient = prisma) {
  return db.member.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      sex: true,
      profile: {
        select: { benefits: { select: { benefitId: true } } },
      },
      fees: {
        select: { type: true, status: true, periodYear: true },
      },
    },
  });
}

export function findBenefitForDelivery(id: string, db: DbClient = prisma) {
  return db.benefit.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      isActive: true,
      audience: true,
      minPaidFeesInYear: true,
      maxDeliveriesPerYear: true,
      requiresMinimumSetup: true,
    },
  });
}

export function countActiveDeliveries(
  memberId: string,
  benefitId: string,
  year: number,
  db: DbClient = prisma,
) {
  return db.benefitDelivery.count({
    where: { memberId, benefitId, year, isVoided: false },
  });
}

export function createDeliveryRecord(
  data: {
    memberId: string;
    benefitId: string;
    year: number;
    deliveredOn: Date;
    deliveredById: string;
    isException: boolean;
    note: string | null;
  },
  db: DbClient = prisma,
) {
  return db.benefitDelivery.create({
    data,
    select: { id: true, year: true, isException: true },
  });
}

export function findDelivery(id: string, db: DbClient = prisma) {
  return db.benefitDelivery.findUnique({
    where: { id },
    include: deliveryInclude,
  });
}

export function markDeliveryVoided(
  id: string,
  data: { voidedById: string; voidedAt: Date; voidNote: string },
  db: DbClient = prisma,
) {
  return db.benefitDelivery.updateMany({
    where: { id, isVoided: false },
    data: {
      isVoided: true,
      voidedById: data.voidedById,
      voidedAt: data.voidedAt,
      voidNote: data.voidNote,
    },
  });
}

export function createDeliveryAuditLog(
  data: {
    userId: string;
    entity: string;
    entityId: string;
    action: string;
    detail: Prisma.InputJsonValue;
    note?: string | null;
  },
  db: DbClient = prisma,
) {
  return db.auditLog.create({ data });
}
