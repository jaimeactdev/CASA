import {
  addDays,
  calendarMonthsBetween,
  isAfter,
  isOnOrBefore,
  lastDayOfMonth,
  yearMonthOf,
  type CalendarDate,
  type YearMonth,
} from './calendar';
import { applyPercent, type PercentHundredths } from './money';

export type FeeType = 'MONTHLY' | 'ENROLLMENT';
export type FeeStatus = 'PENDING' | 'OVERDUE' | 'PAID';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'RETIRED';

export type MonthlyFeeQuoteInput = {
  minimumWage: number;
  profilePercent: PercentHundredths;
  isFirstMonthlyFee: boolean;
  joinedOn: CalendarDate;
  firstFeeCutoffDay: number;
  firstFeePercent: PercentHundredths;
};

export type MonthlyFeeQuote = {
  fullFee: number;
  baseAmount: number;
  isReduced: boolean;
  reductionPercent: PercentHundredths | null;
};

export type PeriodDates = {
  dueDate: CalendarDate;
  dueLimit: CalendarDate;
};

export type FeeChargeInput = {
  type: FeeType;
  isPaid: boolean;
  baseAmount: number;
  dueLimit: CalendarDate;
  today: CalendarDate;
  periodYear: number | null;
  periodMonth: number | null;
  minimumWageUsed: number;
  surchargePercent: PercentHundredths;
  frozen?: {
    monthsLateCharged: number;
    surchargeAmount: number;
  } | null;
};

export type FeeCharge = {
  status: FeeStatus;
  monthsLate: number;
  unitSurcharge: number;
  surcharge: number;
  total: number;
};

export type PaidFeeSnapshot = {
  type: FeeType;
  status: FeeStatus;
  periodYear: number | null;
  totalPaid: number | null;
};

/** Full monthly fee: roundPesos(minimumWage × profilePercent / 100). */
export function quoteFullFee(
  minimumWage: number,
  profilePercent: PercentHundredths,
): number {
  return applyPercent(minimumWage, profilePercent);
}

/**
 * Monthly fee at generation time. The first fee is reduced only when
 * `joinedOn.day > firstFeeCutoffDay` (§8.1).
 */
export function quoteMonthlyFee(input: MonthlyFeeQuoteInput): MonthlyFeeQuote {
  const fullFee = quoteFullFee(input.minimumWage, input.profilePercent);
  const reduceFirst =
    input.isFirstMonthlyFee && input.joinedOn.day > input.firstFeeCutoffDay;

  if (!reduceFirst) {
    return {
      fullFee,
      baseAmount: fullFee,
      isReduced: false,
      reductionPercent: null,
    };
  }

  return {
    fullFee,
    baseAmount: applyPercent(fullFee, input.firstFeePercent),
    isReduced: true,
    reductionPercent: input.firstFeePercent,
  };
}

export function periodDates(
  periodYear: number,
  periodMonth: number,
  graceDays: number,
): PeriodDates {
  if (!Number.isInteger(graceDays) || graceDays < 0) {
    throw new Error('graceDays must be a non-negative integer.');
  }
  const dueDate = lastDayOfMonth(periodYear, periodMonth);
  return { dueDate, dueLimit: addDays(dueDate, graceDays) };
}

export function resolveUnpaidStatus(
  type: FeeType,
  dueLimit: CalendarDate,
  today: CalendarDate,
): Exclude<FeeStatus, 'PAID'> {
  if (type === 'ENROLLMENT') {
    return 'PENDING';
  }
  return isOnOrBefore(today, dueLimit) ? 'PENDING' : 'OVERDUE';
}

function monthsLateWhenOverdue(
  periodYear: number,
  periodMonth: number,
  today: CalendarDate,
): number {
  const period: YearMonth = { year: periodYear, month: periodMonth };
  return Math.max(1, calendarMonthsBetween(period, yearMonthOf(today)));
}

/**
 * Status, surcharge and total for one fee. Paid fees keep the frozen
 * values; unpaid monthly fees reread the current surcharge percent (§8.2).
 */
export function resolveFeeCharge(input: FeeChargeInput): FeeCharge {
  if (input.isPaid) {
    const monthsLate = input.frozen?.monthsLateCharged ?? 0;
    const surcharge = input.frozen?.surchargeAmount ?? 0;
    return {
      status: 'PAID',
      monthsLate,
      unitSurcharge: 0,
      surcharge,
      total: input.baseAmount + surcharge,
    };
  }

  if (input.type === 'ENROLLMENT' || !isAfter(input.today, input.dueLimit)) {
    return {
      status: resolveUnpaidStatus(input.type, input.dueLimit, input.today),
      monthsLate: 0,
      unitSurcharge: 0,
      surcharge: 0,
      total: input.baseAmount,
    };
  }

  if (input.periodYear == null || input.periodMonth == null) {
    throw new Error('Monthly fees require a period year and month.');
  }

  const monthsLate = monthsLateWhenOverdue(
    input.periodYear,
    input.periodMonth,
    input.today,
  );
  const unitSurcharge = applyPercent(
    input.minimumWageUsed,
    input.surchargePercent,
  );
  const surcharge = monthsLate * unitSurcharge;

  return {
    status: 'OVERDUE',
    monthsLate,
    unitSurcharge,
    surcharge,
    total: input.baseAmount + surcharge,
  };
}

export function freezePayment(
  charge: Pick<FeeCharge, 'monthsLate' | 'surcharge' | 'total'>,
  surchargePercent: PercentHundredths,
): {
  monthsLateCharged: number;
  surchargePercentApplied: PercentHundredths;
  surchargeAmount: number;
  totalPaid: number;
} {
  return {
    monthsLateCharged: charge.monthsLate,
    surchargePercentApplied: surchargePercent,
    surchargeAmount: charge.surcharge,
    totalPaid: charge.total,
  };
}

/**
 * Only the current month, only ACTIVE members, never before joinedOn (§8.1).
 */
export function canGenerateMonthlyFee(input: {
  memberStatus: MemberStatus;
  joinedOn: CalendarDate;
  periodYear: number;
  periodMonth: number;
  today: CalendarDate;
}): boolean {
  if (input.memberStatus !== 'ACTIVE') {
    return false;
  }

  const current = yearMonthOf(input.today);
  if (
    input.periodYear !== current.year ||
    input.periodMonth !== current.month
  ) {
    return false;
  }

  const joined = yearMonthOf(input.joinedOn);
  return (
    calendarMonthsBetween(joined, {
      year: input.periodYear,
      month: input.periodMonth,
    }) >= 0
  );
}

export function isMemberInArrears(
  fees: readonly { type: FeeType; status: FeeStatus }[],
): boolean {
  return fees.some(
    (fee) => fee.type === 'MONTHLY' && fee.status === 'OVERDUE',
  );
}

export function countPaidMonthlyFeesInYear(
  fees: readonly PaidFeeSnapshot[],
  year: number,
): number {
  return fees.filter(
    (fee) =>
      fee.type === 'MONTHLY' &&
      fee.status === 'PAID' &&
      fee.periodYear === year,
  ).length;
}

export function sumTotalPaid(fees: readonly PaidFeeSnapshot[]): number {
  return fees.reduce((sum, fee) => {
    if (fee.status !== 'PAID') return sum;
    return sum + (fee.totalPaid ?? 0);
  }, 0);
}

export function isValidPaymentDate(
  paidOn: CalendarDate,
  today: CalendarDate,
): boolean {
  return isOnOrBefore(paidOn, today);
}
