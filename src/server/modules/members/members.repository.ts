import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const listFeeSelect = {
  type: true,
  status: true,
  totalPaid: true,
  periodYear: true,
} as const;

const listMemberInclude = {
  profile: {
    select: { id: true, name: true, percent: true, isActive: true },
  },
  fees: { select: listFeeSelect },
} as const;

const detailFeeSelect = {
  id: true,
  type: true,
  periodYear: true,
  periodMonth: true,
  minimumWageUsed: true,
  profilePercent: true,
  baseAmount: true,
  isReduced: true,
  reductionPercent: true,
  dueDate: true,
  dueLimit: true,
  status: true,
  paidOn: true,
  paymentNote: true,
  monthsLateCharged: true,
  surchargePercentApplied: true,
  surchargeAmount: true,
  totalPaid: true,
  paymentMethod: { select: { name: true } },
} as const;

const detailFeesQuery = {
  select: detailFeeSelect,
  orderBy: [
    { type: 'asc' },
    { periodYear: 'desc' },
    { periodMonth: 'desc' },
  ] as Prisma.FeeOrderByWithRelationInput[],
};

const detailMemberInclude = {
  profile: {
    select: {
      id: true,
      name: true,
      percent: true,
      isActive: true,
      benefits: {
        select: {
          benefit: {
            select: {
              id: true,
              name: true,
              minPaidFeesInYear: true,
              maxDeliveriesPerYear: true,
              requiresMinimumSetup: true,
              audience: true,
            },
          },
        },
      },
    },
  },
  fees: detailFeesQuery,
  deliveries: {
    where: { isVoided: false },
    select: { benefitId: true, year: true },
  },
  createdBy: { select: { name: true } },
} as const;

export type MemberListRow = Prisma.MemberGetPayload<{
  include: typeof listMemberInclude;
}>;

export type MemberDetailRow = Prisma.MemberGetPayload<{
  include: typeof detailMemberInclude;
}>;

export function findSettings(db: DbClient = prisma) {
  return db.settings.findUnique({ where: { id: 1 } });
}

export function listProfiles(db: DbClient = prisma) {
  return db.membershipProfile.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { name: 'asc' },
  });
}

export function findProfile(id: string, db: DbClient = prisma) {
  return db.membershipProfile.findUnique({
    where: { id },
    select: { id: true, name: true, percent: true, isActive: true },
  });
}

export function listMembers(db: DbClient = prisma) {
  return db.member.findMany({
    include: listMemberInclude,
    orderBy: [{ lastNames: 'asc' }, { firstNames: 'asc' }],
  });
}

export function findMember(id: string, db: DbClient = prisma) {
  return db.member.findUnique({
    where: { id },
    include: detailMemberInclude,
  });
}

export function findMemberByDocument(
  documentType: Prisma.MemberCreateInput['documentType'],
  documentNumber: string,
  db: DbClient = prisma,
) {
  return db.member.findUnique({
    where: {
      documentType_documentNumber: { documentType, documentNumber },
    },
    select: { id: true },
  });
}

export function createMemberRecord(
  data: Prisma.MemberCreateInput,
  db: DbClient = prisma,
) {
  return db.member.create({ data, include: detailMemberInclude });
}

export function updateMemberRecord(
  id: string,
  data: Prisma.MemberUpdateInput,
  db: DbClient = prisma,
) {
  return db.member.update({
    where: { id },
    data,
    include: detailMemberInclude,
  });
}

export function createFeeRecord(
  data: Prisma.FeeUncheckedCreateInput,
  db: DbClient = prisma,
) {
  return db.fee.create({ data, select: { id: true, type: true, baseAmount: true } });
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
