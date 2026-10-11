export type ChangePasswordValues = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export type ChangePasswordErrors = Partial<
  Record<keyof ChangePasswordValues, string>
>;

export function emptyChangePasswordValues(): ChangePasswordValues {
  return {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };
}

export function validateChangePassword(
  values: ChangePasswordValues,
): ChangePasswordErrors {
  const errors: ChangePasswordErrors = {};

  if (!values.currentPassword) {
    errors.currentPassword = 'La clave actual es obligatoria.';
  }

  if (!values.newPassword) {
    errors.newPassword = 'La clave nueva es obligatoria.';
  } else if (values.newPassword.length < 8) {
    errors.newPassword = 'La clave nueva debe tener al menos 8 caracteres.';
  } else if (values.newPassword === values.currentPassword) {
    errors.newPassword = 'La clave nueva debe ser distinta de la actual.';
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = 'Confirma la clave nueva.';
  } else if (values.confirmPassword !== values.newPassword) {
    errors.confirmPassword = 'Las claves nuevas no coinciden.';
  }

  return errors;
}
