import { describe, expect, it } from 'vitest';
import {
  applyPercent,
  formatPercentHundredths,
  roundPesos,
  toPercentHundredths,
} from './money';

describe('toPercentHundredths', () => {
  it('parses Decimal(6,2) percents as hundredths', () => {
    expect(toPercentHundredths('1.70')).toBe(170);
    expect(toPercentHundredths('1.7')).toBe(170);
    expect(toPercentHundredths('0.50')).toBe(50);
    expect(toPercentHundredths('50')).toBe(5000);
    expect(toPercentHundredths('0')).toBe(0);
  });

  it('reads Prisma-like toFixed(2)', () => {
    expect(toPercentHundredths({ toFixed: () => '1.70' })).toBe(170);
  });

  it('rejects invalid percents', () => {
    expect(() => toPercentHundredths('1.705')).toThrow(/Invalid percent/);
    expect(() => toPercentHundredths('-1')).toThrow(/Invalid percent/);
    expect(() => toPercentHundredths('abc')).toThrow(/Invalid percent/);
  });
});

describe('formatPercentHundredths', () => {
  it('writes two decimal places', () => {
    expect(formatPercentHundredths(170)).toBe('1.70');
    expect(formatPercentHundredths(50)).toBe('0.50');
    expect(formatPercentHundredths(5000)).toBe('50.00');
  });
});

describe('roundPesos', () => {
  it('rounds to the nearest peso and 50 cents up (§7.1)', () => {
    expect(roundPesos(149, 100)).toBe(1);
    expect(roundPesos(150, 100)).toBe(2);
    expect(roundPesos(151, 100)).toBe(2);
    expect(roundPesos(1, 2)).toBe(1);
    expect(roundPesos(1, 3)).toBe(0);
    expect(roundPesos(17_000)).toBe(17_000);
  });
});

describe('applyPercent', () => {
  it('turns SMMLV $1.000.000 at 1,70% into $17.000 (§7.1 / §8)', () => {
    expect(applyPercent(1_000_000, toPercentHundredths('1.70'))).toBe(17_000);
  });

  it('turns SMMLV $1.000.000 at 0,50% into $5.000 of surcharge per month (§8.2)', () => {
    expect(applyPercent(1_000_000, toPercentHundredths('0.50'))).toBe(5_000);
  });

  it('rounds a 50-cent first-fee cut up', () => {
    expect(applyPercent(17_001, toPercentHundredths('50'))).toBe(8_501);
  });

  it('returns 0 when the percent is 0', () => {
    expect(applyPercent(1_000_000, 0)).toBe(0);
  });
});
