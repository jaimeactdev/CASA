import { describe, expect, it } from 'vitest';
import {
  formatMemberNumber,
  formatPesos,
  matchesMemberSearch,
  validateMemberForm,
  emptyMemberForm,
  toCreatePayload,
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
