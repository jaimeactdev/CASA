import { requirePermission, requireSession } from '@/server/auth/permissions';
import { handleRouteError, HttpError, jsonError, jsonOk } from '@/server/http/errors';
import {
  deliverBenefitSchema,
  deliveriesQuerySchema,
} from '@/server/modules/deliveries/deliveries.schema';
import {
  deliverBenefit,
  getDeliveriesPage,
} from '@/server/modules/deliveries/deliveries.service';

function queryOf(request: Request): Record<string, string> {
  const params = new URL(request.url).searchParams;
  const raw: Record<string, string> = {};
  const year = params.get('year');
  const benefitId = params.get('benefitId');
  const memberId = params.get('memberId');
  if (year != null && year.trim() !== '') raw.year = year;
  if (benefitId != null && benefitId.trim() !== '') raw.benefitId = benefitId;
  if (memberId != null && memberId.trim() !== '') raw.memberId = memberId;
  return raw;
}

export async function GET(request: Request) {
  try {
    await requirePermission('benefits.view');
    const parsed = deliveriesQuerySchema.safeParse(queryOf(request));
    if (!parsed.success) {
      return jsonError(400, 'Revisa los filtros.', parsed.error.flatten());
    }
    return jsonOk(await getDeliveriesPage(parsed.data));
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const canDeliver = session.permissions.includes('benefits.deliver');
    const canDeliverException = session.permissions.includes(
      'benefits.deliver_exception',
    );
    if (!canDeliver && !canDeliverException) {
      throw new HttpError(403, 'No tienes permiso para esta acción.');
    }
    const body = await request.json().catch(() => null);
    const parsed = deliverBenefitSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos de la entrega.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(
      await deliverBenefit(
        session.id,
        { canDeliver, canDeliverException },
        parsed.data,
      ),
    );
  } catch (error) {
    return handleRouteError(error);
  }
}
