import { describe, expect, it } from 'vitest';
import { changePasswordSchema, loginSchema } from './auth.schema';

describe('loginSchema', () => {
  it('normalizes the email and rejects an empty password', () => {
    const parsed = loginSchema.safeParse({
      email: '  Ana@Casa.co ',
      password: '',
    });
    expect(parsed.success).toBe(false);
  });

  it('accepts a valid login', () => {
    const parsed = loginSchema.parse({
      email: '  Ana@Casa.co ',
      password: 'secreta123',
    });
    expect(parsed).toEqual({ email: 'ana@casa.co', password: 'secreta123' });
  });
});

describe('changePasswordSchema', () => {
  it('requires eight characters and a different password', () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'actual123',
        newPassword: 'corta',
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        currentPassword: 'igual1234',
        newPassword: 'igual1234',
      }).success,
    ).toBe(false);
  });

  it('accepts a valid change', () => {
    expect(
      changePasswordSchema.parse({
        currentPassword: 'actual123',
        newPassword: 'nueva1234',
      }),
    ).toEqual({
      currentPassword: 'actual123',
      newPassword: 'nueva1234',
    });
  });
});
