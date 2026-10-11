import { loginSchema } from '@/server/modules/auth/auth.schema';
import { login } from '@/server/modules/auth/auth.service';
import { writeSessionCookie } from '@/server/auth/session';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, 'Revisa los datos del formulario.', parsed.error.flatten());
    }
    const user = await login(parsed.data);
    await writeSessionCookie(user.id);
    return jsonOk(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
