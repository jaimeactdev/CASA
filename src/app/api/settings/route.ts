import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { updateSettingsSchema } from '@/server/modules/settings/settings.schema';
import {
  getSettingsPage,
  updateSettings,
} from '@/server/modules/settings/settings.service';

export async function GET() {
  try {
    await requirePermission('settings.view');
    return jsonOk(await getSettingsPage());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requirePermission('settings.edit');
    const body = await request.json().catch(() => null);
    const parsed = updateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await updateSettings(session.id, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
