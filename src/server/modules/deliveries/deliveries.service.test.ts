import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const listDeliveriesForYear = vi.fn();
const listBenefitOptions = vi.fn();
const lockMemberRow = vi.fn();
const findMemberForDelivery = vi.fn();
const findBenefitForDelivery = vi.fn();
const countActiveDeliveries = vi.fn();
const createDeliveryRecord = vi.fn();
const findDelivery = vi.fn();
const markDeliveryVoided = vi.fn();
const createDeliveryAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./deliveries.repository', () => ({
  listDeliveriesForYear: (...args: unknown[]) => listDeliveriesForYear(...args),
  listBenefitOptions: (...args: unknown[]) => listBenefitOptions(...args),
  lockMemberRow: (...args: unknown[]) => lockMemberRow(...args),
  findMemberForDelivery: (...args: unknown[]) => findMemberForDelivery(...args),
  findBenefitForDelivery: (...args: unknown[]) => findBenefitForDelivery(...args),
  countActiveDeliveries: (...args: unknown[]) => countActiveDeliveries(...args),
  createDeliveryRecord: (...args: unknown[]) => createDeliveryRecord(...args),
  findDelivery: (...args: unknown[]) => findDelivery(...args),
  markDeliveryVoided: (...args: unknown[]) => markDeliveryVoided(...args),
  createDeliveryAuditLog: (...args: unknown[]) => createDeliveryAuditLog(...args),
}));

import { deliverBenefit, getDeliveriesPage, voidDelivery } from './deliveries.service';

const memberId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const benefitId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
const actorId = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
const oct12 = new Date('2026-10-12T17:00:00.000Z');

const normalAccess = { canDeliver: true, canDeliverException: false };
const exceptionAccess = { canDeliver: false, canDeliverException: true };
const bothAccess = { canDeliver: true, canDeliverException: true };

function member(overrides: Record<string, unknown> = {}) {
  return {
    id: memberId,
    status: 'ACTIVE' as const,
    sex: 'FEMALE' as const,
    profile: { benefits: [{ benefitId }] },
    fees: [] as {
      type: 'MONTHLY' | 'ENROLLMENT';
      status: 'PAID' | 'PENDING';
      periodYear: number | null;
    }[],
    ...overrides,
  };
}

function benefit(overrides: Record<string, unknown> = {}) {
  return {
    id: benefitId,
    name: 'Aguinaldo',
    isActive: true,
    audience: 'ALL' as const,
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    requiresMinimumSetup: false,
    ...overrides,
  };
}

function deliveryInput(overrides: Record<string, unknown> = {}) {
  return {
    memberId,
    benefitId,
    deliveredOn: '2026-10-12',
    note: null as string | null,
    ...overrides,
  };
}

describe('deliverBenefit', () => {
  beforeEach(() => {
    lockMemberRow.mockReset();
    findMemberForDelivery.mockReset();
    findBenefitForDelivery.mockReset();
    countActiveDeliveries.mockReset();
    createDeliveryRecord.mockReset();
    createDeliveryAuditLog.mockReset();
    lockMemberRow.mockResolvedValue([]);
    findMemberForDelivery.mockResolvedValue(member());
    findBenefitForDelivery.mockResolvedValue(benefit());
    countActiveDeliveries.mockResolvedValue(0);
    createDeliveryRecord.mockResolvedValue({
      id: 'delivery-1',
      year: 2026,
      isException: false,
    });
    createDeliveryAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('registers a normal delivery when every condition passes', async () => {
    const result = await deliverBenefit(
      actorId,
      normalAccess,
      deliveryInput(),
      oct12,
    );
    expect(result).toMatchObject({
      id: 'delivery-1',
      year: 2026,
      isException: false,
      deliveredOn: '2026-10-12',
    });
    expect(lockMemberRow).toHaveBeenCalledWith(memberId, expect.anything());
    expect(countActiveDeliveries).toHaveBeenCalledWith(
      memberId,
      benefitId,
      2026,
      expect.anything(),
    );
    expect(lockMemberRow.mock.invocationCallOrder[0]).toBeLessThan(
      countActiveDeliveries.mock.invocationCallOrder[0],
    );
    expect(createDeliveryRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        year: 2026,
        isException: false,
        note: null,
        deliveredById: actorId,
      }),
      expect.anything(),
    );
    expect(createDeliveryAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'benefit_delivery',
        action: 'benefit.deliver',
        note: null,
      }),
      expect.anything(),
    );
  });

  it('lets an exception-only role deliver as a normal record when the rules pass', async () => {
    const result = await deliverBenefit(
      actorId,
      exceptionAccess,
      deliveryInput(),
      oct12,
    );
    expect(result.isException).toBe(false);
  });

  it('counts a reduced monthly fee and ignores the enrollment fee', async () => {
    findBenefitForDelivery.mockResolvedValue(benefit({ minPaidFeesInYear: 1 }));
    findMemberForDelivery.mockResolvedValue(
      member({
        fees: [
          { type: 'ENROLLMENT', status: 'PAID', periodYear: null },
          { type: 'MONTHLY', status: 'PAID', periodYear: 2026 },
        ],
      }),
    );
    const result = await deliverBenefit(
      actorId,
      normalAccess,
      deliveryInput(),
      oct12,
    );
    expect(result.isException).toBe(false);
  });

  it('refuses a future date before opening the transaction', async () => {
    await expect(
      deliverBenefit(
        actorId,
        normalAccess,
        deliveryInput({ deliveredOn: '2026-10-13' }),
        oct12,
      ),
    ).rejects.toMatchObject({ status: 400 });
    expect(lockMemberRow).not.toHaveBeenCalled();
  });

  it('refuses an inactive benefit', async () => {
    findBenefitForDelivery.mockResolvedValue(benefit({ isActive: false }));
    await expect(
      deliverBenefit(actorId, bothAccess, deliveryInput({ note: 'x' }), oct12),
    ).rejects.toMatchObject({ status: 409 });
    expect(createDeliveryRecord).not.toHaveBeenCalled();
  });

  it('blocks a suspended member unless the exception permission and a note are present', async () => {
    findMemberForDelivery.mockResolvedValue(member({ status: 'SUSPENDED' }));
    await expect(
      deliverBenefit(actorId, normalAccess, deliveryInput(), oct12),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      deliverBenefit(actorId, exceptionAccess, deliveryInput(), oct12),
    ).rejects.toMatchObject({ status: 400 });
    const result = await deliverBenefit(
      actorId,
      exceptionAccess,
      deliveryInput({ note: 'Junta autorizó' }),
      oct12,
    );
    expect(result.isException).toBe(true);
    expect(createDeliveryAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'benefit.deliver',
        note: 'Junta autorizó',
        detail: expect.objectContaining({ isException: true }),
      }),
      expect.anything(),
    );
  });

  it('does not let an exception exceed the annual quota', async () => {
    countActiveDeliveries.mockResolvedValue(1);
    await expect(
      deliverBenefit(
        actorId,
        bothAccess,
        deliveryInput({ note: 'otra vez' }),
        oct12,
      ),
    ).rejects.toMatchObject({
      status: 409,
      message: 'Ese beneficio ya alcanzó el máximo de entregas de este año.',
    });
    expect(createDeliveryRecord).not.toHaveBeenCalled();
  });

  it('blocks the outing while its minimum is still zero, and allows it with an exception note', async () => {
    findBenefitForDelivery.mockResolvedValue(
      benefit({
        name: 'Paseo o día de sol',
        requiresMinimumSetup: true,
        minPaidFeesInYear: 0,
      }),
    );
    await expect(
      deliverBenefit(actorId, normalAccess, deliveryInput(), oct12),
    ).rejects.toMatchObject({ status: 403 });
    const result = await deliverBenefit(
      actorId,
      exceptionAccess,
      deliveryInput({ note: 'Definirán el mínimo después' }),
      oct12,
    );
    expect(result.isException).toBe(true);
  });

  it('does not match an unspecified sex with a women-only benefit', async () => {
    findMemberForDelivery.mockResolvedValue(member({ sex: 'UNSPECIFIED' }));
    findBenefitForDelivery.mockResolvedValue(
      benefit({ name: 'Día de la madre', audience: 'FEMALE' }),
    );
    await expect(
      deliverBenefit(actorId, normalAccess, deliveryInput(), oct12),
    ).rejects.toMatchObject({ status: 403 });
    const result = await deliverBenefit(
      actorId,
      exceptionAccess,
      deliveryInput({ note: 'Se identificó en ventanilla' }),
      oct12,
    );
    expect(result.isException).toBe(true);
  });
});

describe('voidDelivery', () => {
  beforeEach(() => {
    findDelivery.mockReset();
    markDeliveryVoided.mockReset();
    createDeliveryAuditLog.mockReset();
    findDelivery.mockResolvedValue({
      id: 'delivery-1',
      memberId,
      benefitId,
      year: 2026,
      isVoided: false,
    });
    markDeliveryVoided.mockResolvedValue({ count: 1 });
    createDeliveryAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('voids with a note and writes the audit entry', async () => {
    const result = await voidDelivery(
      actorId,
      'delivery-1',
      { note: 'Se entregó a otra persona' },
      oct12,
    );
    expect(result).toEqual({ id: 'delivery-1', isVoided: true });
    expect(markDeliveryVoided).toHaveBeenCalledWith(
      'delivery-1',
      expect.objectContaining({
        voidedById: actorId,
        voidNote: 'Se entregó a otra persona',
      }),
      expect.anything(),
    );
    expect(createDeliveryAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'benefit.void',
        note: 'Se entregó a otra persona',
      }),
      expect.anything(),
    );
  });

  it('rejects a missing or already voided delivery', async () => {
    findDelivery.mockResolvedValue(null);
    await expect(
      voidDelivery(actorId, 'missing', { note: 'x' }, oct12),
    ).rejects.toMatchObject({ status: 404 });
    findDelivery.mockResolvedValue({
      id: 'delivery-1',
      memberId,
      benefitId,
      year: 2026,
      isVoided: true,
    });
    await expect(
      voidDelivery(actorId, 'delivery-1', { note: 'x' }, oct12),
    ).rejects.toMatchObject({ status: 409 });
    expect(createDeliveryAuditLog).not.toHaveBeenCalled();
  });
});

describe('getDeliveriesPage', () => {
  beforeEach(() => {
    listDeliveriesForYear.mockReset();
    listBenefitOptions.mockReset();
    listBenefitOptions.mockResolvedValue([{ id: benefitId, name: 'Aguinaldo' }]);
    listDeliveriesForYear.mockResolvedValue([
      {
        id: 'delivery-1',
        memberId,
        member: {
          id: memberId,
          memberNumber: 7,
          firstNames: 'Ana',
          lastNames: 'Pérez',
        },
        benefitId,
        benefit: { id: benefitId, name: 'Aguinaldo' },
        year: 2026,
        deliveredOn: new Date('2026-12-20T00:00:00.000Z'),
        isException: false,
        isVoided: false,
        note: null,
        voidNote: null,
        deliveredBy: { name: 'Admin' },
        voidedBy: null,
      },
    ]);
  });

  it('defaults to the business year and keeps who delivered the benefit', async () => {
    const page = await getDeliveriesPage({}, oct12);
    expect(page.year).toBe(2026);
    expect(page.today).toBe('2026-10-12');
    expect(listDeliveriesForYear).toHaveBeenCalledWith(2026, {
      benefitId: undefined,
      memberId: undefined,
    });
    expect(page.deliveries[0]).toMatchObject({
      memberName: 'Ana Pérez',
      benefitName: 'Aguinaldo',
      deliveredOn: '2026-12-20',
      deliveredByName: 'Admin',
      isVoided: false,
    });
    expect(page.benefits).toEqual([{ id: benefitId, name: 'Aguinaldo' }]);
  });
});
