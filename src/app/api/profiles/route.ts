import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createProfileSchema } from '@/server/modules/profiles/profiles.schema';
import {
  createProfile,
  getProfilesPage,
} from '@/server/modules/profiles/profiles.service';

export async function GET() {
  try {
    await requirePermission('profiles.view');
    return jsonOk(await getProfilesPage());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('profiles.manage');
    const body = await request.json().catch(() => null);
    const parsed = createProfileSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createProfile(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
