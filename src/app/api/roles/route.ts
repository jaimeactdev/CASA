import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createRoleSchema } from '@/server/modules/roles/roles.schema';
import { createRole, getRoles } from '@/server/modules/roles/roles.service';

export async function GET() {
  try {
    await requirePermission('roles.view');
    return jsonOk(await getRoles());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('roles.manage');
    const body = await request.json().catch(() => null);
    const parsed = createRoleSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createRole(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
