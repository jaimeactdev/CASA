import { LoginRepository } from '../data/repositories/LoginRepository';
import ArgumentNullException from '@/core/exceptions/argument_null_exception';
import type { User } from '@/core/store/useUserStore';
import {
  validateCredentials,
  type LoginCredentials,
  type LoginErrors,
} from './loginTypes';

export type SignInResult =
  | { ok: true; user: User }
  | { ok: false; errors: LoginErrors };

export function toSessionUser(payload: unknown): User | null {
  const data = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!data || typeof data !== 'object') return null;
  const row = data as Record<string, unknown>;
  const email = typeof row.email === 'string' ? row.email : undefined;
  if (!email) return null;
  return {
    id: typeof row.id === 'string' ? row.id : undefined,
    name: typeof row.name === 'string' ? row.name : undefined,
    email,
    rol: typeof row.rol === 'string' ? row.rol : undefined,
    permissions: Array.isArray(row.permissions)
      ? row.permissions.filter((item): item is string => typeof item === 'string')
      : [],
    mustChangePassword: row.mustChangePassword === true,
  };
}

export class LoginService {
  constructor(private repo = new LoginRepository()) {}

  async signIn(values: LoginCredentials): Promise<SignInResult> {
    const errors = validateCredentials(values);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }

    const response = await this.repo.signIn({
      email: values.email.trim().toLowerCase(),
      password: values.password,
    });
    const user = toSessionUser(response);
    if (!user) {
      throw new ArgumentNullException('Response is empty');
    }
    return { ok: true, user };
  }

  async getConnectedUser(): Promise<User | null> {
    const response = await this.repo.getConnectedUserInfo();
    return toSessionUser(response);
  }

  async logout(): Promise<void> {
    try {
      await this.repo.logout();
    } catch (error) {
      console.error('Error closing the session against the server:', error);
    }
  }
}
