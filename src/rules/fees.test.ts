import { describe, expect, it } from 'vitest';
import { toPercentHundredths } from './money';
import {
  canGenerateMonthlyFee,
  countPaidMonthlyFeesInYear,
  freezePayment,
  isMemberInArrears,
  isValidPaymentDate,
  periodDates,
  quoteFullFee,
  quoteMonthlyFee,
  resolveFeeCharge,
  resolveUnpaidStatus,
  sumTotalPaid,
} from './fees';

const SMMLV = 1_000_000;
const PROFILE_1_70 = toPercentHundredths('1.70');
const FIRST_FEE_50 = toPercentHundredths('50');
const SURCHARGE_0_50 = toPercentHundredths('0.50');

const october = { year: 2026, month: 10, day: 16 };

function monthlyCharge(
  today: { year: number; month: number; day: number },
  surchargePercent = SURCHARGE_0_50,
  extras: Partial<Parameters<typeof resolveFeeCharge>[0]> = {},
) {
  const { dueLimit } = periodDates(2026, 10, 3);
  return resolveFeeCharge({
    type: 'MONTHLY',
    isPaid: false,
    baseAmount: 17_000,
    dueLimit,
    today,
    periodYear: 2026,
    periodMonth: 10,
    minimumWageUsed: SMMLV,
    surchargePercent,
    ...extras,
  });
}

describe('quoteFullFee / quoteMonthlyFee (§8.1)', () => {
  it('computes the 1,70% sample fee as $17.000', () => {
    expect(quoteFullFee(SMMLV, PROFILE_1_70)).toBe(17_000);
  });

  it('reduces the first fee when joined after the cutoff day (16 > 15)', () => {
    expect(
      quoteMonthlyFee({
        minimumWage: SMMLV,
        profilePercent: PROFILE_1_70,
        isFirstMonthlyFee: true,
        joinedOn: october,
        firstFeeCutoffDay: 15,
        firstFeePercent: FIRST_FEE_50,
      }),
    ).toEqual({
      fullFee: 17_000,
      baseAmount: 8_500,
      isReduced: true,
      reductionPercent: FIRST_FEE_50,
    });
  });

  it('keeps the full first fee when joined on the cutoff day', () => {
    expect(
      quoteMonthlyFee({
        minimumWage: SMMLV,
        profilePercent: PROFILE_1_70,
        isFirstMonthlyFee: true,
        joinedOn: { year: 2026, month: 10, day: 15 },
        firstFeeCutoffDay: 15,
        firstFeePercent: FIRST_FEE_50,
      }),
    ).toMatchObject({ baseAmount: 17_000, isReduced: false, reductionPercent: null });
  });

  it('does not reduce a later month even if the join day was after cutoff', () => {
    expect(
      quoteMonthlyFee({
        minimumWage: SMMLV,
        profilePercent: PROFILE_1_70,
        isFirstMonthlyFee: false,
        joinedOn: october,
        firstFeeCutoffDay: 15,
        firstFeePercent: FIRST_FEE_50,
      }),
    ).toMatchObject({ baseAmount: 17_000, isReduced: false });
  });
});

describe('periodDates and unpaid status (§8.2)', () => {
  it('sets due date to the last day of the period and due limit + grace', () => {
    expect(periodDates(2026, 10, 3)).toEqual({
      dueDate: { year: 2026, month: 10, day: 31 },
      dueLimit: { year: 2026, month: 11, day: 3 },
    });
  });

  it('stays PENDING through 3 November and turns OVERDUE on 4 November', () => {
    const dueLimit = { year: 2026, month: 11, day: 3 };
    expect(
      resolveUnpaidStatus('MONTHLY', dueLimit, { year: 2026, month: 11, day: 3 }),
    ).toBe('PENDING');
    expect(
      resolveUnpaidStatus('MONTHLY', dueLimit, { year: 2026, month: 11, day: 4 }),
    ).toBe('OVERDUE');
  });

  it('never marks an enrollment fee OVERDUE', () => {
    expect(
      resolveUnpaidStatus(
        'ENROLLMENT',
        { year: 2026, month: 10, day: 16 },
        { year: 2026, month: 12, day: 1 },
      ),
    ).toBe('PENDING');
  });
});

describe('resolveFeeCharge (§8.2 sample)', () => {
  it('keeps 0 months late until the due limit', () => {
    expect(monthlyCharge({ year: 2026, month: 11, day: 3 })).toMatchObject({
      status: 'PENDING',
      monthsLate: 0,
      surcharge: 0,
      total: 17_000,
    });
  });

  it('charges 1 month late on 4 November', () => {
    expect(monthlyCharge({ year: 2026, month: 11, day: 4 })).toEqual({
      status: 'OVERDUE',
      monthsLate: 1,
      unitSurcharge: 5_000,
      surcharge: 5_000,
      total: 22_000,
    });
  });

  it('charges 2 months late on 1 December: $17.000 + $10.000 = $27.000', () => {
    expect(monthlyCharge({ year: 2026, month: 12, day: 1 })).toEqual({
      status: 'OVERDUE',
      monthsLate: 2,
      unitSurcharge: 5_000,
      surcharge: 10_000,
      total: 27_000,
    });
  });

  it('leaves the total unchanged when the surcharge percent is 0', () => {
    expect(monthlyCharge({ year: 2026, month: 12, day: 1 }, 0)).toMatchObject({
      status: 'OVERDUE',
      monthsLate: 2,
      surcharge: 0,
      total: 17_000,
    });
  });

  it('freezes the surcharge of a paid fee so it does not keep growing', () => {
    const overdueInDecember = monthlyCharge({ year: 2026, month: 12, day: 1 });
    const frozen = freezePayment(overdueInDecember, SURCHARGE_0_50);
    expect(frozen).toEqual({
      monthsLateCharged: 2,
      surchargePercentApplied: SURCHARGE_0_50,
      surchargeAmount: 10_000,
      totalPaid: 27_000,
    });

    const later = monthlyCharge({ year: 2027, month: 3, day: 1 }, SURCHARGE_0_50, {
      isPaid: true,
      frozen: {
        monthsLateCharged: frozen.monthsLateCharged,
        surchargeAmount: frozen.surchargeAmount,
      },
    });
    expect(later).toMatchObject({
      status: 'PAID',
      monthsLate: 2,
      surcharge: 10_000,
      total: 27_000,
    });
  });

  it('never adds surcharge to an unpaid enrollment fee', () => {
    const charge = resolveFeeCharge({
      type: 'ENROLLMENT',
      isPaid: false,
      baseAmount: 20_000,
      dueLimit: october,
      today: { year: 2026, month: 12, day: 1 },
      periodYear: null,
      periodMonth: null,
      minimumWageUsed: 0,
      surchargePercent: SURCHARGE_0_50,
    });
    expect(charge).toMatchObject({
      status: 'PENDING',
      monthsLate: 0,
      surcharge: 0,
      total: 20_000,
    });
  });
});

describe('canGenerateMonthlyFee (§8.1 / §8.5)', () => {
  const today = { year: 2026, month: 11, day: 4 };

  it('generates only the current month for an ACTIVE member', () => {
    expect(
      canGenerateMonthlyFee({
        memberStatus: 'ACTIVE',
        joinedOn: october,
        periodYear: 2026,
        periodMonth: 11,
        today,
      }),
    ).toBe(true);
  });

  it('does not generate a future month or a month before joinedOn', () => {
    expect(
      canGenerateMonthlyFee({
        memberStatus: 'ACTIVE',
        joinedOn: october,
        periodYear: 2026,
        periodMonth: 12,
        today,
      }),
    ).toBe(false);
    expect(
      canGenerateMonthlyFee({
        memberStatus: 'ACTIVE',
        joinedOn: { year: 2026, month: 11, day: 20 },
        periodYear: 2026,
        periodMonth: 10,
        today: { year: 2026, month: 10, day: 10 },
      }),
    ).toBe(false);
  });

  it('does not generate while SUSPENDED or RETIRED', () => {
    expect(
      canGenerateMonthlyFee({
        memberStatus: 'SUSPENDED',
        joinedOn: october,
        periodYear: 2026,
        periodMonth: 11,
        today,
      }),
    ).toBe(false);
    expect(
      canGenerateMonthlyFee({
        memberStatus: 'RETIRED',
        joinedOn: october,
        periodYear: 2026,
        periodMonth: 11,
        today,
      }),
    ).toBe(false);
  });
});

describe('derived member totals (§8.6 / §8.7)', () => {
  it('counts a reduced monthly fee as one paid month and ignores enrollment', () => {
    const fees = [
      { type: 'MONTHLY' as const, status: 'PAID' as const, periodYear: 2026, totalPaid: 8_500 },
      { type: 'ENROLLMENT' as const, status: 'PAID' as const, periodYear: null, totalPaid: 20_000 },
      { type: 'MONTHLY' as const, status: 'PAID' as const, periodYear: 2025, totalPaid: 17_000 },
    ];
    expect(countPaidMonthlyFeesInYear(fees, 2026)).toBe(1);
    expect(sumTotalPaid(fees)).toBe(45_500);
  });

  it('marks mora only from monthly OVERDUE fees', () => {
    expect(
      isMemberInArrears([
        { type: 'ENROLLMENT', status: 'PENDING' },
        { type: 'MONTHLY', status: 'OVERDUE' },
      ]),
    ).toBe(true);
    expect(
      isMemberInArrears([
        { type: 'ENROLLMENT', status: 'PENDING' },
        { type: 'MONTHLY', status: 'PENDING' },
      ]),
    ).toBe(false);
  });

  it('rejects a payment date after today in Colombia', () => {
    expect(
      isValidPaymentDate(
        { year: 2026, month: 11, day: 5 },
        { year: 2026, month: 11, day: 4 },
      ),
    ).toBe(false);
    expect(
      isValidPaymentDate(
        { year: 2026, month: 11, day: 4 },
        { year: 2026, month: 11, day: 4 },
      ),
    ).toBe(true);
  });
});
