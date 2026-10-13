import { handleRouteError, jsonError, jsonOk } from '@/server/http/errors';
import { siteQuerySchema } from '@/server/modules/site/site.schema';
import { getPublicSite } from '@/server/modules/site/site.service';

/** Public read. Middleware lets it through; there is no session or permission. */
export async function GET(request: Request) {
  try {
    const raw = Object.fromEntries(new URL(request.url).searchParams.entries());
    const parsed = siteQuerySchema.safeParse(raw);
    if (!parsed.success) {
      return jsonError(400, 'La consulta no es válida.', parsed.error.flatten());
    }
    return jsonOk(await getPublicSite());
  } catch (error) {
    return handleRouteError(error);
  }
}
