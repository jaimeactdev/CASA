import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  roleIdSchema,
  updateRoleSchema,
} from '@/server/modules/roles/roles.schema';
import { updateRole } from '@/server/modules/roles/roles.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('roles.manage');
    const { id } = await context.params;
    const idParsed = roleIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El rol no es válido.');
    }

    const body = await request.json().catch(() => null);
    const parsed = updateRoleSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }

    return jsonOk(await updateRole(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
