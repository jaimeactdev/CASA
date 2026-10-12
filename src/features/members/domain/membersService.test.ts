import { describe, expect, it } from 'vitest';
import {
  deliveryMode,
  eligibilitySummary,
  emptyBenefitDeliveryForm,
  formatMemberNumber,
  formatPesos,
  matchesMemberSearch,
  validateBenefitDelivery,
  validateMemberForm,
  emptyMemberForm,
  toCreatePayload,
  toDeliverBenefitPayload,
  toIsoDateInput,
} from './membersTypes';

describe('formatMemberNumber', () => {
  it('pads the affiliation number to four digits', () => {
    expect(formatMemberNumber(1)).toBe('0001');
    expect(formatMemberNumber(128)).toBe('0128');
  });
});

describe('validateMemberForm', () => {
  it('requires identification, contact and an active profile', () => {
    const errors = validateMemberForm(emptyMemberForm());
    expect(errors.documentNumber).toMatch(/documento/);
    expect(errors.firstNames).toMatch(/nombres/);
    expect(errors.profileId).toMatch(/perfil/);
  });

  it('accepts a complete alta and keeps chargeEnrollment', () => {
    const values = {
      ...emptyMemberForm('2026-10-11'),
      documentNumber: '123',
      firstNames: 'Ana',
      lastNames: 'Pérez',
      birthDate: '1980-05-20',
      mobilePhone: '3001234567',
      address: 'Calle 1',
      residenceCity: 'Medellín',
      profileId: 'profile-1',
      chargeEnrollment: true,
    };
    expect(validateMemberForm(values)).toEqual({});
    expect(toCreatePayload(values).chargeEnrollment).toBe(true);
  });
});

describe('matchesMemberSearch', () => {
  const row = {
    fullName: 'Ana Pérez',
    firstNames: 'Ana',
    lastNames: 'Pérez',
    documentNumber: '12345678',
    memberNumberLabel: '0001',
    memberNumber: 1,
  } as Parameters<typeof matchesMemberSearch>[0];

  it('finds by name, document or number', () => {
    expect(matchesMemberSearch(row, 'pérez')).toBe(true);
    expect(matchesMemberSearch(row, '1234')).toBe(true);
    expect(matchesMemberSearch(row, '0001')).toBe(true);
    expect(matchesMemberSearch(row, 'zzz')).toBe(false);
  });
});

describe('toIsoDateInput', () => {
  it('keeps ISO and converts dd/MM/yyyy from DateFieldMUI', () => {
    expect(toIsoDateInput('2026-10-16')).toBe('2026-10-16');
    expect(toIsoDateInput('16/10/2026')).toBe('2026-10-16');
  });
});

describe('formatPesos', () => {
  it('formats Colombian pesos without decimals', () => {
    expect(formatPesos(17_000)).toMatch(/17.000/);
  });
});

describe('benefit delivery on the member card', () => {
  const eligible = { canDeliver: true, canDeliverWithException: true };
  const exceptionOnly = { canDeliver: false, canDeliverWithException: true };
  const noQuota = { canDeliver: false, canDeliverWithException: false };

  it('describes eligibility and who may confirm', () => {
    expect(eligibilitySummary(eligible)).toMatch(/Puede recibirlo/);
    expect(eligibilitySummary(exceptionOnly)).toMatch(/excepción/);
    expect(eligibilitySummary(noQuota)).toMatch(/cupo/);
    expect(deliveryMode(eligible, true, false)).toBe('normal');
    expect(deliveryMode(eligible, false, true)).toBe('normal');
    expect(deliveryMode(exceptionOnly, true, false)).toBe('forbidden');
    expect(deliveryMode(exceptionOnly, false, true)).toBe('exception');
    expect(deliveryMode(noQuota, true, true)).toBe('blocked');
  });

  it('requires a date in the card year and a note only for an exception', () => {
    const today = '2026-10-12';
    expect(
      validateBenefitDelivery(emptyBenefitDeliveryForm(''), today, 2026, false)
        .deliveredOn,
    ).toMatch(/obligatoria/);
    expect(
      validateBenefitDelivery(
        emptyBenefitDeliveryForm('2026-10-13'),
        today,
        2026,
        false,
      ).deliveredOn,
    ).toMatch(/futura/);
    expect(
      validateBenefitDelivery(
        emptyBenefitDeliveryForm('2025-12-20'),
        today,
        2026,
        false,
      ).deliveredOn,
    ).toMatch(/año de la ficha/);
    expect(
      validateBenefitDelivery(
        { deliveredOn: '12/10/2026', note: '' },
        today,
        2026,
        true,
      ).note,
    ).toMatch(/excepción/);
    expect(
      validateBenefitDelivery(
        { deliveredOn: '2026-10-12', note: 'Junta' },
        today,
        2026,
        true,
      ),
    ).toEqual({});
    expect(
      toDeliverBenefitPayload('member-1', 'benefit-1', {
        deliveredOn: '12/10/2026',
        note: '  ',
      }),
    ).toEqual({
      memberId: 'member-1',
      benefitId: 'benefit-1',
      deliveredOn: '2026-10-12',
      note: null,
    });
  });
});
