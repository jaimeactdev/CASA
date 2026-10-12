import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findSettings = vi.fn();
const findProfile = vi.fn();
const findMember = vi.fn();
const findMemberByDocument = vi.fn();
const createMemberRecord = vi.fn();
const createFeeRecord = vi.fn();
const createAuditLog = vi.fn();
const updateMemberRecord = vi.fn();
const ensureFeesUpToDate = vi.fn();

vi.mock('@/server/modules/fees/fees.service', () => ({
  ensureFeesUpToDate: (...args: unknown[]) => ensureFeesUpToDate(...args),
}));

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./members.repository', () => ({
  findSettings: (...args: unknown[]) => findSettings(...args),
  findProfile: (...args: unknown[]) => findProfile(...args),
  findMember: (...args: unknown[]) => findMember(...args),
  findMemberByDocument: (...args: unknown[]) => findMemberByDocument(...args),
  listMembers: vi.fn(),
  listProfiles: vi.fn(),
  createMemberRecord: (...args: unknown[]) => createMemberRecord(...args),
  updateMemberRecord: (...args: unknown[]) => updateMemberRecord(...args),
  createFeeRecord: (...args: unknown[]) => createFeeRecord(...args),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
}));

import {
  assertCanEnroll,
  createMember,
  getMember,
  getMemberBenefits,
  MINIMUM_WAGE_REQUIRED_MESSAGE,
  updateMember,
} from './members.service';

const profileId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const memberId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const nowLate = new Date('2026-10-16T17:00:00.000Z');
const nowEarly = new Date('2026-10-10T17:00:00.000Z');

const settings = {
  minimumWage: 1_000_000,
  enrollmentFee: 25_000,
  firstFeeCutoffDay: 15,
  firstFeePercent: new Prisma.Decimal('50.00'),
  graceDays: 3,
  surchargePercent: new Prisma.Decimal('0.00'),
};

const profile = {
  id: profileId,
  name: 'General',
  percent: new Prisma.Decimal('1.70'),
  isActive: true,
};

const createInput = {
  documentType: 'CC' as const,
  documentNumber: '12345678',
  firstNames: 'Ana',
  lastNames: 'Pérez',
  sex: 'FEMALE' as const,
  birthDate: '1980-05-20',
  mobilePhone: '3001234567',
  address: 'Calle 1 # 2-3',
  residenceCity: 'Medellín',
  profileId,
};

function memberRow(overrides: Record<string, unknown> = {}) {
  return {
    id: memberId,
    memberNumber: 1,
    documentType: 'CC',
    documentNumber: '12345678',
    firstNames: 'Ana',
    lastNames: 'Pérez',
    sex: 'FEMALE',
    birthDate: new Date('1980-05-20T00:00:00.000Z'),
    mobilePhone: '3001234567',
    phone: null,
    email: null,
    address: 'Calle 1 # 2-3',
    residenceCity: 'Medellín',
    shirtSize: null,
    pantsSize: null,
    shoeSize: null,
    joinedOn: new Date('2026-10-16T00:00:00.000Z'),
    profileId,
    status: 'ACTIVE',
    notes: null,
    createdById: 'admin-1',
    createdAt: nowLate,
    updatedAt: nowLate,
    profile,
    fees: [],
    deliveries: [],
    createdBy: { name: 'Admin' },
    ...overrides,
  };
}

describe('assertCanEnroll', () => {
  it('rejects a zero wage with 409 and accepts a positive one', () => {
    expect(() => assertCanEnroll(0)).toThrowError(MINIMUM_WAGE_REQUIRED_MESSAGE);
    expect(() => assertCanEnroll(1_000_000)).not.toThrow();
  });
});

describe('createMember', () => {
  beforeEach(() => {
    findSettings.mockReset();
    findProfile.mockReset();
    findMember.mockReset();
    findMemberByDocument.mockReset();
    createMemberRecord.mockReset();
    createFeeRecord.mockReset();
    createAuditLog.mockReset();
    findSettings.mockResolvedValue(settings);
    findProfile.mockResolvedValue(profile);
    findMemberByDocument.mockResolvedValue(null);
    createMemberRecord.mockResolvedValue(memberRow());
    findMember.mockResolvedValue(memberRow());
    createFeeRecord.mockImplementation(async (data: { type: string }) => ({
      id: data.type === 'ENROLLMENT' ? 'fee-enroll' : 'fee-month',
      type: data.type,
      baseAmount: 0,
    }));
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('does not create anything when the SMMLV is 0', async () => {
    findSettings.mockResolvedValue({ ...settings, minimumWage: 0 });
    await expect(
      createMember('admin-1', createInput, nowLate),
    ).rejects.toMatchObject({
      status: 409,
      message: MINIMUM_WAGE_REQUIRED_MESSAGE,
    });
    expect(createMemberRecord).not.toHaveBeenCalled();
    expect(createFeeRecord).not.toHaveBeenCalled();
  });

  it('creates the reduced first monthly fee after the cutoff day', async () => {
    const result = await createMember('admin-1', createInput, nowLate);
    expect(result.currentFee).toBe(17_000);
    expect(createFeeRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MONTHLY',
        periodYear: 2026,
        periodMonth: 10,
        minimumWageUsed: 1_000_000,
        baseAmount: 8_500,
        isReduced: true,
        status: 'PENDING',
      }),
      expect.anything(),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'member.create' }),
      expect.anything(),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'fee.generate' }),
      expect.anything(),
    );
  });

  it('creates the full first monthly fee on or before the cutoff day', async () => {
    await createMember(
      'admin-1',
      { ...createInput, joinedOn: '2026-10-10' },
      nowEarly,
    );
    expect(createFeeRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'MONTHLY',
        baseAmount: 17_000,
        isReduced: false,
      }),
      expect.anything(),
    );
  });

  it('adds the enrollment fee in the same transaction when requested', async () => {
    await createMember(
      'admin-1',
      { ...createInput, chargeEnrollment: true },
      nowLate,
    );
    expect(createFeeRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'ENROLLMENT',
        baseAmount: 25_000,
        minimumWageUsed: 0,
        status: 'PENDING',
      }),
      expect.anything(),
    );
    expect(createFeeRecord).toHaveBeenCalledTimes(2);
  });

  it('does not create an enrollment fee when the parameter is 0', async () => {
    findSettings.mockResolvedValue({ ...settings, enrollmentFee: 0 });
    await createMember(
      'admin-1',
      { ...createInput, chargeEnrollment: true },
      nowLate,
    );
    expect(createFeeRecord).toHaveBeenCalledTimes(1);
    expect(createFeeRecord.mock.calls[0]?.[0]).toMatchObject({ type: 'MONTHLY' });
  });

  it('rejects a duplicate document before inserting', async () => {
    findMemberByDocument.mockResolvedValue({ id: 'other' });
    await expect(
      createMember('admin-1', createInput, nowLate),
    ).rejects.toMatchObject({ status: 409 });
    expect(createMemberRecord).not.toHaveBeenCalled();
  });

  it('rejects an inactive profile', async () => {
    findProfile.mockResolvedValue({ ...profile, isActive: false });
    await expect(
      createMember('admin-1', createInput, nowLate),
    ).rejects.toMatchObject({ status: 409 });
    expect(createMemberRecord).not.toHaveBeenCalled();
  });
});

describe('updateMember', () => {
  beforeEach(() => {
    findSettings.mockReset();
    findMember.mockReset();
    findProfile.mockReset();
    findMemberByDocument.mockReset();
    updateMemberRecord.mockReset();
    createAuditLog.mockReset();
    findSettings.mockResolvedValue(settings);
    findMemberByDocument.mockResolvedValue(null);
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
    updateMemberRecord.mockResolvedValue(memberRow({ status: 'SUSPENDED' }));
  });

  it('writes a status_change audit and does not delete the member', async () => {
    const current = memberRow();
    const updated = memberRow({ status: 'SUSPENDED' });
    findMember.mockResolvedValueOnce(current).mockResolvedValueOnce(updated);

    const result = await updateMember(
      'admin-1',
      memberId,
      { status: 'SUSPENDED' },
      nowLate,
    );

    expect(result.status).toBe('SUSPENDED');
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'member.status_change' }),
      expect.anything(),
    );
    expect(createAuditLog).not.toHaveBeenCalledWith(
      expect.objectContaining({ action: 'member.update' }),
      expect.anything(),
    );
  });
});

describe('getMember', () => {
  beforeEach(() => {
    findSettings.mockReset();
    findMember.mockReset();
    ensureFeesUpToDate.mockReset();
    ensureFeesUpToDate.mockResolvedValue({
      created: 0,
      markedOverdue: 0,
      today: '2026-12-01',
    });
    findSettings.mockResolvedValue({
      ...settings,
      surchargePercent: new Prisma.Decimal('0.50'),
    });
  });

  it('shows the live surcharge of an unpaid October fee in December', async () => {
    findMember.mockResolvedValue(
      memberRow({
        profile: { ...profile, benefits: [] },
        fees: [
          {
            id: 'fee-oct',
            type: 'MONTHLY',
            periodYear: 2026,
            periodMonth: 10,
            minimumWageUsed: 1_000_000,
            profilePercent: new Prisma.Decimal('1.70'),
            baseAmount: 17_000,
            isReduced: false,
            reductionPercent: null,
            dueDate: new Date('2026-10-31T00:00:00.000Z'),
            dueLimit: new Date('2026-11-03T00:00:00.000Z'),
            status: 'PENDING',
            paidOn: null,
            paymentNote: null,
            monthsLateCharged: null,
            surchargePercentApplied: null,
            surchargeAmount: null,
            totalPaid: null,
            paymentMethod: null,
          },
        ],
      }),
    );

    const detail = await getMember(
      memberId,
      new Date('2026-12-01T17:00:00.000Z'),
      'user-1',
    );

    expect(ensureFeesUpToDate).toHaveBeenCalled();
    expect(detail.fees[0]).toMatchObject({
      status: 'OVERDUE',
      surchargeAmount: 10_000,
      total: 27_000,
    });
    expect(detail.inArrears).toBe(true);
  });
});

describe('getMemberBenefits', () => {
  const aguinaldo = {
    id: 'benefit-aguinaldo',
    name: 'Aguinaldo',
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    requiresMinimumSetup: false,
  };
  const outing = {
    id: 'benefit-outing',
    name: 'Paseo o día de sol',
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    requiresMinimumSetup: true,
  };
  const mothersDay = {
    id: 'benefit-mother',
    name: 'Día de la madre',
    audience: 'FEMALE' as const,
    minPaidFeesInYear: 1,
    maxDeliveriesPerYear: 1,
    requiresMinimumSetup: false,
  };

  beforeEach(() => {
    findMember.mockReset();
    ensureFeesUpToDate.mockReset();
    ensureFeesUpToDate.mockResolvedValue({
      created: 0,
      markedOverdue: 0,
      today: '2026-10-12',
    });
  });

  function withBenefits(
    benefits: unknown[],
    extras: Record<string, unknown> = {},
  ) {
    return memberRow({
      profile: {
        ...profile,
        benefits: benefits.map((benefit) => ({ benefit })),
      },
      ...extras,
    });
  }

  it('shows the outing blocked while its minimum is still zero', async () => {
    findMember.mockResolvedValue(withBenefits([outing, aguinaldo]));
    const page = await getMemberBenefits(memberId, 2026, nowEarly, 'user-1');
    expect(ensureFeesUpToDate).toHaveBeenCalled();
    const outingRow = page.benefits.find((item) => item.id === outing.id);
    const gift = page.benefits.find((item) => item.id === aguinaldo.id);
    expect(outingRow).toMatchObject({
      minimumBlocked: true,
      canDeliver: false,
      canDeliverWithException: true,
    });
    expect(gift).toMatchObject({ canDeliver: true, minimumBlocked: false });
    expect(gift?.conditions.every((condition) => condition.passed)).toBe(true);
  });

  it('counts a paid monthly fee and ignores the enrollment fee', async () => {
    findMember.mockResolvedValue(
      withBenefits([mothersDay], {
        fees: [
          {
            type: 'ENROLLMENT',
            status: 'PAID',
            periodYear: null,
            totalPaid: 25_000,
          },
          {
            type: 'MONTHLY',
            status: 'PAID',
            periodYear: 2026,
            totalPaid: 8_500,
          },
        ],
      }),
    );
    const page = await getMemberBenefits(memberId, 2026, nowEarly, 'user-1');
    expect(page.paidFeesThisYear).toBe(1);
    expect(page.benefits[0]).toMatchObject({
      meetsMinimum: true,
      canDeliver: true,
    });
  });

  it('closes the quota after one delivery and does not match an unspecified sex', async () => {
    findMember.mockResolvedValue(
      withBenefits([aguinaldo, mothersDay], {
        sex: 'UNSPECIFIED',
        deliveries: [{ benefitId: aguinaldo.id, year: 2026 }],
      }),
    );
    const page = await getMemberBenefits(memberId, undefined, nowEarly, 'user-1');
    const gift = page.benefits.find((item) => item.id === aguinaldo.id);
    const mother = page.benefits.find((item) => item.id === mothersDay.id);
    expect(page.year).toBe(2026);
    expect(gift).toMatchObject({
      alreadyReceived: true,
      canDeliver: false,
      canDeliverWithException: false,
    });
    expect(
      mother?.conditions.find((condition) => condition.key === 'sexMatches')?.passed,
    ).toBe(false);
  });

  it('responds 404 when the member does not exist', async () => {
    findMember.mockResolvedValue(null);
    await expect(
      getMemberBenefits(memberId, 2026, nowEarly, 'user-1'),
    ).rejects.toMatchObject({ status: 404 });
  });
});
