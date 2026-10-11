import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createMemberSchema } from '@/server/modules/members/members.schema';
import {
  createMember,
  getMembersPage,
} from '@/server/modules/members/members.service';

export async function GET() {
  try {
    await requirePermission('members.view');
    return jsonOk(await getMembersPage());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('members.create');
    const body = await request.json().catch(() => null);
    const parsed = createMemberSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createMember(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
