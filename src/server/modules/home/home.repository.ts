import 'server-only';

import { prisma } from '@/server/db/prisma';

/**
 * Active members only. A suspended or retired member can still owe fees,
 * but that debt is not "activos en mora".
 */
export function countActiveMembers() {
  return prisma.member.count({ where: { status: 'ACTIVE' } });
}

/**
 * Mora is derived: an active member with at least one overdue monthly fee.
 * The enrollment fee never counts.
 */
export function countActiveMembersInArrears() {
  return prisma.member.count({
    where: {
      status: 'ACTIVE',
      fees: { some: { type: 'MONTHLY', status: 'OVERDUE' } },
    },
  });
}

/** Pending monthly fees of the current period. Enrollment is not a month. */
export function countPendingMonthlyFees(year: number, month: number) {
  return prisma.fee.count({
    where: {
      type: 'MONTHLY',
      periodYear: year,
      periodMonth: month,
      status: 'PENDING',
    },
  });
}

/** Overdue monthly fees of any period, whatever the member status. */
export function countOverdueMonthlyFees() {
  return prisma.fee.count({
    where: { type: 'MONTHLY', status: 'OVERDUE' },
  });
}

export function findMinimumWage() {
  return prisma.settings.findUnique({
    where: { id: 1 },
    select: { minimumWage: true },
  });
}

/** Active benefits whose suggested month is the business month. */
export function listBenefitReminders(month: number) {
  return prisma.benefit.findMany({
    where: { isActive: true, suggestedMonth: month },
    select: { id: true, name: true, suggestedMonth: true },
    orderBy: { name: 'asc' },
  });
}
