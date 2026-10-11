export const PUBLIC_ROUTES = ['/login', '/'];
export const CHANGE_PASSWORD_ROUTE = '/cambiar-clave';

export type SessionStatus = 'unknown' | 'checking' | 'ready';

export type AuthGateDecision =
  | { allow: true }
  | { allow: false; reason: 'wait' | 'redirect-login' | 'redirect-password' };

export function normalizePathname(pathname: string | null | undefined): string {
  if (!pathname) return '';
  if (pathname.endsWith('/') && pathname.length > 1) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isPublicPath(pathname: string | null | undefined): boolean {
  const path = normalizePathname(pathname);
  return PUBLIC_ROUTES.includes(path);
}

export function isAuthRequiredPath(pathname: string | null | undefined): boolean {
  return !isPublicPath(pathname);
}

export function resolveAuthGate(input: {
  pathname: string | null | undefined;
  userEmail?: string | null;
  sessionStatus: SessionStatus;
  mustChangePassword?: boolean;
}): AuthGateDecision {
  const path = normalizePathname(input.pathname);

  if (isPublicPath(path)) {
    return { allow: true };
  }

  if (input.sessionStatus !== 'ready') {
    return { allow: false, reason: 'wait' };
  }

  if (!input.userEmail) {
    return { allow: false, reason: 'redirect-login' };
  }

  if (input.mustChangePassword && path !== CHANGE_PASSWORD_ROUTE) {
    return { allow: false, reason: 'redirect-password' };
  }

  return { allow: true };
}
