export const BENEFIT_TYPE_OPTIONS = [
  { value: 'ANNUAL', label: 'Anual' },
  { value: 'EVENTUAL', label: 'Eventual' },
] as const;

export const AUDIENCE_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'FEMALE', label: 'Mujeres' },
  { value: 'MALE', label: 'Hombres' },
] as const;

export const MONTH_OPTIONS = [
  { value: '', label: 'Sin mes sugerido' },
  { value: '1', label: 'Enero' },
  { value: '2', label: 'Febrero' },
  { value: '3', label: 'Marzo' },
  { value: '4', label: 'Abril' },
  { value: '5', label: 'Mayo' },
  { value: '6', label: 'Junio' },
  { value: '7', label: 'Julio' },
  { value: '8', label: 'Agosto' },
  { value: '9', label: 'Septiembre' },
  { value: '10', label: 'Octubre' },
  { value: '11', label: 'Noviembre' },
  { value: '12', label: 'Diciembre' },
];

export type BenefitTypeCode = 'ANNUAL' | 'EVENTUAL';
export type AudienceCode = 'ALL' | 'FEMALE' | 'MALE';

export type BenefitRecord = {
  id: string;
  name: string;
  internalDescription: string;
  publicText: string | null;
  isPublic: boolean;
  type: BenefitTypeCode;
  audience: AudienceCode;
  minPaidFeesInYear: number;
  maxDeliveriesPerYear: number;
  suggestedMonth: number | null;
  requiresMinimumSetup: boolean;
  isActive: boolean;
  typeDisplay: string;
  audienceDisplay: string;
  publicDisplay: string;
  estado: 'A' | 'I';
  estadoDisplay: string;
};

export type BenefitFormValues = {
  name: string;
  internalDescription: string;
  publicText: string;
  isPublic: boolean;
  type: BenefitTypeCode | '';
  audience: AudienceCode | '';
  minPaidFeesInYear: string;
  maxDeliveriesPerYear: string;
  suggestedMonth: string;
  requiresMinimumSetup: boolean;
};

export type BenefitFormErrors = Partial<
  Record<
    | 'name'
    | 'internalDescription'
    | 'publicText'
    | 'type'
    | 'audience'
    | 'minPaidFeesInYear'
    | 'maxDeliveriesPerYear'
    | 'suggestedMonth',
    string
  >
>;

export type BenefitPayload = {
  name: string;
  internalDescription: string;
  publicText: string | null;
  isPublic: boolean;
  type: BenefitTypeCode;
  audience: AudienceCode;
  minPaidFeesInYear: number;
  maxDeliveriesPerYear: number;
  suggestedMonth: number | null;
  requiresMinimumSetup: boolean;
};

function labelOf(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function emptyBenefitForm(): BenefitFormValues {
  return {
    name: '',
    internalDescription: '',
    publicText: '',
    isPublic: false,
    type: 'ANNUAL',
    audience: 'ALL',
    minPaidFeesInYear: '0',
    maxDeliveriesPerYear: '1',
    suggestedMonth: '',
    requiresMinimumSetup: false,
  };
}

export function mapBenefit(row: {
  id: string;
  name: string;
  internalDescription: string;
  publicText: string | null;
  isPublic: boolean;
  type: BenefitTypeCode;
  audience: AudienceCode;
  minPaidFeesInYear: number;
  maxDeliveriesPerYear: number;
  suggestedMonth: number | null;
  requiresMinimumSetup: boolean;
  isActive: boolean;
}): BenefitRecord {
  return {
    ...row,
    typeDisplay: labelOf(BENEFIT_TYPE_OPTIONS, row.type),
    audienceDisplay: labelOf(AUDIENCE_OPTIONS, row.audience),
    publicDisplay: row.isPublic ? 'Visible' : 'Oculto',
    estado: row.isActive ? 'A' : 'I',
    estadoDisplay: row.isActive ? 'Activo' : 'Inactivo',
  };
}

function integerIn(value: string, min: number, max: number): number | null {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (parsed < min || parsed > max) return null;
  return parsed;
}

export function validateBenefitForm(values: BenefitFormValues): BenefitFormErrors {
  const errors: BenefitFormErrors = {};
  const name = values.name.trim();
  if (!name) errors.name = 'El nombre es obligatorio.';
  else if (name.length > 120) errors.name = 'Máximo 120 caracteres.';
  const description = values.internalDescription.trim();
  if (!description) errors.internalDescription = 'La descripción interna es obligatoria.';
  else if (description.length > 500) errors.internalDescription = 'Máximo 500 caracteres.';
  if (values.isPublic && !values.publicText.trim()) {
    errors.publicText = 'El texto público es obligatorio si el beneficio se muestra en la página.';
  } else if (values.publicText.trim().length > 500) {
    errors.publicText = 'Máximo 500 caracteres.';
  }
  if (values.type !== 'ANNUAL' && values.type !== 'EVENTUAL') {
    errors.type = 'El tipo no es válido.';
  }
  if (values.audience !== 'ALL' && values.audience !== 'FEMALE' && values.audience !== 'MALE') {
    errors.audience = 'El público objetivo no es válido.';
  }
  if (integerIn(values.minPaidFeesInYear, 0, 99) == null) {
    errors.minPaidFeesInYear = 'El mínimo de cuotas no puede ser negativo.';
  }
  if (values.type === 'EVENTUAL' && integerIn(values.maxDeliveriesPerYear, 1, 12) == null) {
    errors.maxDeliveriesPerYear = 'Un beneficio eventual permite de 1 a 12 entregas al año.';
  }
  if (values.suggestedMonth && integerIn(values.suggestedMonth, 1, 12) == null) {
    errors.suggestedMonth = 'El mes va de 1 a 12.';
  }
  return errors;
}

export function toBenefitPayload(values: BenefitFormValues): BenefitPayload {
  const type: BenefitTypeCode = values.type === 'EVENTUAL' ? 'EVENTUAL' : 'ANNUAL';
  const audience: AudienceCode =
    values.audience === 'FEMALE' || values.audience === 'MALE' ? values.audience : 'ALL';
  const max =
    type === 'ANNUAL' ? 1 : integerIn(values.maxDeliveriesPerYear, 1, 12) ?? 1;
  const month = values.suggestedMonth ? integerIn(values.suggestedMonth, 1, 12) : null;
  const publicText = values.publicText.trim();
  return {
    name: values.name.trim(),
    internalDescription: values.internalDescription.trim(),
    publicText: publicText.length > 0 ? publicText : null,
    isPublic: values.isPublic,
    type,
    audience,
    minPaidFeesInYear: integerIn(values.minPaidFeesInYear, 0, 99) ?? 0,
    maxDeliveriesPerYear: max,
    suggestedMonth: month,
    requiresMinimumSetup: values.requiresMinimumSetup,
  };
}
