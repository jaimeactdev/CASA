import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { payFeesSchema } from '@/server/modules/fees/fees.schema';
import { payFees } from '@/server/modules/fees/fees.service';

export async function POST(request: Request) {
  try {
    const session = await requirePermission('fees.pay');
    const body = await request.json().catch(() => null);
    const parsed = payFeesSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del pago.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await payFees(session.id, parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}
