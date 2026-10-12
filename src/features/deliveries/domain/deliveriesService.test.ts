import { describe, expect, it } from 'vitest';
import { toDeliveriesPage } from './deliveriesService';
import {
  matchesDeliveryFilters,
  validateVoidNote,
  type DeliveryRecord,
} from './deliveriesTypes';

const gift: DeliveryRecord = {
  id: 'delivery-1',
  memberId: 'member-1',
  memberNumber: 7,
  memberNumberLabel: '0007',
  memberName: 'Ana Pérez',
  benefitId: 'benefit-1',
  benefitName: 'Aguinaldo',
  year: 2026,
  deliveredOn: '2026-12-20',
  deliveredOnLabel: '20/12/2026',
  isException: false,
  exceptionLabel: 'No',
  isVoided: false,
  voidedLabel: 'No',
  note: '',
  voidNote: '',
  deliveredByName: 'Admin',
  voidedByName: '',
};

describe('toDeliveriesPage', () => {
  it('maps labels for Excel and unwraps the axios body', () => {
    const page = toDeliveriesPage({
      data: {
        today: '2026-10-12',
        year: 2026,
        benefits: [{ id: 'benefit-1', name: 'Aguinaldo' }],
        deliveries: [
          {
            id: 'delivery-1',
            memberId: 'member-1',
            memberNumber: 7,
            memberName: 'Ana Pérez',
            benefitId: 'benefit-1',
            benefitName: 'Aguinaldo',
            year: 2026,
            deliveredOn: '2026-12-20',
            isException: true,
            isVoided: false,
            note: 'Junta',
            voidNote: null,
            deliveredByName: 'Admin',
            voidedByName: null,
          },
        ],
      },
    });
    expect(page.year).toBe(2026);
    expect(page.benefits).toEqual([{ id: 'benefit-1', name: 'Aguinaldo' }]);
    expect(page.deliveries[0]).toMatchObject({
      memberNumberLabel: '0007',
      deliveredOnLabel: '20/12/2026',
      exceptionLabel: 'Sí',
      voidedLabel: 'No',
      note: 'Junta',
      deliveredByName: 'Admin',
    });
  });
});

describe('matchesDeliveryFilters', () => {
  it('filters by benefit, member, voided state and search', () => {
    const voided = { ...gift, id: 'delivery-2', isVoided: true, benefitId: 'other' };
    expect(matchesDeliveryFilters(gift, {
      search: 'ana',
      benefitId: '',
      memberId: '',
      voided: '',
    })).toBe(true);
    expect(matchesDeliveryFilters(gift, {
      search: '',
      benefitId: 'benefit-1',
      memberId: 'member-1',
      voided: 'no',
    })).toBe(true);
    expect(matchesDeliveryFilters(voided, {
      search: '',
      benefitId: '',
      memberId: '',
      voided: 'no',
    })).toBe(false);
    expect(matchesDeliveryFilters(gift, {
      search: '0008',
      benefitId: '',
      memberId: '',
      voided: '',
    })).toBe(false);
  });
});

describe('validateVoidNote', () => {
  it('requires a note of at most 500 characters', () => {
    expect(validateVoidNote('  ')).toMatch(/obligatoria/);
    expect(validateVoidNote('a'.repeat(501))).toMatch(/500/);
    expect(validateVoidNote('  fue un error  ')).toBe('');
  });
});
