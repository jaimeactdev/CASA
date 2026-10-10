export const PUBLIC_ROUTES = ['/login', '/'];

/**
 * Routes that require a session. Empty in this template so guests can browse.
 * A product can list paths here (or mark the menu item with status `R`)
 * for screens that require a signed-in user.
 */
export const AUTH_REQUIRED_ROUTES: readonly string[] = [];

export type SessionStatus = 'unknown' | 'checking' | 'ready';

export type AuthGateDecision =
  | { allow: true }
  | { allow: false; reason: 'wait' | 'redirect-login' };

export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return '';
  if (pathname.endsWith('/') && pathname.length > 1) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isAuthRequiredPath(
  pathname: string | null | undefined,
  authRequiredRoutes: readonly string[] = AUTH_REQUIRED_ROUTES,
): boolean {
  const path = normalizePathname(pathname);
  return authRequiredRoutes.some(
    (route) => path === route || path.startsWith(`${route}/`),
  );
}

/**
 * Pure guard decision: no I/O. Remote revalidation happens in login
 * (SessionBinder) and writes the result to the store.
 *
 * In this template routes are public except `authRequiredRoutes`.
 */
export function resolveAuthGate(input: {
  pathname: string | null | undefined;
  userEmail?: string | null;
  sessionStatus: SessionStatus;
  authRequiredRoutes?: readonly string[];
}): AuthGateDecision {
  const path = normalizePathname(input.pathname);
  const requiredRoutes = input.authRequiredRoutes ?? AUTH_REQUIRED_ROUTES;

  if (!isAuthRequiredPath(path, requiredRoutes)) {
    return { allow: true };
  }

  if (input.sessionStatus !== 'ready') {
    return { allow: false, reason: 'wait' };
  }

  if (!input.userEmail) {
    return { allow: false, reason: 'redirect-login' };
  }

  return { allow: true };
}
