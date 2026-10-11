import 'server-only';

import { HttpError } from '@/server/http/errors';
import { readSessionUserId } from './session';
import { getSessionUser, type SessionUser } from '@/server/modules/auth/auth.service';

export async function requireSession(): Promise<SessionUser> {
  const userId = await readSessionUserId();
  if (!userId) {
    throw new HttpError(401, 'La sesión no es válida.');
  }
  return getSessionUser(userId);
}

export async function requirePermission(key: string): Promise<SessionUser> {
  const user = await requireSession();
  if (!user.permissions.includes(key)) {
    throw new HttpError(403, 'No tienes permiso para esta acción.');
  }
  return user;
}
