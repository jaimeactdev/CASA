import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  profileIdSchema,
  updateProfileSchema,
} from '@/server/modules/profiles/profiles.schema';
import { updateProfile } from '@/server/modules/profiles/profiles.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('profiles.manage');
    const { id } = await context.params;
    const idParsed = profileIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El perfil no es válido.');
    }
    const body = await request.json().catch(() => null);
    const parsed = updateProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await updateProfile(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
