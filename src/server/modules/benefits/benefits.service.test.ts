import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findBenefit = vi.fn();
const createBenefitRecord = vi.fn();
const updateBenefitRecord = vi.fn();
const createAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./benefits.repository', () => ({
  listBenefits: vi.fn(),
  findBenefit: (...args: unknown[]) => findBenefit(...args),
  createBenefitRecord: (...args: unknown[]) => createBenefitRecord(...args),
  updateBenefitRecord: (...args: unknown[]) => updateBenefitRecord(...args),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
}));

import {
  createBenefit,
  normalizeMaxDeliveries,
  updateBenefit,
} from './benefits.service';

function benefitRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 'benefit-1',
    name: 'Paseo o día de sol',
    internalDescription: 'Salida anual',
    publicText: 'Un día de sol',
    isPublic: true,
    type: 'ANNUAL',
    audience: 'ALL',
    minPaidFeesInYear: 0,
    maxDeliveriesPerYear: 1,
    suggestedMonth: null,
    requiresMinimumSetup: true,
    isActive: true,
    createdAt: new Date('2026-10-11T00:00:00.000Z'),
    updatedAt: new Date('2026-10-11T00:00:00.000Z'),
    ...overrides,
  };
}

describe('normalizeMaxDeliveries', () => {
  it('keeps an annual benefit at one delivery', () => {
    expect(normalizeMaxDeliveries('ANNUAL', 5)).toBe(1);
  });

  it('rejects an eventual benefit outside 1 to 12', () => {
    expect(() => normalizeMaxDeliveries('EVENTUAL', 0)).toThrow(/1 a 12/);
  });
});

describe('createBenefit', () => {
  beforeEach(() => {
    createBenefitRecord.mockReset();
    createAuditLog.mockReset();
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('stores an annual benefit with a single delivery and audits it', async () => {
    createBenefitRecord.mockImplementation(async (data: { maxDeliveriesPerYear: number }) =>
      benefitRow({ maxDeliveriesPerYear: data.maxDeliveriesPerYear }),
    );

    const result = await createBenefit('admin-1', {
      name: 'Paseo o día de sol',
      internalDescription: 'Salida anual',
      publicText: 'Un día de sol',
      isPublic: true,
      type: 'ANNUAL',
      audience: 'ALL',
      minPaidFeesInYear: 0,
      maxDeliveriesPerYear: 4,
      suggestedMonth: null,
      requiresMinimumSetup: true,
    });

    expect(result.maxDeliveriesPerYear).toBe(1);
    expect(createBenefitRecord).toHaveBeenCalledWith(
      expect.objectContaining({ maxDeliveriesPerYear: 1, isActive: true }),
      expect.anything(),
    );
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ entity: 'benefit', action: 'benefit.create' }),
      expect.anything(),
    );
  });
});

describe('updateBenefit', () => {
  beforeEach(() => {
    findBenefit.mockReset();
    updateBenefitRecord.mockReset();
    createAuditLog.mockReset();
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
  });

  it('refuses to publish a benefit that has no public text', async () => {
    findBenefit.mockResolvedValue(benefitRow({ isPublic: false, publicText: null }));
    await expect(
      updateBenefit('admin-1', 'benefit-1', { isPublic: true }),
    ).rejects.toMatchObject({ status: 400 });
    expect(updateBenefitRecord).not.toHaveBeenCalled();
  });

  it('audits a deactivation without deleting the benefit', async () => {
    findBenefit.mockResolvedValue(benefitRow());
    updateBenefitRecord.mockResolvedValue(benefitRow({ isActive: false }));

    const result = await updateBenefit('admin-1', 'benefit-1', { isActive: false });

    expect(result.isActive).toBe(false);
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'benefit.update' }),
      expect.anything(),
    );
  });
});
