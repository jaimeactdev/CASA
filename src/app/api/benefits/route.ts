import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { createBenefitSchema } from '@/server/modules/benefits/benefits.schema';
import {
  createBenefit,
  getBenefits,
} from '@/server/modules/benefits/benefits.service';

export async function GET() {
  try {
    await requirePermission('benefits.view');
    return jsonOk(await getBenefits());
  } catch (error) {
    return handleRouteError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requirePermission('benefits.manage');
    const body = await request.json().catch(() => null);
    const parsed = createBenefitSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(
        400,
        'Revisa los datos del formulario.',
        parsed.error.flatten(),
      );
    }
    return jsonOk(await createBenefit(session.id, parsed.data), 201);
  } catch (error) {
    return handleRouteError(error);
  }
}
