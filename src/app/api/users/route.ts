import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createUserSchema } from '@/server/modules/users/users.schema';
import { createUser, getUsersPage } from '@/server/modules/users/users.service';

export async function GET() {
  try {
    await requirePermission('users.view');
    return jsonOk(await getUsersPage());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('users.manage');
    const body = await request.json().catch(() => null);
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createUser(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
