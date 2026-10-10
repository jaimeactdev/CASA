export type LoginCredentials = {
  email: string;
  password: string;
};

export type LoginErrors = Partial<Record<keyof LoginCredentials, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function emptyCredentials(): LoginCredentials {
  return { email: '', password: '' };
}

export function validateCredentials(values: LoginCredentials): LoginErrors {
  const errors: LoginErrors = {};
  const email = values.email.trim();

  if (!email) {
    errors.email = 'El correo es obligatorio.';
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Escribe un correo válido.';
  }

  if (!values.password) {
    errors.password = 'La clave es obligatoria.';
  }

  return errors;
}
