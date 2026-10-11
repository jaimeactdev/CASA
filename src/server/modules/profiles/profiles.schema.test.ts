import { describe, expect, it } from 'vitest';
import { createProfileSchema, updateProfileSchema } from './profiles.schema';

describe('createProfileSchema', () => {
  it('normalizes 1,70 to 1.70 and dedupes benefits', () => {
    const benefitId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    expect(
      createProfileSchema.parse({
        name: '  General  ',
        percent: '1,7',
        benefitIds: [benefitId, benefitId],
      }),
    ).toEqual({
      name: 'General',
      percent: '1.70',
      benefitIds: [benefitId],
    });
  });

  it('rejects 0 and more than 100', () => {
    expect(createProfileSchema.safeParse({ name: 'General', percent: '0' }).success).toBe(
      false,
    );
    expect(
      createProfileSchema.safeParse({ name: 'General', percent: '100.01' }).success,
    ).toBe(false);
    expect(
      createProfileSchema.safeParse({ name: 'General', percent: '100' }).success,
    ).toBe(true);
  });
});

describe('updateProfileSchema', () => {
  it('rejects an empty patch', () => {
    expect(updateProfileSchema.safeParse({}).success).toBe(false);
  });
});
