export type SettingsValues = {
  name: string;
  acronym: string;
  serviceCity: string;
  phone: string;
  contactEmail: string;
  address: string;
  openingHours: string;
  minimumWage: string;
  firstFeeCutoffDay: string;
  firstFeePercent: string;
  graceDays: string;
  surchargePercent: string;
  enrollmentFee: string;
  allowMultiFeePayment: boolean;
};

export type SettingsErrors = Partial<Record<keyof SettingsValues, string>>;

export type PaymentMethodValues = {
  name: string;
  sortOrder: string;
};

export type PaymentMethodErrors = Partial<Record<keyof PaymentMethodValues, string>>;

export type SettingsRecord = SettingsValues & {
  id: number;
  updatedAt: string;
};

export type ProfilePreview = {
  id: string;
  name: string;
  percent: string;
};

export type PaymentMethodRecord = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
  estado: 'A' | 'I';
  estadoDisplay: string;
};

export type MoneyConfirmation = {
  minimumWage?: { from: number; to: number };
  surchargePercent?: { from: string; to: string };
};

export type SettingsPayload = {
  name: string;
  acronym: string;
  serviceCity: string;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  openingHours: string | null;
  minimumWage: number;
  firstFeeCutoffDay: number;
  firstFeePercent: string;
  graceDays: number;
  surchargePercent: string;
  enrollmentFee: number;
  allowMultiFeePayment: boolean;
};

export function emptySettingsValues(): SettingsValues {
  return {
    name: '',
    acronym: '',
    serviceCity: '',
    phone: '',
    contactEmail: '',
    address: '',
    openingHours: '',
    minimumWage: '0',
    firstFeeCutoffDay: '15',
    firstFeePercent: '50.00',
    graceDays: '3',
    surchargePercent: '0.00',
    enrollmentFee: '0',
    allowMultiFeePayment: true,
  };
}

export function emptyPaymentMethodValues(): PaymentMethodValues {
  return { name: '', sortOrder: '' };
}

function required(value: string, message: string): string | undefined {
  return value.trim() ? undefined : message;
}

function parseInteger(value: string, message: string): number | string {
  const trimmed = value.trim().replace(/\./g, '');
  if (!/^\d+$/.test(trimmed)) return message;
  return Number(trimmed);
}

function parsePercent(value: string, message: string): string | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const text = `${whole}.${fraction.padEnd(2, '0')}`;
  if (message && Number(text) < 0) return null;
  return text;
}

export function validateSettings(values: SettingsValues): SettingsErrors {
  const errors: SettingsErrors = {};
  const name = required(values.name, 'El nombre es obligatorio.');
  if (name) errors.name = name;
  const acronym = required(values.acronym, 'La sigla es obligatoria.');
  if (acronym) errors.acronym = acronym;
  const city = required(values.serviceCity, 'La ciudad de servicios es obligatoria.');
  if (city) errors.serviceCity = city;

  if (values.contactEmail.trim()) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.contactEmail.trim())) {
      errors.contactEmail = 'Escribe un correo válido.';
    }
  }

  const wage = parseInteger(values.minimumWage, 'El SMMLV va en pesos enteros.');
  if (typeof wage === 'string') errors.minimumWage = wage;

  const cutoff = parseInteger(
    values.firstFeeCutoffDay,
    'El día de corte va de 1 a 28.',
  );
  if (typeof cutoff === 'string') errors.firstFeeCutoffDay = cutoff;
  else if (cutoff < 1 || cutoff > 28) {
    errors.firstFeeCutoffDay = 'El día de corte va de 1 a 28.';
  }

  const firstPercent = parsePercent(
    values.firstFeePercent,
    'El porcentaje de la primera cuota va de 1 a 100.',
  );
  if (!firstPercent || Number(firstPercent) < 1 || Number(firstPercent) > 100) {
    errors.firstFeePercent = 'El porcentaje de la primera cuota va de 1 a 100.';
  }

  const grace = parseInteger(values.graceDays, 'La holgura va de 0 a 15 días.');
  if (typeof grace === 'string') errors.graceDays = grace;
  else if (grace > 15) errors.graceDays = 'La holgura va de 0 a 15 días.';

  const surcharge = parsePercent(
    values.surchargePercent,
    'El recargo no puede ser negativo.',
  );
  if (!surcharge) errors.surchargePercent = 'Usa un número con hasta dos decimales.';

  const enrollment = parseInteger(
    values.enrollmentFee,
    'La cuota de ingreso va en pesos enteros.',
  );
  if (typeof enrollment === 'string') errors.enrollmentFee = enrollment;

  return errors;
}

export function toSettingsPayload(values: SettingsValues): SettingsPayload {
  const optional = (value: string) => {
    const text = value.trim();
    return text.length ? text : null;
  };
  const digits = (value: string) => Number(value.trim().replace(/\./g, ''));
  const percent = (value: string) => {
    const normalized = value.trim().replace(',', '.');
    const [whole, fraction = ''] = normalized.split('.');
    return `${whole}.${fraction.padEnd(2, '0')}`;
  };

  return {
    name: values.name.trim(),
    acronym: values.acronym.trim(),
    serviceCity: values.serviceCity.trim(),
    phone: optional(values.phone),
    contactEmail: optional(values.contactEmail)?.toLowerCase() ?? null,
    address: optional(values.address),
    openingHours: optional(values.openingHours),
    minimumWage: digits(values.minimumWage),
    firstFeeCutoffDay: digits(values.firstFeeCutoffDay),
    firstFeePercent: percent(values.firstFeePercent),
    graceDays: digits(values.graceDays),
    surchargePercent: percent(values.surchargePercent),
    enrollmentFee: digits(values.enrollmentFee),
    allowMultiFeePayment: values.allowMultiFeePayment,
  };
}

export function moneyConfirmation(
  saved: SettingsPayload,
  next: SettingsPayload,
): MoneyConfirmation | null {
  const changes: MoneyConfirmation = {};
  if (saved.minimumWage !== next.minimumWage) {
    changes.minimumWage = { from: saved.minimumWage, to: next.minimumWage };
  }
  if (saved.surchargePercent !== next.surchargePercent) {
    changes.surchargePercent = {
      from: saved.surchargePercent,
      to: next.surchargePercent,
    };
  }
  return Object.keys(changes).length ? changes : null;
}

export function validatePaymentMethod(
  values: PaymentMethodValues,
): PaymentMethodErrors {
  const errors: PaymentMethodErrors = {};
  if (!values.name.trim()) errors.name = 'El nombre es obligatorio.';
  if (values.sortOrder.trim()) {
    const order = parseInteger(values.sortOrder, 'El orden debe ser un entero.');
    if (typeof order === 'string') errors.sortOrder = order;
    else if (order < 1) errors.sortOrder = 'El orden debe ser mayor que 0.';
  }
  return errors;
}

export function formatPesos(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercentLabel(value: string): string {
  return `${value.replace('.', ',')} %`;
}

export function mapPaymentMethod(row: {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
}): PaymentMethodRecord {
  return {
    ...row,
    estado: row.isActive ? 'A' : 'I',
    estadoDisplay: row.isActive ? 'Activo' : 'Inactivo',
  };
}
