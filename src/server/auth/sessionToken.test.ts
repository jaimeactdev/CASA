import { describe, expect, it } from 'vitest';
import { signSessionToken, verifySessionToken } from './sessionToken';

describe('sessionToken', () => {
  it('signs and verifies a user id', async () => {
    process.env.AUTH_SECRET = 'test-secret-for-session-token';
    const token = await signSessionToken('user-1');
    await expect(verifySessionToken(token)).resolves.toEqual({ userId: 'user-1' });
  });

  it('rejects a tampered token', async () => {
    process.env.AUTH_SECRET = 'test-secret-for-session-token';
    const token = await signSessionToken('user-1');
    await expect(verifySessionToken(`${token}x`)).resolves.toBeNull();
  });
});
