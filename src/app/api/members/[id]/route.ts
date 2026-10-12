import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  memberIdSchema,
  updateMemberSchema,
} from '@/server/modules/members/members.schema';
import { getMember, updateMember } from '@/server/modules/members/members.service';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('members.view');
    const { id } = await context.params;
    const idParsed = memberIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El afiliado no es válido.');
    }
    return jsonOk(await getMember(idParsed.data, new Date(), session.id));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('members.edit');
    const { id } = await context.params;
    const idParsed = memberIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El afiliado no es válido.');
    }
    const body = await request.json().catch(() => null);
    const parsed = updateMemberSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await updateMember(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
