import { describe, expect, it } from 'vitest';
import { buildFeePreview } from './settingsService';
import {
  emptySettingsValues,
  formatPesos,
  moneyConfirmation,
  toSettingsPayload,
  validateSettings,
} from './settingsTypes';

describe('validateSettings', () => {
  it('accepts the initial parameter set', () => {
    const values = emptySettingsValues();
    values.name = 'Círculo de Apoyo y Servicios para Afiliados';
    values.acronym = 'CASA';
    values.serviceCity = 'Medellín';
    expect(validateSettings(values)).toEqual({});
  });

  it('rejects an empty name and an invalid cutoff day', () => {
    const values = emptySettingsValues();
    values.name = '  ';
    values.firstFeeCutoffDay = '29';
    expect(validateSettings(values)).toMatchObject({
      name: 'El nombre es obligatorio.',
      firstFeeCutoffDay: 'El día de corte va de 1 a 28.',
    });
  });
});

describe('moneyConfirmation', () => {
  it('asks for confirmation only when SMMLV or surcharge change', () => {
    const saved = toSettingsPayload(emptySettingsValues());
    const next = { ...saved, minimumWage: 1_000_000, surchargePercent: '0.50' };
    expect(moneyConfirmation(saved, next)).toEqual({
      minimumWage: { from: 0, to: 1_000_000 },
      surchargePercent: { from: '0.00', to: '0.50' },
    });
    expect(moneyConfirmation(saved, saved)).toBeNull();
  });
});

describe('buildFeePreview', () => {
  it('quotes each profile from SMMLV using src/rules', () => {
    const values = emptySettingsValues();
    values.minimumWage = '1000000';
    values.firstFeePercent = '50';
    values.surchargePercent = '0.50';
    const preview = buildFeePreview(values, [
      { id: 'p1', name: 'General', percent: '1.70' },
    ]);
    expect(preview.profiles[0]).toMatchObject({
      name: 'General',
      fullFee: 17_000,
      firstReducedFee: 8_500,
    });
    expect(preview.surchargePerMonth).toBe(5_000);
    expect(formatPesos(17_000)).toContain('17.000');
  });
});
