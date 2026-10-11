import { describe, expect, it } from 'vitest';
import { resolveAuthGate } from './resolveAuthGate';

describe('resolveAuthGate', () => {
  it('allows /login and / without a session', () => {
    expect(
      resolveAuthGate({
        pathname: '/login',
        userEmail: undefined,
        sessionStatus: 'ready',
      }),
    ).toEqual({ allow: true });
    expect(
      resolveAuthGate({
        pathname: '/',
        userEmail: undefined,
        sessionStatus: 'ready',
      }),
    ).toEqual({ allow: true });
  });

  it('waits while the session is not ready on a protected route', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: 'a@b.com',
        sessionStatus: 'checking',
      }),
    ).toEqual({ allow: false, reason: 'wait' });
  });

  it('redirects to login when a protected route has no user', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: undefined,
        sessionStatus: 'ready',
      }),
    ).toEqual({ allow: false, reason: 'redirect-login' });
  });

  it('sends a user with mustChangePassword to /cambiar-clave', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: 'a@b.com',
        sessionStatus: 'ready',
        mustChangePassword: true,
      }),
    ).toEqual({ allow: false, reason: 'redirect-password' });
    expect(
      resolveAuthGate({
        pathname: '/cambiar-clave',
        userEmail: 'a@b.com',
        sessionStatus: 'ready',
        mustChangePassword: true,
      }),
    ).toEqual({ allow: true });
  });

  it('allows a protected route when the user and session are ready', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: 'a@b.com',
        sessionStatus: 'ready',
      }),
    ).toEqual({ allow: true });
  });
});
