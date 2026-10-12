import { handleRouteError, jsonOk } from '@/server/http/errors';
import {
  assertCronAuthorized,
  ensureFeesUpToDate,
} from '@/server/modules/fees/fees.service';

export async function GET(request: Request) {
  try {
    assertCronAuthorized(request.headers.get('authorization'));
    return jsonOk(await ensureFeesUpToDate(new Date(), { source: 'cron' }));
  } catch (error) {
    return handleRouteError(error);
  }
}
