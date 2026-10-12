import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { feesQuerySchema } from '@/server/modules/fees/fees.schema';
import { getFeesPage } from '@/server/modules/fees/fees.service';

export async function GET(request: Request) {
  try {
    const session = await requirePermission('fees.view');
    const yearParam = new URL(request.url).searchParams.get('year');
    const parsed = feesQuerySchema.safeParse(
      yearParam == null || yearParam.trim() === '' ? {} : { year: yearParam },
    );
    if (!parsed.success) {
      return jsonError(400, 'El año no es válido.', parsed.error.flatten());
    }
    return jsonOk(await getFeesPage(session.id, parsed.data.year));
  } catch (error) {
    return handleRouteError(error);
  }
}
