import type { User } from '@/core/store/useUserStore';

/**
 * Session contract for core/shared. The implementation lives in features/login.
 * core and shared do not import the feature; the feature registers the port on mount.
 */
export type SessionPort = {
  revalidateCurrentUser: () => Promise<User | null>;
  logout: () => Promise<void>;
};

let port: SessionPort | null = null;

export function registerSessionPort(next: SessionPort): void {
  port = next;
}

export function getSessionPort(): SessionPort | null {
  return port;
}
