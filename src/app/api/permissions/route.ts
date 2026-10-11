import { requirePermission } from '@/server/auth/permissions';
import { handleRouteError, jsonOk } from '@/server/http/errors';
import { getPermissions } from '@/server/modules/roles/roles.service';

export async function GET() {
  try {
    await requirePermission('roles.view');
    return jsonOk(await getPermissions());
  } catch (error) {
    return handleRouteError(error);
  }
}
