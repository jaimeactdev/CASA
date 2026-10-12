import { describe, expect, it } from 'vitest';
import { feesQuerySchema, payFeesSchema, revertFeeSchema } from './fees.schema';

const feeId = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const methodId = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

describe('feesQuerySchema', () => {
  it('reads the year from the query string and allows omitting it', () => {
    expect(feesQuerySchema.parse({ year: '2026' }).year).toBe(2026);
    expect(feesQuerySchema.parse({}).year).toBeUndefined();
  });

  it('rejects a year outside the supported range', () => {
    expect(feesQuerySchema.safeParse({ year: '1999' }).success).toBe(false);
    expect(feesQuerySchema.safeParse({ year: 'no' }).success).toBe(false);
  });
});

describe('payFeesSchema', () => {
  it('accepts one or more fees and drops a client-supplied total', () => {
    const parsed = payFeesSchema.parse({
      feeIds: [feeId],
      paymentMethodId: methodId,
      paidOn: '2026-12-01',
      paymentNote: '  ventanilla  ',
      total: 1,
    });
    expect(parsed.paidOn).toBe('2026-12-01');
    expect(parsed.paymentNote).toBe('ventanilla');
    expect(parsed).not.toHaveProperty('total');
  });

  it('rejects duplicates, an empty selection and a future-invalid date', () => {
    expect(
      payFeesSchema.safeParse({
        feeIds: [feeId, feeId],
        paymentMethodId: methodId,
        paidOn: '2026-12-01',
      }).success,
    ).toBe(false);
    expect(
      payFeesSchema.safeParse({
        feeIds: [],
        paymentMethodId: methodId,
        paidOn: '2026-12-01',
      }).success,
    ).toBe(false);
    expect(
      payFeesSchema.safeParse({
        feeIds: [feeId],
        paymentMethodId: methodId,
        paidOn: '2026-02-31',
      }).success,
    ).toBe(false);
  });
});

describe('revertFeeSchema', () => {
  it('requires a note and trims it', () => {
    expect(revertFeeSchema.parse({ note: '  digitado dos veces  ' }).note).toBe(
      'digitado dos veces',
    );
    expect(revertFeeSchema.safeParse({ note: '   ' }).success).toBe(false);
  });
});
