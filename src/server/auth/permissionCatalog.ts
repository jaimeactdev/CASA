export type PermissionDefinition = {
  key: string;
  module: string;
  label: string;
};

export const PERMISSION_CATALOG: PermissionDefinition[] = [
  { key: 'members.view', module: 'members', label: 'Ver afiliados' },
  { key: 'members.create', module: 'members', label: 'Crear afiliados' },
  { key: 'members.edit', module: 'members', label: 'Editar afiliados, su estado y su perfil' },
  { key: 'fees.view', module: 'fees', label: 'Ver cuotas y pagos' },
  { key: 'fees.pay', module: 'fees', label: 'Registrar pagos' },
  { key: 'fees.revert', module: 'fees', label: 'Corregir pagos' },
  { key: 'benefits.view', module: 'benefits', label: 'Ver beneficios y entregas' },
  { key: 'benefits.manage', module: 'benefits', label: 'Administrar el catálogo de beneficios' },
  { key: 'benefits.deliver', module: 'benefits', label: 'Entregar beneficios' },
  { key: 'benefits.deliver_exception', module: 'benefits', label: 'Entregar con excepción' },
  { key: 'benefits.void_delivery', module: 'benefits', label: 'Anular entregas' },
  { key: 'profiles.view', module: 'profiles', label: 'Ver perfiles' },
  { key: 'profiles.manage', module: 'profiles', label: 'Administrar perfiles' },
  { key: 'settings.view', module: 'settings', label: 'Ver parámetros' },
  { key: 'settings.edit', module: 'settings', label: 'Editar parámetros y medios de pago' },
  { key: 'users.view', module: 'users', label: 'Ver usuarios' },
  { key: 'users.manage', module: 'users', label: 'Administrar usuarios' },
  { key: 'roles.view', module: 'roles', label: 'Ver roles' },
  { key: 'roles.manage', module: 'roles', label: 'Administrar roles y permisos' },
];

export const OPERATIVE_PERMISSION_KEYS = [
  'members.view',
  'members.create',
  'members.edit',
  'fees.view',
  'fees.pay',
  'fees.revert',
  'benefits.view',
  'benefits.deliver',
  'profiles.view',
] as const;
