import { Prisma } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('server-only', () => ({}));

const findMinimumWage = vi.fn();
const findProfile = vi.fn();
const findBenefitsByIds = vi.fn();
const createProfileRecord = vi.fn();
const replaceProfileBenefits = vi.fn();
const createAuditLog = vi.fn();

vi.mock('@/server/db/prisma', () => ({
  prisma: {
    $transaction: (fn: (tx: unknown) => unknown) => fn({}),
  },
}));

vi.mock('./profiles.repository', () => ({
  findMinimumWage: (...args: unknown[]) => findMinimumWage(...args),
  findProfile: (...args: unknown[]) => findProfile(...args),
  findBenefitsByIds: (...args: unknown[]) => findBenefitsByIds(...args),
  listProfiles: vi.fn(),
  listBenefitOptions: vi.fn(),
  createProfileRecord: (...args: unknown[]) => createProfileRecord(...args),
  updateProfileRecord: vi.fn(),
  replaceProfileBenefits: (...args: unknown[]) => replaceProfileBenefits(...args),
  createAuditLog: (...args: unknown[]) => createAuditLog(...args),
}));

import { createProfile, profileFullFee, toProfileDto } from './profiles.service';

const benefitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';

describe('profileFullFee', () => {
  it('quotes 1.70% of a 1,000,000 wage as 17,000 and zero wage as 0', () => {
    expect(profileFullFee(1_000_000, '1.70')).toBe(17_000);
    expect(profileFullFee(0, '1.70')).toBe(0);
  });
});

describe('toProfileDto', () => {
  it('keeps the percent as text and lists benefit names', () => {
    const dto = toProfileDto(
      {
        id: 'profile-1',
        name: 'General',
        percent: new Prisma.Decimal('1.70'),
        isActive: true,
        benefits: [
          {
            benefitId,
            benefit: { id: benefitId, name: 'Aguinaldo' },
          },
        ],
      },
      1_000_000,
    );
    expect(dto).toMatchObject({
      percent: '1.70',
      fullFee: 17_000,
      benefitNames: ['Aguinaldo'],
    });
  });
});

describe('createProfile', () => {
  beforeEach(() => {
    findBenefitsByIds.mockReset();
    createProfileRecord.mockReset();
    replaceProfileBenefits.mockReset();
    findProfile.mockReset();
    findMinimumWage.mockReset();
    createAuditLog.mockReset();
    createAuditLog.mockResolvedValue({ id: 'audit-1' });
    findMinimumWage.mockResolvedValue({ minimumWage: 1_000_000 });
  });

  it('audits the profile and its resulting fee', async () => {
    findBenefitsByIds.mockResolvedValue([{ id: benefitId }]);
    createProfileRecord.mockResolvedValue({ id: 'profile-1', benefits: [] });
    findProfile.mockResolvedValue({
      id: 'profile-1',
      name: 'General',
      percent: new Prisma.Decimal('1.70'),
      isActive: true,
      benefits: [{ benefitId, benefit: { id: benefitId, name: 'Aguinaldo' } }],
    });

    const result = await createProfile('admin-1', {
      name: 'General',
      percent: '1.70',
      benefitIds: [benefitId],
    });

    expect(result.fullFee).toBe(17_000);
    expect(createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        entity: 'profile',
        action: 'profile.create',
      }),
      expect.anything(),
    );
  });

  it('rejects unknown benefits before creating', async () => {
    findBenefitsByIds.mockResolvedValue([]);
    await expect(
      createProfile('admin-1', {
        name: 'General',
        percent: '1.70',
        benefitIds: [benefitId],
      }),
    ).rejects.toMatchObject({ status: 400 });
    expect(createProfileRecord).not.toHaveBeenCalled();
  });

  it('maps a duplicate name to 409', async () => {
    findBenefitsByIds.mockResolvedValue([]);
    createProfileRecord.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique', {
        code: 'P2002',
        clientVersion: 'test',
      }),
    );
    await expect(
      createProfile('admin-1', {
        name: 'General',
        percent: '1.70',
        benefitIds: [],
      }),
    ).rejects.toMatchObject({ status: 409 });
  });
});
