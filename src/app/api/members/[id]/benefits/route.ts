import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  memberBenefitsQuerySchema,
  memberIdSchema,
} from '@/server/modules/members/members.schema';
import { getMemberBenefits } from '@/server/modules/members/members.service';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('benefits.view');
    const { id } = await context.params;
    const idParsed = memberIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El afiliado no es válido.');
    }
    const yearParam = new URL(request.url).searchParams.get('year');
    const parsed = memberBenefitsQuerySchema.safeParse(
      yearParam == null || yearParam.trim() === '' ? {} : { year: yearParam },
    );
    if (!parsed.success) {
      return jsonError(400, 'El año no es válido.', parsed.error.flatten());
    }
    return jsonOk(
      await getMemberBenefits(
        idParsed.data,
        parsed.data.year,
        new Date(),
        session.id,
      ),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
