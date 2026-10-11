export type Sex = 'FEMALE' | 'MALE' | 'UNSPECIFIED';
export type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
export type BenefitAudience = 'ALL' | 'FEMALE' | 'MALE';

export const BENEFIT_CONDITION_KEYS = [
  'memberActive',
  'profileIncludesBenefit',
  'sexMatches',
  'minPaidFeesMet',
  'quotaAvailable',
  'minimumConfigured',
] as const;

export type BenefitConditionKey = (typeof BENEFIT_CONDITION_KEYS)[number];

export type BenefitConditionResult = {
  key: BenefitConditionKey;
  passed: boolean;
};

export type EvaluateBenefitInput = {
  memberStatus: MemberStatus;
  profileIncludesBenefit: boolean;
  memberSex: Sex;
  audience: BenefitAudience;
  paidMonthlyFeesInYear: number;
  minPaidFeesInYear: number;
  deliveriesThisYear: number;
  maxDeliveriesPerYear: number;
  requiresMinimumSetup: boolean;
};

export type BenefitEvaluation = {
  conditions: BenefitConditionResult[];
  canDeliver: boolean;
  canDeliverWithException: boolean;
};

/**
 * UNSPECIFIED does not match a women-only or men-only audience (§8.6).
 */
export function sexMatchesAudience(sex: Sex, audience: BenefitAudience): boolean {
  if (audience === 'ALL') return true;
  return sex === audience;
}

/**
 * Eligibility of one benefit for one member in a year.
 * Condition 5 (annual/eventual quota) cannot be waived by exception.
 */
export function evaluateBenefit(input: EvaluateBenefitInput): BenefitEvaluation {
  const conditions: BenefitConditionResult[] = [
    { key: 'memberActive', passed: input.memberStatus === 'ACTIVE' },
    { key: 'profileIncludesBenefit', passed: input.profileIncludesBenefit },
    {
      key: 'sexMatches',
      passed: sexMatchesAudience(input.memberSex, input.audience),
    },
    {
      key: 'minPaidFeesMet',
      passed: input.paidMonthlyFeesInYear >= input.minPaidFeesInYear,
    },
    {
      key: 'quotaAvailable',
      passed: input.deliveriesThisYear < input.maxDeliveriesPerYear,
    },
    {
      key: 'minimumConfigured',
      passed: !input.requiresMinimumSetup || input.minPaidFeesInYear > 0,
    },
  ];

  const quotaAvailable = conditions.find(
    (condition) => condition.key === 'quotaAvailable',
  )?.passed;

  return {
    conditions,
    canDeliver: conditions.every((condition) => condition.passed),
    canDeliverWithException: quotaAvailable === true,
  };
}
