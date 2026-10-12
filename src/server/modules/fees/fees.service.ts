import 'server-only';

import { timingSafeEqual } from 'node:crypto';
import { Prisma } from '@prisma/client';
import {
  calendarDate,
  parseIsoDate,
  toIsoDate,
  todayInBogota,
  yearMonthOf,
  type CalendarDate,
} from '@/rules/calendar';
import {
  canGenerateMonthlyFee,
  freezePayment,
  isValidPaymentDate,
  periodDates,
  quoteMonthlyFee,
  resolveFeeCharge,
  resolveUnpaidStatus,
  type FeeStatus,
  type FeeType,
} from '@/rules/fees';
import {
  formatPercentHundredths,
  toPercentHundredths,
} from '@/rules/money';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  clearFeePayment,
  createFeeAuditLog,
  createMonthlyFees,
  findFeeById,
  findFeesByIds,
  findPaymentMethod,
  findSettings,
  listActiveMembersForGeneration,
  listActivePaymentMethods,
  listFeesForYear,
  markFeePaid,
  markPendingMonthlyOverdue,
  type DbClient,
  type FeeRow,
} from './fees.repository';
import type { PayFeesInput, RevertFeeInput } from './fees.schema';

export type FeeSyncSource = 'cron' | 'request';

export type EnsureFeesOptions = {
  actorId?: string | null;
  source?: FeeSyncSource;
};

export type FeesSyncResult = {
  created: number;
  markedOverdue: number;
  today: string;
};

export type FeeDto = {
  id: string;
  memberId: string;
  memberNumber: number;
  memberName: string;
  type: FeeType;
  periodYear: number | null;
  periodMonth: number | null;
  baseAmount: number;
  minimumWageUsed: number;
  surchargeAmount: number;
  total: number;
  status: FeeStatus;
  dueDate: string;
  dueLimit: string;
  paidOn: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
};

export type FeesPageDto = {
  today: string;
  year: number;
  minimumWage: number;
  allowMultiFeePayment: boolean;
  surchargePercent: string;
  paymentMethods: { id: string; name: string }[];
  fees: FeeDto[];
};

const UNAUTHORIZED = 'No autorizado.';

function utcDateToCalendar(value: Date): CalendarDate {
  return calendarDate(
    value.getUTCFullYear(),
    value.getUTCMonth() + 1,
    value.getUTCDate(),
  );
}

function calendarToDbDate(date: CalendarDate): Date {
  return new Date(`${toIsoDate(date)}T00:00:00.000Z`);
}

function decimalText(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function assertCronAuthorized(authorization: string | null): void {
  const secret = process.env.CRON_SECRET?.trim();
  const header = authorization?.trim() ?? '';
  if (!secret || !header.startsWith('Bearer ')) {
    throw new HttpError(401, UNAUTHORIZED);
  }
  if (!safeEqual(header.slice('Bearer '.length), secret)) {
    throw new HttpError(401, UNAUTHORIZED);
  }
}

async function requireSettings(db: DbClient) {
  const settings = await findSettings(db);
  if (!settings) {
    throw new HttpError(500, 'No hay parámetros configurados.');
  }
  return settings;
}

function chargeOf(
  fee: Pick<
    FeeRow,
    | 'type'
    | 'status'
    | 'baseAmount'
    | 'dueLimit'
    | 'periodYear'
    | 'periodMonth'
    | 'minimumWageUsed'
    | 'monthsLateCharged'
    | 'surchargeAmount'
  >,
  today: CalendarDate,
  surchargePercent: Prisma.Decimal,
) {
  const isPaid = fee.status === 'PAID';
  return resolveFeeCharge({
    type: fee.type,
    isPaid,
    baseAmount: fee.baseAmount,
    dueLimit: utcDateToCalendar(fee.dueLimit),
    today,
    periodYear: fee.periodYear,
    periodMonth: fee.periodMonth,
    minimumWageUsed: fee.minimumWageUsed,
    surchargePercent: toPercentHundredths(surchargePercent),
    frozen: isPaid
      ? {
          monthsLateCharged: fee.monthsLateCharged ?? 0,
          surchargeAmount: fee.surchargeAmount ?? 0,
        }
      : null,
  });
}

function toFeeDto(
  row: FeeRow,
  today: CalendarDate,
  surchargePercent: Prisma.Decimal,
): FeeDto {
  const charge = chargeOf(row, today, surchargePercent);
  return {
    id: row.id,
    memberId: row.memberId,
    memberNumber: row.member.memberNumber,
    memberName: `${row.member.firstNames} ${row.member.lastNames}`.trim(),
    type: row.type,
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    baseAmount: row.baseAmount,
    minimumWageUsed: row.minimumWageUsed,
    surchargeAmount: charge.surcharge,
    total: charge.total,
    status: charge.status,
    dueDate: toIsoDate(utcDateToCalendar(row.dueDate)),
    dueLimit: toIsoDate(utcDateToCalendar(row.dueLimit)),
    paidOn: row.paidOn ? toIsoDate(utcDateToCalendar(row.paidOn)) : null,
    paymentMethodId: row.paymentMethodId,
    paymentMethodName: row.paymentMethod?.name ?? null,
  };
}

/**
 * Creates the current-month fee for every active member and marks monthly
 * fees past their due limit as overdue. The cron, GET /api/fees and
 * GET /api/members/[id] share this service. Module 8 must call it from
 * GET /api/dashboard as well.
 */
export async function ensureFeesUpToDate(
  now = new Date(),
  options: EnsureFeesOptions = {},
): Promise<FeesSyncResult> {
  const source = options.source ?? 'request';
  const actorId = source === 'cron' ? null : (options.actorId ?? null);
  const today = todayInBogota(now);
  const period = yearMonthOf(today);

  return prisma.$transaction(async (tx) => {
    const settings = await requireSettings(tx);
    let created = 0;

    if (settings.minimumWage > 0) {
      const members = await listActiveMembersForGeneration(tx);
      const pending: Prisma.FeeCreateManyInput[] = [];
      for (const member of members) {
        const joinedOn = utcDateToCalendar(member.joinedOn);
        if (
          !canGenerateMonthlyFee({
            memberStatus: member.status,
            joinedOn,
            periodYear: period.year,
            periodMonth: period.month,
            today,
          })
        ) {
          continue;
        }
        const exists = member.fees.some(
          (fee) =>
            fee.periodYear === period.year && fee.periodMonth === period.month,
        );
        if (exists) continue;

        const quote = quoteMonthlyFee({
          minimumWage: settings.minimumWage,
          profilePercent: toPercentHundredths(member.profile.percent),
          isFirstMonthlyFee: member.fees.length === 0,
          joinedOn,
          firstFeeCutoffDay: settings.firstFeeCutoffDay,
          firstFeePercent: toPercentHundredths(settings.firstFeePercent),
        });
        const dates = periodDates(
          period.year,
          period.month,
          settings.graceDays,
        );
        pending.push({
          memberId: member.id,
          type: 'MONTHLY',
          periodYear: period.year,
          periodMonth: period.month,
          minimumWageUsed: settings.minimumWage,
          profilePercent: member.profile.percent,
          baseAmount: quote.baseAmount,
          isReduced: quote.isReduced,
          reductionPercent:
            quote.reductionPercent == null
              ? null
              : new Prisma.Decimal(
                  formatPercentHundredths(quote.reductionPercent),
                ),
          dueDate: calendarToDbDate(dates.dueDate),
          dueLimit: calendarToDbDate(dates.dueLimit),
          status: resolveUnpaidStatus('MONTHLY', dates.dueLimit, today),
        });
      }
      if (pending.length > 0) {
        const inserted = await createMonthlyFees(pending, tx);
        created = inserted.count;
      }
    }

    const overdue = await markPendingMonthlyOverdue(calendarToDbDate(today), tx);
    if (source === 'cron' || created > 0) {
      await createFeeAuditLog(
        {
          userId: actorId,
          entity: 'fee',
          entityId: `${period.year}-${String(period.month).padStart(2, '0')}`,
          action: 'fee.generate',
          detail: {
            created,
            markedOverdue: overdue.count,
            periodYear: period.year,
            periodMonth: period.month,
            source,
          },
        },
        tx,
      );
    }

    return {
      created,
      markedOverdue: overdue.count,
      today: toIsoDate(today),
    };
  });
}

export async function getFeesPage(
  actorId: string,
  year: number | undefined,
  now = new Date(),
): Promise<FeesPageDto> {
  const today = todayInBogota(now);
  await ensureFeesUpToDate(now, { actorId, source: 'request' });
  const targetYear = year ?? today.year;
  const settings = await requireSettings(prisma);
  const [rows, paymentMethods] = await Promise.all([
    listFeesForYear(targetYear, targetYear === today.year),
    listActivePaymentMethods(),
  ]);
  const fees = rows
    .map((row) => toFeeDto(row, today, settings.surchargePercent))
    .sort((left, right) => {
      const byDue = right.dueDate.localeCompare(left.dueDate);
      if (byDue !== 0) return byDue;
      return left.memberName.localeCompare(right.memberName, 'es');
    });
  return {
    today: toIsoDate(today),
    year: targetYear,
    minimumWage: settings.minimumWage,
    allowMultiFeePayment: settings.allowMultiFeePayment,
    surchargePercent: decimalText(settings.surchargePercent),
    paymentMethods,
    fees,
  };
}

export async function payFees(
  actorId: string,
  input: PayFeesInput,
  now = new Date(),
): Promise<{ updated: number }> {
  const today = todayInBogota(now);
  const paidOn = parseIsoDate(input.paidOn);
  if (!isValidPaymentDate(paidOn, today)) {
    throw new HttpError(400, 'La fecha de pago no puede ser futura.');
  }
  const ids = [...new Set(input.feeIds)];
  if (ids.length !== input.feeIds.length) {
    throw new HttpError(400, 'Hay cuotas repetidas.');
  }
  if (ids.length === 0) {
    throw new HttpError(400, 'Selecciona al menos una cuota.');
  }

  return prisma.$transaction(async (tx) => {
    const settings = await requireSettings(tx);
    if (ids.length > 1 && !settings.allowMultiFeePayment) {
      throw new HttpError(
        409,
        'No está permitido pagar varias cuotas a la vez.',
      );
    }
    const fees = await findFeesByIds(ids, tx);
    if (fees.length !== ids.length) {
      throw new HttpError(404, 'Alguna de esas cuotas no existe.');
    }
    const memberId = fees[0]?.memberId;
    if (!memberId || fees.some((fee) => fee.memberId !== memberId)) {
      throw new HttpError(
        409,
        'Solo se pueden marcar juntas cuotas del mismo afiliado.',
      );
    }
    if (fees.some((fee) => fee.status === 'PAID')) {
      throw new HttpError(409, 'Alguna de esas cuotas ya está pagada.');
    }
    const method = await findPaymentMethod(input.paymentMethodId, tx);
    if (!method?.isActive) {
      throw new HttpError(400, 'El medio de pago no está disponible.');
    }

    const percent = toPercentHundredths(settings.surchargePercent);
    for (const fee of fees) {
      const charge = chargeOf(fee, today, settings.surchargePercent);
      const frozen = freezePayment(charge, percent);
      const updated = await markFeePaid(
        fee.id,
        {
          status: 'PAID',
          paidOn: calendarToDbDate(paidOn),
          paymentMethodId: method.id,
          paymentNote: input.paymentNote ?? null,
          paidById: actorId,
          paidAt: now,
          monthsLateCharged: frozen.monthsLateCharged,
          surchargePercentApplied: new Prisma.Decimal(
            formatPercentHundredths(frozen.surchargePercentApplied),
          ),
          surchargeAmount: frozen.surchargeAmount,
          totalPaid: frozen.totalPaid,
        },
        tx,
      );
      if (updated.count !== 1) {
        throw new HttpError(409, 'Alguna de esas cuotas ya está pagada.');
      }
      await createFeeAuditLog(
        {
          userId: actorId,
          entity: 'fee',
          entityId: fee.id,
          action: 'fee.pay',
          note: input.paymentNote ?? null,
          detail: {
            memberId: fee.memberId,
            baseAmount: fee.baseAmount,
            surchargeAmount: frozen.surchargeAmount,
            totalPaid: frozen.totalPaid,
            monthsLateCharged: frozen.monthsLateCharged,
            surchargePercentApplied: formatPercentHundredths(
              frozen.surchargePercentApplied,
            ),
            paymentMethodId: method.id,
            paymentMethodName: method.name,
            paidOn: input.paidOn,
          },
        },
        tx,
      );
    }
    return { updated: fees.length };
  });
}

export async function revertFee(
  actorId: string,
  id: string,
  input: RevertFeeInput,
  now = new Date(),
): Promise<{ id: string; status: FeeStatus }> {
  const today = todayInBogota(now);
  return prisma.$transaction(async (tx) => {
    const fee = await findFeeById(id, tx);
    if (!fee) throw new HttpError(404, 'Esa cuota no existe.');
    if (fee.status !== 'PAID') {
      throw new HttpError(409, 'Esa cuota no está pagada.');
    }
    const nextStatus = resolveUnpaidStatus(
      fee.type,
      utcDateToCalendar(fee.dueLimit),
      today,
    );
    const cleared = await clearFeePayment(id, nextStatus, tx);
    if (cleared.count !== 1) {
      throw new HttpError(409, 'Esa cuota no está pagada.');
    }
    await createFeeAuditLog(
      {
        userId: actorId,
        entity: 'fee',
        entityId: fee.id,
        action: 'fee.revert',
        note: input.note,
        detail: {
          before: {
            status: fee.status,
            baseAmount: fee.baseAmount,
            surchargeAmount: fee.surchargeAmount,
            totalPaid: fee.totalPaid,
            monthsLateCharged: fee.monthsLateCharged,
            surchargePercentApplied: fee.surchargePercentApplied
              ? decimalText(fee.surchargePercentApplied)
              : null,
            paymentMethodId: fee.paymentMethodId,
            paymentMethodName: fee.paymentMethod?.name ?? null,
            paidOn: fee.paidOn ? toIsoDate(utcDateToCalendar(fee.paidOn)) : null,
            paidById: fee.paidById,
            paidAt: fee.paidAt ? fee.paidAt.toISOString() : null,
          },
          after: { status: nextStatus },
          revertedBy: actorId,
        },
      },
      tx,
    );
    return { id: fee.id, status: nextStatus };
  });
}
