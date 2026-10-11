import { describe, expect, it } from 'vitest';
import { evaluateBenefit, sexMatchesAudience } from './benefits';

const eligible = {
  memberStatus: 'ACTIVE' as const,
  profileIncludesBenefit: true,
  memberSex: 'FEMALE' as const,
  audience: 'FEMALE' as const,
  paidMonthlyFeesInYear: 0,
  minPaidFeesInYear: 0,
  deliveriesThisYear: 0,
  maxDeliveriesPerYear: 1,
  requiresMinimumSetup: false,
};

function passed(evaluation: ReturnType<typeof evaluateBenefit>, key: string) {
  return evaluation.conditions.find((condition) => condition.key === key)?.passed;
}

describe('sexMatchesAudience (§8.6)', () => {
  it('gives Mother\'s Day only to women', () => {
    expect(sexMatchesAudience('FEMALE', 'FEMALE')).toBe(true);
    expect(sexMatchesAudience('MALE', 'FEMALE')).toBe(false);
    expect(sexMatchesAudience('UNSPECIFIED', 'FEMALE')).toBe(false);
  });

  it('gives Father\'s Day only to men', () => {
    expect(sexMatchesAudience('MALE', 'MALE')).toBe(true);
    expect(sexMatchesAudience('FEMALE', 'MALE')).toBe(false);
    expect(sexMatchesAudience('UNSPECIFIED', 'MALE')).toBe(false);
  });

  it('gives aguinaldo to every sex, including unspecified', () => {
    expect(sexMatchesAudience('FEMALE', 'ALL')).toBe(true);
    expect(sexMatchesAudience('MALE', 'ALL')).toBe(true);
    expect(sexMatchesAudience('UNSPECIFIED', 'ALL')).toBe(true);
  });
});

describe('evaluateBenefit (§8.6)', () => {
  it('allows a normal delivery when every condition passes', () => {
    const result = evaluateBenefit(eligible);
    expect(result.canDeliver).toBe(true);
    expect(result.canDeliverWithException).toBe(true);
    expect(result.conditions).toHaveLength(6);
    expect(result.conditions.every((condition) => condition.passed)).toBe(true);
  });

  it('blocks Mother\'s Day for a man and still allows exception', () => {
    const result = evaluateBenefit({ ...eligible, memberSex: 'MALE' });
    expect(passed(result, 'sexMatches')).toBe(false);
    expect(result.canDeliver).toBe(false);
    expect(result.canDeliverWithException).toBe(true);
  });

  it('blocks a suspended or retired member (exception still possible)', () => {
    const suspended = evaluateBenefit({ ...eligible, memberStatus: 'SUSPENDED' });
    expect(passed(suspended, 'memberActive')).toBe(false);
    expect(suspended.canDeliverWithException).toBe(true);

    const retired = evaluateBenefit({ ...eligible, memberStatus: 'RETIRED' });
    expect(passed(retired, 'memberActive')).toBe(false);
    expect(retired.canDeliver).toBe(false);
  });

  it('requires the profile to include the benefit', () => {
    const result = evaluateBenefit({ ...eligible, profileIncludesBenefit: false });
    expect(passed(result, 'profileIncludesBenefit')).toBe(false);
    expect(result.canDeliver).toBe(false);
    expect(result.canDeliverWithException).toBe(true);
  });

  it('requires the minimum paid monthly fees of that calendar year', () => {
    const result = evaluateBenefit({
      ...eligible,
      audience: 'ALL',
      paidMonthlyFeesInYear: 2,
      minPaidFeesInYear: 3,
    });
    expect(passed(result, 'minPaidFeesMet')).toBe(false);
    expect(result.canDeliver).toBe(false);
    expect(result.canDeliverWithException).toBe(true);
  });

  it('treats a reduced first monthly fee as one paid month toward the minimum', () => {
    const result = evaluateBenefit({
      ...eligible,
      audience: 'ALL',
      paidMonthlyFeesInYear: 1,
      minPaidFeesInYear: 1,
    });
    expect(passed(result, 'minPaidFeesMet')).toBe(true);
    expect(result.canDeliver).toBe(true);
  });

  it('blocks a second annual delivery and does not allow exception', () => {
    const result = evaluateBenefit({
      ...eligible,
      deliveriesThisYear: 1,
      maxDeliveriesPerYear: 1,
    });
    expect(passed(result, 'quotaAvailable')).toBe(false);
    expect(result.canDeliver).toBe(false);
    expect(result.canDeliverWithException).toBe(false);
  });

  it('blocks the outing while requiresMinimumSetup and min is still 0', () => {
    const result = evaluateBenefit({
      ...eligible,
      audience: 'ALL',
      minPaidFeesInYear: 0,
      requiresMinimumSetup: true,
    });
    expect(passed(result, 'minimumConfigured')).toBe(false);
    expect(result.canDeliver).toBe(false);
    expect(result.canDeliverWithException).toBe(true);
  });

  it('allows the outing once the minimum is configured and met', () => {
    const result = evaluateBenefit({
      ...eligible,
      audience: 'ALL',
      paidMonthlyFeesInYear: 4,
      minPaidFeesInYear: 4,
      requiresMinimumSetup: true,
    });
    expect(passed(result, 'minimumConfigured')).toBe(true);
    expect(result.canDeliver).toBe(true);
  });
});
