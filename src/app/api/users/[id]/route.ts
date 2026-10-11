import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  updateUserSchema,
  userIdSchema,
} from '@/server/modules/users/users.schema';
import { updateUser } from '@/server/modules/users/users.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('users.manage');
    const { id } = await context.params;
    const idParsed = userIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El usuario no es válido.');
    }

    const body = await request.json().catch(() => null);
    const parsed = updateUserSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }

    return jsonOk(await updateUser(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
