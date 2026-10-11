import { quoteFullFee } from '@/rules/fees';
import { toPercentHundredths } from '@/rules/money';

export type BenefitOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type ProfileRecord = {
  id: string;
  name: string;
  percent: string;
  isActive: boolean;
  benefitIds: string[];
  benefitNames: string[];
  fullFee: number;
  percentLabel: string;
  fullFeeLabel: string;
  benefitSummary: string;
  estado: 'A' | 'I';
  estadoDisplay: string;
};

export type ProfileFormValues = {
  name: string;
  percent: string;
  benefitIds: string[];
};

export type ProfileFormErrors = Partial<Record<'name' | 'percent', string>>;

export type ProfilePayload = {
  name: string;
  percent: string;
  benefitIds: string[];
};

export function emptyProfileForm(): ProfileFormValues {
  return { name: '', percent: '', benefitIds: [] };
}

export function normalizePercent(value: string): string | null {
  const normalized = value.trim().replace(',', '.');
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  const [whole, fraction = ''] = normalized.split('.');
  const text = `${whole}.${fraction.padEnd(2, '0')}`;
  const amount = Number(text);
  if (!(amount > 0 && amount <= 100)) return null;
  return text;
}

export function formatPercentLabel(value: string): string {
  return `${value.replace('.', ',')} %`;
}

export function formatPesos(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function previewFullFee(percentText: string, minimumWage: number): number | null {
  const percent = normalizePercent(percentText);
  if (!percent || minimumWage < 0) return null;
  if (minimumWage === 0) return 0;
  return quoteFullFee(minimumWage, toPercentHundredths(percent));
}

export function mapProfile(row: {
  id: string;
  name: string;
  percent: string;
  isActive: boolean;
  benefitIds: string[];
  benefitNames: string[];
  fullFee: number;
}): ProfileRecord {
  return {
    ...row,
    percentLabel: formatPercentLabel(row.percent),
    fullFeeLabel: formatPesos(row.fullFee),
    benefitSummary: row.benefitNames.length > 0 ? row.benefitNames.join(', ') : 'Ninguno',
    estado: row.isActive ? 'A' : 'I',
    estadoDisplay: row.isActive ? 'Activo' : 'Inactivo',
  };
}

export function validateProfileForm(values: ProfileFormValues): ProfileFormErrors {
  const errors: ProfileFormErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'El nombre es obligatorio.';
  else if (name.length > 80) errors.name = 'Máximo 80 caracteres.';
  if (!normalizePercent(values.percent)) {
    errors.percent = 'El porcentaje debe ser mayor que 0 y máximo 100.';
  }
  return errors;
}

export function toProfilePayload(values: ProfileFormValues): ProfilePayload {
  return {
    name: values.name.trim(),
    percent: normalizePercent(values.percent) ?? values.percent,
    benefitIds: values.benefitIds,
  };
}
