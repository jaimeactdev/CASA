import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  feeIdSchema,
  revertFeeSchema,
} from '@/server/modules/fees/fees.schema';
import { revertFee } from '@/server/modules/fees/fees.service';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('fees.revert');
    const { id } = await context.params;
    const idParsed = feeIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'La cuota no es válida.');
    }
    const body = await request.json().catch(() => null);
    const parsed = revertFeeSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa la nota de la corrección.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await revertFee(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
