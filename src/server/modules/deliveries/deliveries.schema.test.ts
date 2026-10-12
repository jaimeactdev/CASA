import { describe, expect, it } from 'vitest';
import {
  deliverBenefitSchema,
  deliveriesQuerySchema,
  voidDeliverySchema,
} from './deliveries.schema';

const memberId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const benefitId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('deliveriesQuerySchema', () => {
  it('reads the year and the optional filters', () => {
    expect(
      deliveriesQuerySchema.parse({
        year: '2026',
        benefitId,
        memberId,
      }),
    ).toEqual({ year: 2026, benefitId, memberId });
    expect(deliveriesQuerySchema.parse({}).year).toBeUndefined();
  });

  it('rejects a year or an id that cannot be used', () => {
    expect(deliveriesQuerySchema.safeParse({ year: '1999' }).success).toBe(false);
    expect(deliveriesQuerySchema.safeParse({ benefitId: 'aguinaldo' }).success).toBe(
      false,
    );
  });
});

describe('deliverBenefitSchema', () => {
  it('trims the note and ignores a client-supplied exception flag', () => {
    const parsed = deliverBenefitSchema.parse({
      memberId,
      benefitId,
      deliveredOn: '2026-10-12',
      note: '  ventanilla  ',
      isException: true,
    });
    expect(parsed.deliveredOn).toBe('2026-10-12');
    expect(parsed.note).toBe('ventanilla');
    expect(parsed).not.toHaveProperty('isException');
  });

  it('turns a blank note into null and rejects a bad date', () => {
    expect(
      deliverBenefitSchema.parse({
        memberId,
        benefitId,
        deliveredOn: '2026-10-12',
        note: '   ',
      }).note,
    ).toBeNull();
    expect(
      deliverBenefitSchema.safeParse({
        memberId,
        benefitId,
        deliveredOn: '12/10/2026',
      }).success,
    ).toBe(false);
  });
});

describe('voidDeliverySchema', () => {
  it('requires a note and trims it', () => {
    expect(voidDeliverySchema.parse({ note: '  fue un error  ' }).note).toBe(
      'fue un error',
    );
    expect(voidDeliverySchema.safeParse({ note: '   ' }).success).toBe(false);
    expect(voidDeliverySchema.safeParse({}).success).toBe(false);
  });
});
