import { clearSessionCookie } from '@/server/auth/session';
import { handleRouteError, jsonOk } from '@/server/http/errors';

export async function POST() {
  try {
    await clearSessionCookie();
    return jsonOk({ ok: true });
  } catch (error) {
    return handleRouteError(error);
  }
}
