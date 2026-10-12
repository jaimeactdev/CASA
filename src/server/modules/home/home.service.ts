import 'server-only';

import { toIsoDate, todayInBogota, yearMonthOf } from '@/rules/calendar';
import { HttpError } from '@/server/http/errors';
import { ensureFeesUpToDate } from '@/server/modules/fees/fees.service';
import {
  countActiveMembers,
  countActiveMembersInArrears,
  countOverdueMonthlyFees,
  countPendingMonthlyFees,
  findMinimumWage,
  listBenefitReminders,
} from './home.repository';

export type BenefitReminderDto = {
  id: string;
  name: string;
  suggestedMonth: number;
};

export type DashboardDto = {
  today: string;
  year: number;
  month: number;
  minimumWage: number;
  activeMembers: number;
  activeMembersInArrears: number;
  pendingFeesThisMonth: number;
  overdueFees: number;
  reminders: BenefitReminderDto[];
};

/**
 * Session-only home summary. Syncs fees first so the overdue counts match
 * the same rules as GET /api/fees and the member file.
 */
export async function getDashboard(
  actorId: string,
  now = new Date(),
): Promise<DashboardDto> {
  await ensureFeesUpToDate(now, { actorId, source: 'request' });
  const today = todayInBogota(now);
  const period = yearMonthOf(today);
  const [
    settings,
    activeMembers,
    activeMembersInArrears,
    pendingFeesThisMonth,
    overdueFees,
    reminders,
  ] = await Promise.all([
    findMinimumWage(),
    countActiveMembers(),
    countActiveMembersInArrears(),
    countPendingMonthlyFees(period.year, period.month),
    countOverdueMonthlyFees(),
    listBenefitReminders(period.month),
  ]);
  if (!settings) {
    throw new HttpError(500, 'No hay parámetros configurados.');
  }
  return {
    today: toIsoDate(today),
    year: period.year,
    month: period.month,
    minimumWage: settings.minimumWage,
    activeMembers,
    activeMembersInArrears,
    pendingFeesThisMonth,
    overdueFees,
    reminders: reminders.flatMap((row) => {
      if (row.suggestedMonth == null) return [];
      return [
        {
          id: row.id,
          name: row.name,
          suggestedMonth: row.suggestedMonth,
        },
      ];
    }),
  };
}
