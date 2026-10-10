import { describe, expect, it } from 'vitest';
import { resolveAuthGate } from './resolveAuthGate';

describe('resolveAuthGate', () => {
  it('allows /login, / and template routes without a session', () => {
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
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: undefined,
        sessionStatus: 'ready',
      }),
    ).toEqual({ allow: true });
    expect(
      resolveAuthGate({
        pathname: '/form',
        userEmail: undefined,
        sessionStatus: 'checking',
      }),
    ).toEqual({ allow: true });
  });

  it('waits while the session is not ready on a protected route', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: 'a@b.com',
        sessionStatus: 'checking',
        authRequiredRoutes: ['/home'],
      }),
    ).toEqual({ allow: false, reason: 'wait' });
  });

  it('redirects to login when a protected route has no user', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: undefined,
        sessionStatus: 'ready',
        authRequiredRoutes: ['/home'],
      }),
    ).toEqual({ allow: false, reason: 'redirect-login' });
  });

  it('allows a protected route when the user and session are ready', () => {
    expect(
      resolveAuthGate({
        pathname: '/home',
        userEmail: 'a@b.com',
        sessionStatus: 'ready',
        authRequiredRoutes: ['/home'],
      }),
    ).toEqual({ allow: true });
  });
});
