import { requireSession } from '@/server/auth/permissions';
import { changePasswordSchema } from '@/server/modules/auth/auth.schema';
import { changePassword } from '@/server/modules/auth/auth.service';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body = await request.json().catch(() => null);
    const parsed = changePasswordSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, 'Revisa los datos del formulario.', parsed.error.flatten());
    }
    const user = await changePassword(session.id, parsed.data);
    return jsonOk(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
