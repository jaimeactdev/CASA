/** Seeded name of the system administrator role. It is not a code identifier. */
export const SYSTEM_ADMIN_ROLE_NAME = 'Administrador';

export type RoleOption = {
  id: string;
  name: string;
  isActive: boolean;
  isSystem: boolean;
};

export type UserRecord = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleIsSystem: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
  estado: 'A' | 'I';
  estadoDisplay: string;
};

export type UserFormValues = {
  name: string;
  email: string;
  roleId: string;
  password: string;
  confirmPassword: string;
};

export type UserFormErrors = Partial<Record<keyof UserFormValues, string>>;

export type PasswordResetValues = {
  password: string;
  confirmPassword: string;
};

export type PasswordResetErrors = Partial<
  Record<keyof PasswordResetValues, string>
>;

export type CreateUserPayload = {
  name: string;
  email: string;
  roleId: string;
  password: string;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  roleId?: string;
  isActive?: boolean;
  password?: string;
};

export function emptyUserForm(): UserFormValues {
  return {
    name: '',
    email: '',
    roleId: '',
    password: '',
    confirmPassword: '',
  };
}

export function emptyPasswordReset(): PasswordResetValues {
  return { password: '', confirmPassword: '' };
}

export function mapUser(row: {
  id: string;
  name: string;
  email: string;
  roleId: string;
  roleName: string;
  roleIsSystem: boolean;
  isActive: boolean;
  mustChangePassword: boolean;
}): UserRecord {
  return {
    ...row,
    estado: row.isActive ? 'A' : 'I',
    estadoDisplay: row.isActive ? 'Activo' : 'Inactivo',
  };
}

export function toRoleSelectOptions(
  roles: RoleOption[],
  currentRoleId?: string,
): { value: string; label: string }[] {
  return roles
    .filter((role) => role.isActive || role.id === currentRoleId)
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name, 'es'))
    .map((role) => ({
      value: role.id,
      label: role.isActive ? role.name : `${role.name} (inactivo)`,
    }));
}

export function isSelfAdminLock(
  user: Pick<UserRecord, 'id' | 'roleName' | 'roleIsSystem'>,
  currentUserId: string,
): boolean {
  return (
    user.id === currentUserId &&
    user.roleIsSystem &&
    user.roleName === SYSTEM_ADMIN_ROLE_NAME
  );
}

function emailError(value: string): string | undefined {
  const email = value.trim().toLowerCase();
  if (!email) return 'El correo es obligatorio.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return 'Escribe un correo válido.';
  }
  return undefined;
}

export function validateUserForm(
  values: UserFormValues,
  mode: 'create' | 'edit',
): UserFormErrors {
  const errors: UserFormErrors = {};
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
  else if (values.name.trim().length > 120) {
    errors.name = 'Máximo 120 caracteres.';
  }
  const email = emailError(values.email);
  if (email) errors.email = email;
  if (!values.roleId) errors.roleId = 'El rol es obligatorio.';
  if (mode === 'create') {
    Object.assign(errors, validatePasswordReset(values));
  }
  return errors;
}

export function validatePasswordReset(
  values: PasswordResetValues,
): PasswordResetErrors {
  const errors: PasswordResetErrors = {};
  if (values.password.length < 8) {
    errors.password = 'La clave debe tener al menos 8 caracteres.';
  } else if (values.password.length > 72) {
    errors.password = 'La clave admite hasta 72 caracteres.';
  }
  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = 'La confirmación no coincide.';
  }
  return errors;
}

export function toCreatePayload(values: UserFormValues): CreateUserPayload {
  return {
    name: values.name.trim(),
    email: values.email.trim().toLowerCase(),
    roleId: values.roleId,
    password: values.password,
  };
}
