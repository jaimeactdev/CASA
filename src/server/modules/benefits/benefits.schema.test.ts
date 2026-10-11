import { describe, expect, it } from 'vitest';
import { createBenefitSchema, updateBenefitSchema } from './benefits.schema';

const annual = {
  name: 'Aguinaldo',
  internalDescription: 'Entrega de fin de año',
  publicText: 'Aguinaldo de navidad',
  isPublic: true,
  type: 'ANNUAL',
  audience: 'ALL',
  minPaidFeesInYear: 0,
  maxDeliveriesPerYear: 4,
  suggestedMonth: 12,
  requiresMinimumSetup: false,
};

describe('createBenefitSchema', () => {
  it('forces one delivery per year on an annual benefit', () => {
    expect(createBenefitSchema.parse(annual)).toMatchObject({
      name: 'Aguinaldo',
      maxDeliveriesPerYear: 1,
      suggestedMonth: 12,
      publicText: 'Aguinaldo de navidad',
    });
  });

  it('rejects an eventual benefit outside 1 to 12 and a public benefit without text', () => {
    expect(
      createBenefitSchema.safeParse({
        ...annual,
        type: 'EVENTUAL',
        maxDeliveriesPerYear: 13,
      }).success,
    ).toBe(false);
    expect(
      createBenefitSchema.safeParse({
        ...annual,
        isPublic: true,
        publicText: '   ',
      }).success,
    ).toBe(false);
    expect(
      createBenefitSchema.safeParse({
        ...annual,
        type: 'EVENTUAL',
        maxDeliveriesPerYear: 1,
        isPublic: false,
        publicText: null,
        suggestedMonth: null,
      }).success,
    ).toBe(true);
  });
});

describe('updateBenefitSchema', () => {
  it('accepts an active flag on its own', () => {
    expect(updateBenefitSchema.parse({ isActive: false })).toEqual({
      isActive: false,
    });
  });
});
