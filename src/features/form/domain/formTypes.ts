export type CatalogOption = {
  label: string;
  value: string;
};

export type FormCatalogs = {
  types: CatalogOption[];
  cities: CatalogOption[];
  interests: CatalogOption[];
  priorities: CatalogOption[];
};

export type FormValues = {
  fullName: string;
  documentId: string;
  date: string;
  type: string;
  city: string;
  interests: string[];
  priority: string;
  notes: string;
  acceptsTerms: boolean;
};

export type FormErrors = Partial<Record<keyof FormValues, string>>;

export type FormSubmitResult =
  | { ok: true }
  | { ok: false; errors: FormErrors };

export function emptyFormValues(): FormValues {
  return {
    fullName: '',
    documentId: '',
    date: '',
    type: '',
    city: '',
    interests: [],
    priority: '',
    notes: '',
    acceptsTerms: false,
  };
}

export function validateForm(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!values.fullName.trim()) {
    errors.fullName = 'El nombre es obligatorio.';
  } else if (values.fullName.trim().length < 3) {
    errors.fullName = 'Escribe al menos 3 caracteres.';
  }

  if (!values.documentId.trim()) {
    errors.documentId = 'El documento es obligatorio.';
  } else if (!/^\d+$/.test(values.documentId.trim())) {
    errors.documentId = 'Usa solo números.';
  }

  if (!values.date) {
    errors.date = 'La fecha es obligatoria.';
  }

  if (!values.type) {
    errors.type = 'Selecciona un tipo.';
  }

  if (!values.city) {
    errors.city = 'Selecciona una ciudad.';
  }

  if (values.interests.length === 0) {
    errors.interests = 'Elige al menos un interés.';
  }

  if (!values.priority) {
    errors.priority = 'Selecciona una prioridad.';
  }

  if (values.notes.length > 500) {
    errors.notes = 'Máximo 500 caracteres.';
  }

  if (!values.acceptsTerms) {
    errors.acceptsTerms = 'Debes aceptar el tratamiento de datos.';
  }

  return errors;
}
