/**
 * Scaled-integer money. Amounts are pesos (Int). Percentages follow
 * Decimal(6,2) as integer hundredths of a percent: 1.70% → 170, 0.50% → 50.
 * No floating-point arithmetic on money.
 */

export type PercentHundredths = number;

/** 1.00% stored as 100 hundredths. */
export const PERCENT_SCALE = 100;

/** amountPesos × percentHundredths / 10_000 = amount × percent / 100. */
export const APPLY_PERCENT_DENOMINATOR = 10_000n;

function assertNonNegativeInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer.`);
  }
}

function toBigInt(value: number | bigint, label: string): bigint {
  if (typeof value === 'bigint') {
    if (value < 0n) {
      throw new Error(`${label} must be non-negative.`);
    }
    return value;
  }
  assertNonNegativeInteger(value, label);
  return BigInt(value);
}

/**
 * Parses a Decimal(6,2)-style percent into hundredths.
 * Accepts "1.70", "1.7", "0.50" or any object with `toFixed` (Prisma.Decimal).
 */
export function toPercentHundredths(
  value: string | { toFixed(digits: number): string },
): PercentHundredths {
  const text = typeof value === 'string' ? value.trim() : value.toFixed(2);
  const match = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
  if (!match) {
    throw new Error(`Invalid percent: ${text}`);
  }
  const whole = Number(match[1]);
  const fraction = (match[2] ?? '').padEnd(2, '0');
  return whole * PERCENT_SCALE + Number(fraction);
}

export function formatPercentHundredths(value: PercentHundredths): string {
  assertNonNegativeInteger(value, 'percent');
  const whole = Math.trunc(value / PERCENT_SCALE);
  const fraction = value % PERCENT_SCALE;
  return `${whole}.${String(fraction).padStart(2, '0')}`;
}

/**
 * Rounds a rational `numerator / denominator` to the nearest peso.
 * Ties (exactly 0.50) round up.
 */
export function roundPesos(
  numerator: number | bigint,
  denominator: number | bigint = 1,
): number {
  const n = toBigInt(numerator, 'numerator');
  const d = toBigInt(denominator, 'denominator');
  if (d === 0n) {
    throw new Error('denominator must be greater than 0.');
  }

  const quotient = n / d;
  const remainder = n % d;
  const rounded = remainder * 2n >= d ? quotient + 1n : quotient;
  return Number(rounded);
}

/** `roundPesos(amount × percent / 100)`. */
export function applyPercent(
  amountPesos: number,
  percentHundredths: PercentHundredths,
): number {
  assertNonNegativeInteger(amountPesos, 'amount');
  assertNonNegativeInteger(percentHundredths, 'percent');
  return roundPesos(
    BigInt(amountPesos) * BigInt(percentHundredths),
    APPLY_PERCENT_DENOMINATOR,
  );
}
