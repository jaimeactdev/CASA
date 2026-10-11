export const MODULE_ORDER = [
  'members',
  'fees',
  'benefits',
  'profiles',
  'settings',
  'users',
  'roles',
] as const;

export const MODULE_LABELS: Record<string, string> = {
  members: 'Afiliados',
  fees: 'Pagos',
  benefits: 'Beneficios',
  profiles: 'Perfiles',
  settings: 'Parámetros',
  users: 'Usuarios',
  roles: 'Roles',
};

export type PermissionRecord = {
  id: string;
  key: string;
  module: string;
  label: string;
};

export type PermissionGroup = {
  module: string;
  label: string;
  items: PermissionRecord[];
};

export type RoleRecord = {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionIds: string[];
  estado: 'A' | 'I';
  estadoDisplay: string;
  systemDisplay: string;
};

export type RoleFormValues = {
  name: string;
  description: string;
  permissionIds: string[];
};

export type RoleFormErrors = Partial<Record<'name' | 'description', string>>;

export type RolePayload = {
  name: string;
  description: string | null;
  permissionIds: string[];
};

export function emptyRoleForm(): RoleFormValues {
  return { name: '', description: '', permissionIds: [] };
}

export function mapRole(row: {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissionIds: string[];
}): RoleRecord {
  return {
    ...row,
    estado: row.isActive ? 'A' : 'I',
    estadoDisplay: row.isActive ? 'Activo' : 'Inactivo',
    systemDisplay: row.isSystem ? 'Sistema' : 'Personalizado',
  };
}

export function groupPermissions(
  permissions: PermissionRecord[],
): PermissionGroup[] {
  const buckets = new Map<string, PermissionRecord[]>();
  for (const item of permissions) {
    const list = buckets.get(item.module) ?? [];
    list.push(item);
    buckets.set(item.module, list);
  }
  const known = MODULE_ORDER.filter((module) => buckets.has(module));
  const extra = [...buckets.keys()].filter(
    (module) => !MODULE_ORDER.includes(module as (typeof MODULE_ORDER)[number]),
  );
  return [...known, ...extra].map((module) => ({
    module,
    label: MODULE_LABELS[module] ?? module,
    items: buckets.get(module) ?? [],
  }));
}

export function validateRoleForm(values: RoleFormValues): RoleFormErrors {
  const errors: RoleFormErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'El nombre es obligatorio.';
  else if (name.length > 80) errors.name = 'Máximo 80 caracteres.';
  if (values.description.trim().length > 400) {
    errors.description = 'Máximo 400 caracteres.';
  }
  return errors;
}

export function toRolePayload(values: RoleFormValues): RolePayload {
  const description = values.description.trim();
  return {
    name: values.name.trim(),
    description: description.length > 0 ? description : null,
    permissionIds: values.permissionIds,
  };
}
