import { describe, expect, it } from 'vitest';
import { previewFullFee, validateProfileForm } from './profilesTypes';

describe('validateProfileForm', () => {
  it('accepts 1,70 and rejects 0', () => {
    expect(
      validateProfileForm({ name: 'General', percent: '1,70', benefitIds: [] }),
    ).toEqual({});
    expect(
      validateProfileForm({ name: 'General', percent: '0', benefitIds: [] }).percent,
    ).toMatch(/mayor que 0/);
  });
});

describe('previewFullFee', () => {
  it('shows 17,000 for 1.70% of a 1,000,000 wage', () => {
    expect(previewFullFee('1.70', 1_000_000)).toBe(17_000);
    expect(previewFullFee('1,70', 1_000_000)).toBe(17_000);
    expect(previewFullFee('1.70', 0)).toBe(0);
  });
});
