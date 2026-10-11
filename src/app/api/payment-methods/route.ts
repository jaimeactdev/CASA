import { requirePermission, requireSession } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createPaymentMethodSchema } from '@/server/modules/settings/settings.schema';
import {
  createPaymentMethod,
  getActivePaymentMethods,
} from '@/server/modules/settings/settings.service';

export async function GET() {
  try {
    await requireSession();
    return jsonOk(await getActivePaymentMethods());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('settings.edit');
    const body = await request.json().catch(() => null);
    const parsed = createPaymentMethodSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createPaymentMethod(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
