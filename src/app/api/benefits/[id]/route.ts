import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  benefitIdSchema,
  updateBenefitSchema,
} from '@/server/modules/benefits/benefits.schema';
import { updateBenefit } from '@/server/modules/benefits/benefits.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('benefits.manage');
    const { id } = await context.params;
    const idParsed = benefitIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El beneficio no es válido.');
    }
    const body = await request.json().catch(() => null);
    const parsed = updateBenefitSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await updateBenefit(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
