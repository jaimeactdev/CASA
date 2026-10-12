import 'server-only';

import { Prisma, type FeeStatus } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const feeInclude = {
  member: {
    select: {
      id: true,
      memberNumber: true,
      firstNames: true,
      lastNames: true,
    },
  },
  paymentMethod: { select: { id: true, name: true } },
} as const;

export type FeeRow = Prisma.FeeGetPayload<{ include: typeof feeInclude }>;

export type ActiveMemberForFees = Prisma.MemberGetPayload<{
  select: {
    id: true;
    status: true;
    joinedOn: true;
    profile: { select: { percent: true } };
    fees: { select: { periodYear: true; periodMonth: true } };
  };
}>;

export function findSettings(db: DbClient = prisma) {
  return db.settings.findUnique({ where: { id: 1 } });
}

export function listActiveMembersForGeneration(db: DbClient = prisma) {
  return db.member.findMany({
    where: { status: 'ACTIVE' },
    select: {
      id: true,
      status: true,
      joinedOn: true,
      profile: { select: { percent: true } },
      fees: {
        where: { type: 'MONTHLY' },
        select: { periodYear: true, periodMonth: true },
      },
    },
  });
}

export function createMonthlyFees(
  data: Prisma.FeeCreateManyInput[],
  db: DbClient = prisma,
) {
  return db.fee.createMany({ data, skipDuplicates: true });
}

export function markPendingMonthlyOverdue(dueBefore: Date, db: DbClient = prisma) {
  return db.fee.updateMany({
    where: {
      type: 'MONTHLY',
      status: 'PENDING',
      dueLimit: { lt: dueBefore },
    },
    data: { status: 'OVERDUE' },
  });
}

export function listFeesForYear(
  year: number,
  includeOpenEnrollment: boolean,
  db: DbClient = prisma,
) {
  const or: Prisma.FeeWhereInput[] = [
    { type: 'MONTHLY', periodYear: year },
    {
      type: 'ENROLLMENT',
      dueDate: {
        gte: new Date(Date.UTC(year, 0, 1)),
        lt: new Date(Date.UTC(year + 1, 0, 1)),
      },
    },
  ];
  if (includeOpenEnrollment) {
    or.push({ type: 'ENROLLMENT', status: { not: 'PAID' } });
  }
  return db.fee.findMany({
    where: { OR: or },
    include: feeInclude,
  });
}

export function listActivePaymentMethods(db: DbClient = prisma) {
  return db.paymentMethod.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });
}

export function findFeesByIds(ids: string[], db: DbClient = prisma) {
  return db.fee.findMany({
    where: { id: { in: ids } },
    include: feeInclude,
  });
}

export function findFeeById(id: string, db: DbClient = prisma) {
  return db.fee.findUnique({
    where: { id },
    include: feeInclude,
  });
}

export function findPaymentMethod(id: string, db: DbClient = prisma) {
  return db.paymentMethod.findUnique({
    where: { id },
    select: { id: true, name: true, isActive: true },
  });
}

export function markFeePaid(
  id: string,
  data: Prisma.FeeUpdateManyMutationInput,
  db: DbClient = prisma,
) {
  return db.fee.updateMany({
    where: { id, status: { in: ['PENDING', 'OVERDUE'] } },
    data,
  });
}

export function clearFeePayment(
  id: string,
  status: FeeStatus,
  db: DbClient = prisma,
) {
  return db.fee.updateMany({
    where: { id, status: 'PAID' },
    data: {
      status,
      paidOn: null,
      paymentMethodId: null,
      paymentNote: null,
      paidById: null,
      paidAt: null,
      monthsLateCharged: null,
      surchargePercentApplied: null,
      surchargeAmount: null,
      totalPaid: null,
    },
  });
}

export function createFeeAuditLog(
  data: {
    userId: string | null;
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
