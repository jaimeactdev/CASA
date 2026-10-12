import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import {
  deliveryIdSchema,
  voidDeliverySchema,
} from '@/server/modules/deliveries/deliveries.schema';
import { voidDelivery } from '@/server/modules/deliveries/deliveries.service';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requirePermission('benefits.void_delivery');
    const { id } = await context.params;
    const idParsed = deliveryIdSchema.safeParse(id);
    if (!idParsed.success) {
      return jsonError(400, 'La entrega no es válida.');
    }
    const body = await request.json().catch(() => null);
    const parsed = voidDeliverySchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa la nota de la anulación.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await voidDelivery(session.id, idParsed.data, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
