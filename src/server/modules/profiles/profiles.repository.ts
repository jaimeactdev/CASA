import 'server-only';

import { Prisma } from '@prisma/client';
import { prisma } from '@/server/db/prisma';

export type DbClient = Prisma.TransactionClient | typeof prisma;

const profileInclude = {
  benefits: {
    select: {
      benefitId: true,
      benefit: { select: { id: true, name: true } },
    },
  },
} as const;

export function findMinimumWage(db: DbClient = prisma) {
  return db.settings.findUnique({
    where: { id: 1 },
    select: { minimumWage: true },
  });
}

export function listProfiles(db: DbClient = prisma) {
  return db.membershipProfile.findMany({
    include: profileInclude,
    orderBy: { name: 'asc' },
  });
}

export function listBenefitOptions(db: DbClient = prisma) {
  return db.benefit.findMany({
    select: { id: true, name: true, isActive: true },
    orderBy: { name: 'asc' },
  });
}

export function findProfile(id: string, db: DbClient = prisma) {
  return db.membershipProfile.findUnique({
    where: { id },
    include: profileInclude,
  });
}

export function findBenefitsByIds(ids: string[], db: DbClient = prisma) {
  return db.benefit.findMany({
    where: { id: { in: ids } },
    select: { id: true },
  });
}

export function createProfileRecord(
  data: { name: string; percent: Prisma.Decimal; isActive: boolean },
  db: DbClient = prisma,
) {
  return db.membershipProfile.create({ data, include: profileInclude });
}

export function updateProfileRecord(
  id: string,
  data: Prisma.MembershipProfileUpdateInput,
  db: DbClient = prisma,
) {
  return db.membershipProfile.update({
    where: { id },
    data,
    include: profileInclude,
  });
}

/** Replaces join rows. The profile record itself is never deleted. */
export async function replaceProfileBenefits(
  profileId: string,
  benefitIds: string[],
  db: DbClient = prisma,
) {
  await db.profileBenefit.deleteMany({ where: { profileId } });
  if (benefitIds.length === 0) return;
  await db.profileBenefit.createMany({
    data: benefitIds.map((benefitId) => ({ profileId, benefitId })),
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
