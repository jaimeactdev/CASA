import { describe, expect, it } from 'vitest';
import { siteQuerySchema } from './site.schema';

describe('siteQuerySchema', () => {
  it('accepts an empty query and rejects extra parameters', () => {
    expect(siteQuerySchema.safeParse({}).success).toBe(true);
    expect(siteQuerySchema.safeParse({ memberId: 'x' }).success).toBe(false);
  });
});
