import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const memberCount = vi.fn();
const feeCount = vi.fn();
const findSettings = vi.fn();
const findBenefits = vi.fn();
const ensureFeesUpToDate = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    member: { count: (...args: unknown[]) => memberCount(...args) },
    fee: { count: (...args: unknown[]) => feeCount(...args) },
    settings: { findUnique: (...args: unknown[]) => findSettings(...args) },
    benefit: { findMany: (...args: unknown[]) => findBenefits(...args) },
  },
}));

vi.mock('@/server/modules/fees/fees.service', () => ({
  ensureFeesUpToDate: (...args: unknown[]) => ensureFeesUpToDate(...args),
}));

import { getDashboard } from './home.service';

const may10 = new Date('2026-05-10T17:00:00.000Z');
const jun15 = new Date('2026-06-15T17:00:00.000Z');
const oct10 = new Date('2026-10-10T17:00:00.000Z');
const dec1 = new Date('2026-12-01T17:00:00.000Z');

const calls: string[] = [];

describe('getDashboard', () => {
  beforeEach(() => {
    calls.length = 0;
    ensureFeesUpToDate.mockReset();
    memberCount.mockReset();
    feeCount.mockReset();
    findSettings.mockReset();
    findBenefits.mockReset();

    ensureFeesUpToDate.mockImplementation(async () => {
      calls.push('sync');
      return { created: 0, markedOverdue: 1, today: '2026-05-10' };
    });
    memberCount.mockImplementation(async (args: { where?: { fees?: unknown } }) => {
      calls.push('read');
      return args?.where && 'fees' in args.where ? 2 : 8;
    });
    feeCount.mockImplementation(async (args: { where?: { status?: string } }) => {
      calls.push('read');
      return args?.where?.status === 'PENDING' ? 4 : 9;
    });
    findSettings.mockImplementation(async () => {
      calls.push('read');
      return { minimumWage: 1_000_000 };
    });
    findBenefits.mockImplementation(async () => {
      calls.push('read');
      return [];
    });
  });

  it('syncs fees before counting and reminds the benefit of the current month', async () => {
    findBenefits.mockResolvedValue([
      { id: 'mother', name: 'Día de la madre', suggestedMonth: 5 },
    ]);

    const result = await getDashboard('user-1', may10);

    expect(calls[0]).toBe('sync');
    expect(calls.indexOf('read')).toBeGreaterThan(0);
    expect(ensureFeesUpToDate).toHaveBeenCalledWith(may10, {
      actorId: 'user-1',
      source: 'request',
    });
    expect(memberCount).toHaveBeenCalledWith({
      where: { status: 'ACTIVE' },
    });
    expect(memberCount).toHaveBeenCalledWith({
      where: {
        status: 'ACTIVE',
        fees: { some: { type: 'MONTHLY', status: 'OVERDUE' } },
      },
    });
    expect(feeCount).toHaveBeenCalledWith({
      where: {
        type: 'MONTHLY',
        periodYear: 2026,
        periodMonth: 5,
        status: 'PENDING',
      },
    });
    expect(feeCount).toHaveBeenCalledWith({
      where: { type: 'MONTHLY', status: 'OVERDUE' },
    });
    expect(findBenefits).toHaveBeenCalledWith({
      where: { isActive: true, suggestedMonth: 5 },
      select: { id: true, name: true, suggestedMonth: true },
      orderBy: { name: 'asc' },
    });
    expect(result).toEqual({
      today: '2026-05-10',
      year: 2026,
      month: 5,
      minimumWage: 1_000_000,
      activeMembers: 8,
      activeMembersInArrears: 2,
      pendingFeesThisMonth: 4,
      overdueFees: 9,
      reminders: [
        { id: 'mother', name: 'Día de la madre', suggestedMonth: 5 },
      ],
    });
  });

  it('reminds father day in June and the year-end bonus in December', async () => {
    findBenefits.mockResolvedValueOnce([
      { id: 'father', name: 'Día del padre', suggestedMonth: 6 },
    ]);
    const june = await getDashboard('user-1', jun15);
    expect(findBenefits).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, suggestedMonth: 6 },
      }),
    );
    expect(june.reminders.map((item) => item.name)).toEqual(['Día del padre']);

    findBenefits.mockResolvedValueOnce([
      { id: 'bonus', name: 'Aguinaldo', suggestedMonth: 12 },
    ]);
    const december = await getDashboard('user-1', dec1);
    expect(findBenefits).toHaveBeenLastCalledWith(
      expect.objectContaining({
        where: { isActive: true, suggestedMonth: 12 },
      }),
    );
    expect(december.month).toBe(12);
    expect(december.reminders.map((item) => item.name)).toEqual(['Aguinaldo']);
  });

  it('returns no reminder when the month has no active benefit', async () => {
    const result = await getDashboard('user-1', oct10);
    expect(findBenefits).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true, suggestedMonth: 10 },
      }),
    );
    expect(result.reminders).toEqual([]);
    expect(result.month).toBe(10);
  });

  it('drops a benefit that has no suggested month', async () => {
    findBenefits.mockResolvedValue([
      { id: 'trip', name: 'Paseo o día de sol', suggestedMonth: null },
    ]);
    const result = await getDashboard('user-1', oct10);
    expect(result.reminders).toEqual([]);
  });

  it('still syncs fees and returns counts when the minimum wage is zero', async () => {
    findSettings.mockResolvedValue({ minimumWage: 0 });
    const result = await getDashboard('user-1', may10);
    expect(ensureFeesUpToDate).toHaveBeenCalled();
    expect(result.minimumWage).toBe(0);
    expect(result.activeMembers).toBe(8);
    expect(result.overdueFees).toBe(9);
  });

  it('fails when settings are missing', async () => {
    findSettings.mockResolvedValue(null);
    await expect(getDashboard('user-1', may10)).rejects.toMatchObject({
      status: 500,
      message: 'No hay parámetros configurados.',
    });
  });

  it('does not read counts when the fee sync fails', async () => {
    ensureFeesUpToDate.mockRejectedValue(new Error('db down'));
    await expect(getDashboard('user-1', may10)).rejects.toThrow('db down');
    expect(memberCount).not.toHaveBeenCalled();
    expect(feeCount).not.toHaveBeenCalled();
  });
});
