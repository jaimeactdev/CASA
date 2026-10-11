import 'server-only';

import { HttpError } from '@/server/http/errors';
import { hashPassword, verifyPassword } from '@/server/auth/password';
import {
  findUserByEmail,
  findUserById,
  markUserLoggedIn,
  updateUserPassword,
} from './auth.repository';
import type { ChangePasswordInput, LoginInput } from './auth.schema';

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  rol: string;
  permissions: string[];
  mustChangePassword: boolean;
};

type UserRecord = NonNullable<Awaited<ReturnType<typeof findUserById>>>;

function toSessionUser(user: UserRecord): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    rol: user.role.name,
    permissions: user.role.permissions.map((item) => item.permission.key),
    mustChangePassword: user.mustChangePassword,
  };
}

const INVALID_CREDENTIALS = 'Correo o clave incorrectos.';

export async function login(input: LoginInput): Promise<SessionUser> {
  const user = await findUserByEmail(input.email);
  if (!user || !user.isActive) {
    throw new HttpError(400, INVALID_CREDENTIALS);
  }

  const matches = await verifyPassword(input.password, user.passwordHash);
  if (!matches) {
    throw new HttpError(400, INVALID_CREDENTIALS);
  }

  const updated = await markUserLoggedIn(user.id);
  return toSessionUser(updated);
}

export async function getSessionUser(userId: string): Promise<SessionUser> {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new HttpError(401, 'La sesión no es válida.');
  }
  return toSessionUser(user);
}

export async function changePassword(
  userId: string,
  input: ChangePasswordInput,
): Promise<SessionUser> {
  const user = await findUserById(userId);
  if (!user || !user.isActive) {
    throw new HttpError(401, 'La sesión no es válida.');
  }

  const matches = await verifyPassword(input.currentPassword, user.passwordHash);
  if (!matches) {
    throw new HttpError(400, 'La clave actual no es correcta.');
  }

  const updated = await updateUserPassword(
    user.id,
    await hashPassword(input.newPassword),
  );
  return toSessionUser(updated);
}
