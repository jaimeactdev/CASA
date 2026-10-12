import { requireSession } from '@/server/auth/permissions';
import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { homeQuerySchema } from '@/server/modules/home/home.schema';
import { getDashboard } from '@/server/modules/home/home.service';

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = homeQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError(400, 'La consulta no es válida.', parsed.error.flatten());
    }
    return jsonOk(await getDashboard(session.id));
  } catch (error) {
    return handleRouteError(error);
  }
}
