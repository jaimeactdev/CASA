import { describe, expect, it } from 'vitest';
import { homeQuerySchema } from './home.schema';

describe('homeQuerySchema', () => {
  it('accepts an empty query and rejects extra parameters', () => {
    expect(homeQuerySchema.safeParse({}).success).toBe(true);
    expect(homeQuerySchema.safeParse({ year: '2026' }).success).toBe(false);
  });
});
