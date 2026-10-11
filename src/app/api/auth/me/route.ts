import { requireSession } from '@/server/auth/permissions';
import { handleRouteError, jsonOk } from '@/server/http/errors';

export async function GET() {
  try {
    const user = await requireSession();
    return jsonOk(user);
  } catch (error) {
    return handleRouteError(error);
  }
}
