import { describe, expect, it } from 'vitest';
import { createMemberSchema, updateMemberSchema } from './members.schema';

const validCreate = {
  documentType: 'CC',
  documentNumber: '12345678',
  firstNames: 'Ana',
  lastNames: 'Pérez',
  sex: 'FEMALE',
  birthDate: '1980-05-20',
  mobilePhone: '3001234567',
  address: 'Calle 1 # 2-3',
  residenceCity: 'Medellín',
  profileId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
};

describe('createMemberSchema', () => {
  it('accepts a valid alta and trims text', () => {
    expect(
      createMemberSchema.parse({
        ...validCreate,
        firstNames: '  Ana  ',
        chargeEnrollment: true,
        joinedOn: '2026-10-16',
      }),
    ).toMatchObject({
      firstNames: 'Ana',
      chargeEnrollment: true,
      joinedOn: '2026-10-16',
    });
  });

  it('rejects an invalid date and an unknown document type', () => {
    expect(
      createMemberSchema.safeParse({ ...validCreate, birthDate: '2026-02-31' })
        .success,
    ).toBe(false);
    expect(
      createMemberSchema.safeParse({ ...validCreate, documentType: 'TI' }).success,
    ).toBe(false);
  });

  it('accepts an empty email as null and rejects a bad one', () => {
    expect(createMemberSchema.parse({ ...validCreate, email: '  ' }).email).toBe(
      null,
    );
    expect(
      createMemberSchema.safeParse({ ...validCreate, email: 'no-es-correo' })
        .success,
    ).toBe(false);
  });
});

describe('updateMemberSchema', () => {
  it('rejects an empty patch', () => {
    expect(updateMemberSchema.safeParse({}).success).toBe(false);
  });

  it('accepts a status change', () => {
    expect(updateMemberSchema.parse({ status: 'SUSPENDED' })).toEqual({
      status: 'SUSPENDED',
    });
  });
});
