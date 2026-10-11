import { RolesRepository } from '../data/repositories/RolesRepository';
import {
  emptyRoleForm,
  groupPermissions,
  mapRole,
  toRolePayload,
  validateRoleForm,
  type PermissionRecord,
  type RoleFormErrors,
  type RoleFormValues,
  type RolePayload,
  type RoleRecord,
} from './rolesTypes';

export type RolesPage = {
  roles: RoleRecord[];
  permissions: PermissionRecord[];
};

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object') return {};
  return body as Record<string, unknown>;
}

function asList(payload: unknown): Record<string, unknown>[] {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!Array.isArray(body)) return [];
  return body.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === 'object',
  );
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function toPermission(row: Record<string, unknown>): PermissionRecord | null {
  if (typeof row.id !== 'string' || typeof row.key !== 'string') return null;
  if (typeof row.module !== 'string' || typeof row.label !== 'string') return null;
  return { id: row.id, key: row.key, module: row.module, label: row.label };
}

function toRole(row: Record<string, unknown>): RoleRecord | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  const permissionIds = Array.isArray(row.permissionIds)
    ? row.permissionIds.filter((item): item is string => typeof item === 'string')
    : [];
  return mapRole({
    id: row.id,
    name: row.name,
    description: row.description == null ? null : text(row.description),
    isSystem: row.isSystem === true,
    isActive: row.isActive === true,
    permissionIds,
  });
}

export function toRoles(payload: unknown): RoleRecord[] {
  return asList(payload).flatMap((row) => {
    const mapped = toRole(row);
    return mapped ? [mapped] : [];
  });
}

export function toPermissions(payload: unknown): PermissionRecord[] {
  return asList(payload).flatMap((row) => {
    const mapped = toPermission(row);
    return mapped ? [mapped] : [];
  });
}

export class RolesService {
  constructor(private readonly repo = new RolesRepository()) {}

  createEmptyForm() {
    return emptyRoleForm();
  }

  async load(): Promise<RolesPage> {
    const [roles, permissions] = await Promise.all([
      this.repo.getRoles(),
      this.repo.getPermissions(),
    ]);
    return {
      roles: toRoles(roles),
      permissions: toPermissions(permissions),
    };
  }

  prepareSave(
    values: RoleFormValues,
  ): { ok: false; errors: RoleFormErrors } | { ok: true; payload: RolePayload } {
    const errors = validateRoleForm(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toRolePayload(values) };
  }

  permissionGroups(permissions: PermissionRecord[]) {
    return groupPermissions(permissions);
  }

  async create(payload: RolePayload): Promise<RoleRecord> {
    const mapped = toRole(asRecord(await this.repo.createRole(payload)));
    if (!mapped) throw new Error('No pudimos leer el rol creado.');
    return mapped;
  }

  async update(
    id: string,
    payload: RolePayload | { isActive: boolean },
  ): Promise<RoleRecord> {
    const mapped = toRole(asRecord(await this.repo.updateRole(id, payload)));
    if (!mapped) throw new Error('No pudimos leer el rol actualizado.');
    return mapped;
  }
}
