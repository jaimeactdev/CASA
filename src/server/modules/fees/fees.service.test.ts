import { Prisma } from '@prisma/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findSettings = vi.fn();
const listActiveMembersForGeneration = vi.fn();
const createMonthlyFees = vi.fn();
const markPendingMonthlyOverdue = vi.fn();
const listFeesForYear = vi.fn();
const listActivePaymentMethods = vi.fn();
const findFeesByIds = vi.fn();
const findFeeById = vi.fn();
const findPaymentMethod = vi.fn();
const markFeePaid = vi.fn();
const clearFeePayment = vi.fn();
const createFeeAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./fees.repository', () => ({
  findSettings: (...args: unknown[]) => findSettings(...args),
  listActiveMembersForGeneration: (...args: unknown[]) =>
    listActiveMembersForGeneration(...args),
  createMonthlyFees: (...args: unknown[]) => createMonthlyFees(...args),
  markPendingMonthlyOverdue: (...args: unknown[]) =>
    markPendingMonthlyOverdue(...args),
  listFeesForYear: (...args: unknown[]) => listFeesForYear(...args),
  listActivePaymentMethods: (...args: unknown[]) =>
    listActivePaymentMethods(...args),
  findFeesByIds: (...args: unknown[]) => findFeesByIds(...args),
  findFeeById: (...args: unknown[]) => findFeeById(...args),
  findPaymentMethod: (...args: unknown[]) => findPaymentMethod(...args),
  markFeePaid: (...args: unknown[]) => markFeePaid(...args),
  clearFeePayment: (...args: unknown[]) => clearFeePayment(...args),
  createFeeAuditLog: (...args: unknown[]) => createFeeAuditLog(...args),
}));

import {
  assertCronAuthorized,
  ensureFeesUpToDate,
  getFeesPage,
  payFees,
  revertFee,
} from './fees.service';

const oct10 = new Date('2026-10-10T17:00:00.000Z');
const oct16 = new Date('2026-10-16T17:00:00.000Z');
const nov3 = new Date('2026-11-03T17:00:00.000Z');
const nov4 = new Date('2026-11-04T17:00:00.000Z');
const dec1 = new Date('2026-12-01T17:00:00.000Z');

const settings = {
  minimumWage: 1_000_000,
  firstFeeCutoffDay: 15,
  firstFeePercent: new Prisma.Decimal('50.00'),
  graceDays: 3,
  surchargePercent: new Prisma.Decimal('0.50'),
  allowMultiFeePayment: true,
};

const method = { id: 'method-1', name: 'Efectivo', isActive: true };

function activeMember(overrides: Record<string, unknown> = {}) {
  return {
    id: 'member-1',
    status: 'ACTIVE' as const,
    joinedOn: new Date('2026-10-10T00:00:00.000Z'),
    profile: { percent: new Prisma.Decimal('1.70') },
    fees: [] as { periodYear: number | null; periodMonth: number | null }[],
    ...overrides,
  };
}

function feeRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'fee-oct',
    memberId: 'member-1',
    type: 'MONTHLY' as const,
    status: 'PENDING' as const,
    periodYear: 2026,
    periodMonth: 10,
    minimumWageUsed: 1_000_000,
    baseAmount: 17_000,
    dueDate: new Date('2026-10-31T00:00:00.000Z'),
    dueLimit: new Date('2026-11-03T00:00:00.000Z'),
    paidOn: null,
    paymentMethodId: null,
    paymentNote: null,
    paidById: null,
    paidAt: null,
    monthsLateCharged: null,
    surchargePercentApplied: null,
    surchargeAmount: null,
    totalPaid: null,
    paymentMethod: null,
    member: {
      id: 'member-1',
      memberNumber: 1,
      firstNames: 'Ana',
      lastNames: 'Pérez',
    },
    ...overrides,
  };
}

describe('assertCronAuthorized', () => {
  const previous = process.env.CRON_SECRET;

  afterEach(() => {
    if (previous === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previous;
  });

  it('accepts the bearer secret and rejects anything else', () => {
    process.env.CRON_SECRET = 'cron-test-secret';
    expect(() => assertCronAuthorized('Bearer cron-test-secret')).not.toThrow();
    expect(() => assertCronAuthorized('Bearer other')).toThrowError(
      expect.objectContaining({ status: 401 }),
    );
    expect(() => assertCronAuthorized(null)).toThrowError(
      expect.objectContaining({ status: 401 }),
    );
    delete process.env.CRON_SECRET;
    expect(() => assertCronAuthorized('Bearer cron-test-secret')).toThrowError(
      expect.objectContaining({ status: 401 }),
    );
  });
});

describe('ensureFeesUpToDate', () => {
  beforeEach(() => {
    findSettings.mockReset();
    listActiveMembersForGeneration.mockReset();
    createMonthlyFees.mockReset();
    markPendingMonthlyOverdue.mockReset();
    createFeeAuditLog.mockReset();
    findSettings.mockResolvedValue(settings);
    listActiveMembersForGeneration.mockResolvedValue([activeMember()]);
    createMonthlyFees.mockImplementation(async (rows: unknown[]) => ({
      count: Array.isArray(rows) ? rows.length : 0,
    }));
    markPendingMonthlyOverdue.mockResolvedValue({ count: 0 });
    createFeeAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('creates the full current-month fee on or before the cutoff day', async () => {
    const result = await ensureFeesUpToDate(oct10, {
      actorId: 'user-1',
      source: 'request',
    });
    expect(result.created).toBe(1);
    expect(createMonthlyFees).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          type: 'MONTHLY',
          periodYear: 2026,
          periodMonth: 10,
          minimumWageUsed: 1_000_000,
          baseAmount: 17_000,
          isReduced: false,
          status: 'PENDING',
          dueDate: new Date('2026-10-31T00:00:00.000Z'),
          dueLimit: new Date('2026-11-03T00:00:00.000Z'),
        }),
      ],
      expect.anything(),
    );
    expect(createFeeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        action: 'fee.generate',
        detail: expect.objectContaining({ created: 1, source: 'request' }),
      }),
      expect.anything(),
    );
  });

  it('reduces the first monthly fee when affiliation is after the cutoff', async () => {
    listActiveMembersForGeneration.mockResolvedValue([
      activeMember({ joinedOn: new Date('2026-10-16T00:00:00.000Z') }),
    ]);
    await ensureFeesUpToDate(oct16, { actorId: 'user-1', source: 'request' });
    expect(createMonthlyFees).toHaveBeenCalledWith(
      [expect.objectContaining({ baseAmount: 8_500, isReduced: true })],
      expect.anything(),
    );
  });

  it('charges the full fee when a previous monthly fee already exists', async () => {
    listActiveMembersForGeneration.mockResolvedValue([
      activeMember({
        joinedOn: new Date('2026-09-20T00:00:00.000Z'),
        fees: [{ periodYear: 2026, periodMonth: 9 }],
      }),
    ]);
    await ensureFeesUpToDate(oct10, { actorId: 'user-1', source: 'request' });
    expect(createMonthlyFees).toHaveBeenCalledWith(
      [
        expect.objectContaining({
          periodMonth: 10,
          baseAmount: 17_000,
          isReduced: false,
        }),
      ],
      expect.anything(),
    );
  });

  it('does not duplicate the current period or generate for a suspended member', async () => {
    listActiveMembersForGeneration.mockResolvedValue([
      activeMember({ fees: [{ periodYear: 2026, periodMonth: 10 }] }),
      activeMember({ id: 'member-2', status: 'SUSPENDED' }),
    ]);
    const result = await ensureFeesUpToDate(oct10, { source: 'request' });
    expect(result.created).toBe(0);
    expect(createMonthlyFees).not.toHaveBeenCalled();
    expect(createFeeAuditLog).not.toHaveBeenCalled();
  });

  it('does not generate fees when the SMMLV is 0', async () => {
    findSettings.mockResolvedValue({ ...settings, minimumWage: 0 });
    await ensureFeesUpToDate(oct10, { source: 'request' });
    expect(listActiveMembersForGeneration).not.toHaveBeenCalled();
    expect(createMonthlyFees).not.toHaveBeenCalled();
    expect(markPendingMonthlyOverdue).toHaveBeenCalled();
  });

  it('counts only the rows the database actually inserted', async () => {
    createMonthlyFees.mockResolvedValue({ count: 0 });
    const result = await ensureFeesUpToDate(oct10, { source: 'request' });
    expect(result.created).toBe(0);
    expect(createFeeAuditLog).not.toHaveBeenCalled();
  });

  it('passes today in Bogota so the limit day stays pending and the next day is overdue', async () => {
    listActiveMembersForGeneration.mockResolvedValue([]);
    await ensureFeesUpToDate(nov3, { source: 'cron' });
    expect(markPendingMonthlyOverdue).toHaveBeenCalledWith(
      new Date('2026-11-03T00:00:00.000Z'),
      expect.anything(),
    );
    await ensureFeesUpToDate(nov4, { source: 'cron' });
    expect(markPendingMonthlyOverdue).toHaveBeenCalledWith(
      new Date('2026-11-04T00:00:00.000Z'),
      expect.anything(),
    );
  });

  it('writes one cron audit with a null user, even when nothing was created', async () => {
    listActiveMembersForGeneration.mockResolvedValue([]);
    markPendingMonthlyOverdue.mockResolvedValue({ count: 2 });
    await ensureFeesUpToDate(nov4, { source: 'cron', actorId: 'ignored' });
    expect(createFeeAuditLog).toHaveBeenCalledTimes(1);
    expect(createFeeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: null,
        action: 'fee.generate',
        detail: expect.objectContaining({
          created: 0,
          markedOverdue: 2,
          source: 'cron',
        }),
      }),
      expect.anything(),
    );
  });
});

describe('getFeesPage', () => {
  beforeEach(() => {
    findSettings.mockReset();
    listActiveMembersForGeneration.mockReset();
    createMonthlyFees.mockReset();
    markPendingMonthlyOverdue.mockReset();
    createFeeAuditLog.mockReset();
    listFeesForYear.mockReset();
    listActivePaymentMethods.mockReset();
    findSettings.mockResolvedValue(settings);
    listActiveMembersForGeneration.mockResolvedValue([]);
    markPendingMonthlyOverdue.mockResolvedValue({ count: 0 });
    listActivePaymentMethods.mockResolvedValue([
      { id: 'method-1', name: 'Efectivo' },
    ]);
    listFeesForYear.mockResolvedValue([feeRow()]);
  });

  it('returns the live surcharge for the requested year', async () => {
    const page = await getFeesPage('user-1', 2026, dec1);
    expect(listFeesForYear).toHaveBeenCalledWith(2026, true);
    expect(page.fees[0]).toMatchObject({
      status: 'OVERDUE',
      surchargeAmount: 10_000,
      total: 27_000,
      baseAmount: 17_000,
    });
    expect(page.allowMultiFeePayment).toBe(true);
    expect(page.surchargePercent).toBe('0.50');
  });

  it('does not pull open enrollment from other years when the filter is not the current year', async () => {
    await getFeesPage('user-1', 2025, dec1);
    expect(listFeesForYear).toHaveBeenCalledWith(2025, false);
  });
});

describe('payFees', () => {
  const payInput = {
    feeIds: ['fee-oct'],
    paymentMethodId: 'method-1',
    paidOn: '2026-12-01',
    paymentNote: null,
  };

  beforeEach(() => {
    findSettings.mockReset();
    findFeesByIds.mockReset();
    findPaymentMethod.mockReset();
    markFeePaid.mockReset();
    createFeeAuditLog.mockReset();
    findSettings.mockResolvedValue(settings);
    findFeesByIds.mockResolvedValue([feeRow({ status: 'OVERDUE' })]);
    findPaymentMethod.mockResolvedValue(method);
    markFeePaid.mockResolvedValue({ count: 1 });
    createFeeAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('freezes two months of surcharge on the October sample paid in December', async () => {
    const result = await payFees('user-1', payInput, dec1);
    expect(result.updated).toBe(1);
    expect(markFeePaid).toHaveBeenCalledWith(
      'fee-oct',
      expect.objectContaining({
        status: 'PAID',
        monthsLateCharged: 2,
        surchargeAmount: 10_000,
        totalPaid: 27_000,
        paymentMethodId: 'method-1',
        paidById: 'user-1',
      }),
      expect.anything(),
    );
    expect(createFeeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'fee.pay',
        detail: expect.objectContaining({
          baseAmount: 17_000,
          surchargeAmount: 10_000,
          totalPaid: 27_000,
          paymentMethodName: 'Efectivo',
          paidOn: '2026-12-01',
        }),
      }),
      expect.anything(),
    );
  });

  it('pays each fee on its own and does not merge an enrollment fee', async () => {
    findFeesByIds.mockResolvedValue([
      feeRow({ status: 'OVERDUE' }),
      feeRow({
        id: 'fee-enroll',
        type: 'ENROLLMENT',
        status: 'PENDING',
        periodYear: null,
        periodMonth: null,
        minimumWageUsed: 0,
        baseAmount: 25_000,
        dueDate: new Date('2026-10-16T00:00:00.000Z'),
        dueLimit: new Date('2026-10-16T00:00:00.000Z'),
      }),
    ]);
    const result = await payFees(
      'user-1',
      { ...payInput, feeIds: ['fee-oct', 'fee-enroll'] },
      dec1,
    );
    expect(result.updated).toBe(2);
    expect(markFeePaid).toHaveBeenCalledWith(
      'fee-enroll',
      expect.objectContaining({ surchargeAmount: 0, totalPaid: 25_000 }),
      expect.anything(),
    );
    expect(createFeeAuditLog).toHaveBeenCalledTimes(2);
  });

  it('rejects more than one fee when the parameter is off, without marking any', async () => {
    findSettings.mockResolvedValue({ ...settings, allowMultiFeePayment: false });
    await expect(
      payFees(
        'user-1',
        { ...payInput, feeIds: ['fee-oct', 'fee-enroll'] },
        dec1,
      ),
    ).rejects.toMatchObject({ status: 409 });
    expect(markFeePaid).not.toHaveBeenCalled();
  });

  it('rejects fees of another member or an already paid fee', async () => {
    findFeesByIds.mockResolvedValue([
      feeRow(),
      feeRow({ id: 'fee-other', memberId: 'member-2' }),
    ]);
    await expect(
      payFees('user-1', { ...payInput, feeIds: ['fee-oct', 'fee-other'] }, dec1),
    ).rejects.toMatchObject({ status: 409 });
    expect(markFeePaid).not.toHaveBeenCalled();

    findFeesByIds.mockResolvedValue([feeRow({ status: 'PAID' })]);
    await expect(payFees('user-1', payInput, dec1)).rejects.toMatchObject({
      status: 409,
    });
    expect(markFeePaid).not.toHaveBeenCalled();
  });

  it('rejects a future payment date and an inactive method', async () => {
    await expect(
      payFees('user-1', { ...payInput, paidOn: '2026-12-02' }, dec1),
    ).rejects.toMatchObject({ status: 400 });
    expect(findFeesByIds).not.toHaveBeenCalled();

    findPaymentMethod.mockResolvedValue({ ...method, isActive: false });
    await expect(payFees('user-1', payInput, dec1)).rejects.toMatchObject({
      status: 400,
    });
    expect(markFeePaid).not.toHaveBeenCalled();
  });
});

describe('revertFee', () => {
  beforeEach(() => {
    findFeeById.mockReset();
    clearFeePayment.mockReset();
    createFeeAuditLog.mockReset();
    clearFeePayment.mockResolvedValue({ count: 1 });
    createFeeAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('returns a monthly fee to overdue and keeps the note in the audit', async () => {
    findFeeById.mockResolvedValue(
      feeRow({
        status: 'PAID',
        paidOn: new Date('2026-11-04T00:00:00.000Z'),
        paymentMethodId: 'method-1',
        paymentMethod: { id: 'method-1', name: 'Efectivo' },
        paidById: 'user-1',
        paidAt: dec1,
        monthsLateCharged: 1,
        surchargePercentApplied: new Prisma.Decimal('0.50'),
        surchargeAmount: 5_000,
        totalPaid: 22_000,
      }),
    );
    const result = await revertFee(
      'user-2',
      'fee-oct',
      { note: 'Se digitó dos veces' },
      dec1,
    );
    expect(result.status).toBe('OVERDUE');
    expect(clearFeePayment).toHaveBeenCalledWith(
      'fee-oct',
      'OVERDUE',
      expect.anything(),
    );
    expect(createFeeAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'fee.revert',
        userId: 'user-2',
        note: 'Se digitó dos veces',
        detail: expect.objectContaining({
          revertedBy: 'user-2',
          before: expect.objectContaining({
            totalPaid: 22_000,
            paidById: 'user-1',
            paymentMethodName: 'Efectivo',
          }),
        }),
      }),
      expect.anything(),
    );
  });

  it('returns an enrollment fee to pending and rejects a fee that is not paid', async () => {
    findFeeById.mockResolvedValue(
      feeRow({
        id: 'fee-enroll',
        type: 'ENROLLMENT',
        status: 'PAID',
        periodYear: null,
        periodMonth: null,
        totalPaid: 25_000,
      }),
    );
    const result = await revertFee(
      'user-2',
      'fee-enroll',
      { note: 'No correspondía' },
      dec1,
    );
    expect(result.status).toBe('PENDING');

    findFeeById.mockResolvedValue(feeRow({ status: 'PENDING' }));
    await expect(
      revertFee('user-2', 'fee-oct', { note: 'No correspondía' }, dec1),
    ).rejects.toMatchObject({ status: 409 });
  });
});
