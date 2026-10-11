import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findSettings = vi.fn();
const updateSettingsRecord = vi.fn();
const listPaymentMethods = vi.fn();
const createAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./settings.repository', () => ({
  findSettings: (...args: unknown[]) => findSettings(...args),
  updateSettingsRecord: (...args: unknown[]) => updateSettingsRecord(...args),
  listPaymentMethods: (...args: unknown[]) => listPaymentMethods(...args),
  listActiveProfiles: vi.fn().mockResolvedValue([]),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
  createPaymentMethodRecord: vi.fn(),
  findPaymentMethod: vi.fn(),
  maxPaymentMethodSortOrder: vi.fn(),
  updatePaymentMethodRecord: vi.fn(),
}));

import {
  moneyFieldChanges,
  toSettingsDto,
  updateSettings,
} from './settings.service';

function settingsRow(overrides: Record<string, unknown> = {}) {
  return {
    id: 1,
    name: 'CASA',
    acronym: 'CASA',
    serviceCity: 'Medellín',
    phone: null,
    contactEmail: null,
    address: null,
    openingHours: null,
    minimumWage: 0,
    firstFeeCutoffDay: 15,
    firstFeePercent: new Prisma.Decimal('50.00'),
    graceDays: 3,
    surchargePercent: new Prisma.Decimal('0.00'),
    enrollmentFee: 0,
    allowMultiFeePayment: true,
    updatedAt: new Date('2026-10-11T15:00:00.000Z'),
    ...overrides,
  };
}

describe('moneyFieldChanges', () => {
  it('reports SMMLV and surcharge changes for the confirmation and audit', () => {
    expect(
      moneyFieldChanges(
        { minimumWage: 0, surchargePercent: '0.00' },
        { minimumWage: 1_000_000, surchargePercent: '0.50' },
      ),
    ).toEqual({
      minimumWage: { from: 0, to: 1_000_000 },
      surchargePercent: { from: '0.00', to: '0.50' },
    });
    expect(
      moneyFieldChanges(
        { minimumWage: 1_000_000, surchargePercent: '0.50' },
        { minimumWage: 1_000_000, surchargePercent: '0.50' },
      ),
    ).toEqual({});
  });
});

describe('toSettingsDto', () => {
  it('serializes Decimal percents as two-decimal strings', () => {
    expect(toSettingsDto(settingsRow() as never)).toMatchObject({
      minimumWage: 0,
      firstFeePercent: '50.00',
      surchargePercent: '0.00',
    });
  });
});

describe('updateSettings', () => {
  beforeEach(() => {
    findSettings.mockReset();
    updateSettingsRecord.mockReset();
    listPaymentMethods.mockReset();
    createAuditLog.mockReset();
  });

  it('writes settings.update with before/after and does not touch fees', async () => {
    const current = settingsRow();
    const updated = settingsRow({
      minimumWage: 1_000_000,
      surchargePercent: new Prisma.Decimal('0.50'),
    });
    findSettings.mockResolvedValue(current);
    updateSettingsRecord.mockResolvedValue(updated);
    listPaymentMethods.mockResolvedValue([]);
    createAuditLog.mockResolvedValue({ id: 'audit-1' });

    const result = await updateSettings('user-1', {
      name: 'CASA',
      acronym: 'CASA',
      serviceCity: 'Medellín',
      phone: null,
      contactEmail: null,
      address: null,
      openingHours: null,
      minimumWage: 1_000_000,
      firstFeeCutoffDay: 15,
      firstFeePercent: '50.00',
      graceDays: 3,
      surchargePercent: '0.50',
      enrollmentFee: 0,
      allowMultiFeePayment: true,
    });

    expect(result.minimumWage).toBe(1_000_000);
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 'user-1',
        entity: 'settings',
        entityId: '1',
        action: 'settings.update',
        detail: expect.objectContaining({
          money: {
            minimumWage: { from: 0, to: 1_000_000 },
            surchargePercent: { from: '0.00', to: '0.50' },
          },
        }),
      }),
      expect.anything(),
    );
    expect(updateSettingsRecord).toHaveBeenCalledTimes(1);
  });
});
