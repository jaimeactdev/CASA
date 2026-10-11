import 'server-only';

import { cookies } from 'next/headers';
import {
  SESSION_COOKIE,
  sessionCookieOptions,
  signSessionToken,
  verifySessionToken,
} from './sessionToken';

export async function readSessionUserId(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const claims = await verifySessionToken(token);
  return claims?.userId ?? null;
}

export async function writeSessionCookie(userId: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, await signSessionToken(userId), sessionCookieOptions());
}

export async function clearSessionCookie(): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, '', { ...sessionCookieOptions(), maxAge: 0 });
}
