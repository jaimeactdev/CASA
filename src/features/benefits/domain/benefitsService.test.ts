import { describe, expect, it } from 'vitest';
import { toBenefitPayload, validateBenefitForm } from './benefitsTypes';
import { emptyBenefitForm } from './benefitsTypes';

describe('validateBenefitForm', () => {
  it('requires public text only when the benefit is public', () => {
    const values = {
      ...emptyBenefitForm(),
      name: 'Aguinaldo',
      internalDescription: 'Fin de año',
      isPublic: true,
      publicText: '',
    };
    expect(validateBenefitForm(values).publicText).toMatch(/texto público/);
    expect(
      validateBenefitForm({ ...values, isPublic: false }).publicText,
    ).toBeUndefined();
  });

  it('forces a single yearly delivery on an annual benefit', () => {
    const values = {
      ...emptyBenefitForm(),
      name: 'Aguinaldo',
      internalDescription: 'Fin de año',
      type: 'ANNUAL' as const,
      maxDeliveriesPerYear: '4',
    };
    expect(validateBenefitForm(values)).toEqual({});
    expect(toBenefitPayload(values).maxDeliveriesPerYear).toBe(1);
  });

  it('rejects an eventual benefit with 13 deliveries', () => {
    const values = {
      ...emptyBenefitForm(),
      name: 'Lentes',
      internalDescription: 'Auxilio',
      type: 'EVENTUAL' as const,
      maxDeliveriesPerYear: '13',
    };
    expect(validateBenefitForm(values).maxDeliveriesPerYear).toMatch(/1 a 12/);
  });
});
