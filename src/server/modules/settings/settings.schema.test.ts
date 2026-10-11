import { describe, expect, it } from 'vitest';
import {
  createPaymentMethodSchema,
  updatePaymentMethodSchema,
  updateSettingsSchema,
} from './settings.schema';

const validSettings = {
  name: 'Círculo de Apoyo y Servicios para Afiliados',
  acronym: 'CASA',
  serviceCity: 'Medellín',
  phone: '',
  contactEmail: '',
  address: null,
  openingHours: null,
  minimumWage: 0,
  firstFeeCutoffDay: 15,
  firstFeePercent: '50',
  graceDays: 3,
  surchargePercent: '0.5',
  enrollmentFee: 0,
  allowMultiFeePayment: true,
};

describe('updateSettingsSchema', () => {
  it('accepts the seed values and normalizes percents to two decimals', () => {
    expect(updateSettingsSchema.parse(validSettings)).toMatchObject({
      name: 'Círculo de Apoyo y Servicios para Afiliados',
      phone: null,
      contactEmail: null,
      firstFeePercent: '50.00',
      surchargePercent: '0.50',
    });
  });

  it('rejects out-of-range business fields from §9.3', () => {
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, minimumWage: -1 }).success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, firstFeeCutoffDay: 0 })
        .success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, firstFeeCutoffDay: 29 })
        .success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, firstFeePercent: '0' })
        .success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, firstFeePercent: '101' })
        .success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, graceDays: 16 }).success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({ ...validSettings, enrollmentFee: -1 })
        .success,
    ).toBe(false);
    expect(
      updateSettingsSchema.safeParse({
        ...validSettings,
        contactEmail: 'no-es-correo',
      }).success,
    ).toBe(false);
  });
});

describe('payment method schemas', () => {
  it('requires a name to create and rejects an empty patch', () => {
    expect(createPaymentMethodSchema.safeParse({ name: '  ' }).success).toBe(
      false,
    );
    expect(createPaymentMethodSchema.parse({ name: ' Nequi ' })).toEqual({
      name: 'Nequi',
    });
    expect(updatePaymentMethodSchema.safeParse({}).success).toBe(false);
    expect(updatePaymentMethodSchema.parse({ isActive: false })).toEqual({
      isActive: false,
    });
  });
});
