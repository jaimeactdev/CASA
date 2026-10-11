import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  paymentMethodIdSchema,
  updatePaymentMethodSchema,
} from '@/server/modules/settings/settings.schema';
import { updatePaymentMethod } from '@/server/modules/settings/settings.service';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('settings.edit');
    const { id } = await context.params;
    const idParsed = paymentMethodIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'El medio de pago no es válido.');
    }

    const body = await request.json().catch(() => null);
    const parsed = updatePaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }

    return jsonOk(await updatePaymentMethod(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
