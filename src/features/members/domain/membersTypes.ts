import { isOnOrBefore, parseIsoDate } from '@/rules/calendar';

export const DOCUMENT_TYPE_OPTIONS = [
  { value: 'CC', label: 'Cédula de ciudadanía' },
  { value: 'CE', label: 'Cédula de extranjería' },
  { value: 'PASSPORT', label: 'Pasaporte' },
  { value: 'PPT', label: 'PPT' },
] as const;

export const SEX_OPTIONS = [
  { value: 'FEMALE', label: 'Mujer' },
  { value: 'MALE', label: 'Hombre' },
  { value: 'UNSPECIFIED', label: 'No indica' },
] as const;

export const STATUS_OPTIONS = [
  { value: 'ACTIVE', label: 'Activo' },
  { value: 'SUSPENDED', label: 'Suspendido' },
  { value: 'RETIRED', label: 'Retirado' },
] as const;

export type DocumentTypeCode = (typeof DOCUMENT_TYPE_OPTIONS)[number]['value'];
export type SexCode = (typeof SEX_OPTIONS)[number]['value'];
export type MemberStatusCode = (typeof STATUS_OPTIONS)[number]['value'];
export type FeeTypeCode = 'MONTHLY' | 'ENROLLMENT';
export type FeeStatusCode = 'PENDING' | 'OVERDUE' | 'PAID';

export type ProfileOption = {
  id: string;
  name: string;
  isActive: boolean;
};

export type MembersSettings = {
  minimumWage: number;
  enrollmentFee: number;
  firstFeeCutoffDay: number;
  firstFeePercent: string;
};

export type MemberRecord = {
  id: string;
  memberNumber: number;
  memberNumberLabel: string;
  documentType: DocumentTypeCode;
  documentTypeLabel: string;
  documentNumber: string;
  documentLabel: string;
  firstNames: string;
  lastNames: string;
  fullName: string;
  sex: SexCode;
  sexLabel: string;
  birthDate: string;
  birthDateLabel: string;
  mobilePhone: string;
  phone: string;
  email: string;
  address: string;
  residenceCity: string;
  shirtSize: string;
  pantsSize: string;
  shoeSize: string;
  joinedOn: string;
  joinedOnLabel: string;
  profileId: string;
  profileName: string;
  profilePercent: string;
  status: MemberStatusCode;
  statusLabel: string;
  notes: string;
  currentFee: number;
  currentFeeLabel: string;
  inArrears: boolean;
  inArrearsLabel: string;
  totalPaid: number;
  totalPaidLabel: string;
  paidFeesThisYear: number;
};

export type MemberFeeRecord = {
  id: string;
  type: FeeTypeCode;
  periodLabel: string;
  baseAmountLabel: string;
  surchargeLabel: string;
  totalLabel: string;
  statusLabel: string;
  isReduced: boolean;
  dueDateLabel: string;
  paidOnLabel: string;
  paymentMethodName: string;
};

export type BenefitConditionRecord = {
  key: string;
  label: string;
  passed: boolean;
};

export type MemberBenefitRecord = {
  id: string;
  name: string;
  minPaidFeesInYear: number;
  deliveriesThisYear: number;
  meetsMinimum: boolean;
  alreadyReceived: boolean;
  minimumBlocked: boolean;
  canDeliver: boolean;
  canDeliverWithException: boolean;
  conditions: BenefitConditionRecord[];
};

export type DeliveryMode = 'normal' | 'exception' | 'blocked' | 'forbidden';

export type BenefitDeliveryFormValues = {
  deliveredOn: string;
  note: string;
};

export type BenefitDeliveryFormErrors = Partial<
  Record<keyof BenefitDeliveryFormValues, string>
>;

export type DeliverBenefitPayload = {
  memberId: string;
  benefitId: string;
  deliveredOn: string;
  note: string | null;
};

export const MINIMUM_NOT_CONFIGURED_MESSAGE =
  'Falta definir cuántas cuotas exige este beneficio.';

const BENEFIT_CONDITION_LABELS: Record<string, string> = {
  memberActive: 'El afiliado está activo',
  profileIncludesBenefit: 'El perfil incluye este beneficio',
  sexMatches: 'El sexo coincide con el público del beneficio',
  minPaidFeesMet: 'Cumple el mínimo de cuotas pagadas del año',
  quotaAvailable: 'Aún hay cupo en este año',
  minimumConfigured: 'El mínimo de cuotas ya está definido',
};

export function benefitConditionLabel(key: string): string {
  return BENEFIT_CONDITION_LABELS[key] ?? key;
}

export function eligibilitySummary(
  benefit: Pick<MemberBenefitRecord, 'canDeliver' | 'canDeliverWithException'>,
): string {
  if (benefit.canDeliver) return 'Puede recibirlo.';
  if (benefit.canDeliverWithException) return 'Solo se puede entregar con excepción.';
  return 'No se puede entregar: ya no hay cupo este año.';
}

export function deliveryMode(
  benefit: Pick<MemberBenefitRecord, 'canDeliver' | 'canDeliverWithException'>,
  canDeliver: boolean,
  canException: boolean,
): DeliveryMode {
  if (!benefit.canDeliverWithException) return 'blocked';
  if (benefit.canDeliver && (canDeliver || canException)) return 'normal';
  if (canException) return 'exception';
  return 'forbidden';
}

export function emptyBenefitDeliveryForm(today = ''): BenefitDeliveryFormValues {
  return { deliveredOn: today, note: '' };
}

export function validateBenefitDelivery(
  values: BenefitDeliveryFormValues,
  today: string,
  year: number,
  requiresNote: boolean,
): BenefitDeliveryFormErrors {
  const errors: BenefitDeliveryFormErrors = {};
  const iso = toIsoDateInput(values.deliveredOn);
  if (!iso) {
    errors.deliveredOn = 'La fecha de entrega es obligatoria.';
  } else {
    try {
      const date = parseIsoDate(iso);
      const todayDate = parseIsoDate(toIsoDateInput(today));
      if (!isOnOrBefore(date, todayDate)) {
        errors.deliveredOn = 'La fecha de entrega no puede ser futura.';
      } else if (date.year !== year) {
        errors.deliveredOn = 'La fecha debe caer en el año de la ficha.';
      }
    } catch {
      errors.deliveredOn = 'La fecha de entrega no es válida.';
    }
  }
  const note = values.note.trim();
  if (requiresNote && !note) {
    errors.note = 'La nota es obligatoria cuando la entrega es una excepción.';
  } else if (note.length > 500) {
    errors.note = 'Máximo 500 caracteres.';
  }
  return errors;
}

export function toDeliverBenefitPayload(
  memberId: string,
  benefitId: string,
  values: BenefitDeliveryFormValues,
): DeliverBenefitPayload {
  const note = values.note.trim();
  return {
    memberId,
    benefitId,
    deliveredOn: toIsoDateInput(values.deliveredOn),
    note: note.length > 0 ? note : null,
  };
}

export type CurrentFeeQuote = {
  minimumWage: number;
  profilePercent: string;
  fullFee: number;
  fullFeeLabel: string;
  minimumWageLabel: string;
};

export type MemberDetail = MemberRecord & {
  createdByName: string;
  currentFeeQuote: CurrentFeeQuote;
  fees: MemberFeeRecord[];
  benefits: MemberBenefitRecord[];
};

export type MemberFormValues = {
  documentType: DocumentTypeCode;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  sex: SexCode;
  birthDate: string;
  mobilePhone: string;
  phone: string;
  email: string;
  address: string;
  residenceCity: string;
  shirtSize: string;
  pantsSize: string;
  shoeSize: string;
  joinedOn: string;
  profileId: string;
  status: MemberStatusCode;
  notes: string;
  chargeEnrollment: boolean;
};

export type MemberFormErrors = Partial<
  Record<
    Exclude<keyof MemberFormValues, 'chargeEnrollment' | 'status'>,
    string
  >
>;

export type CreateMemberPayload = {
  documentType: DocumentTypeCode;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  sex: SexCode;
  birthDate: string;
  mobilePhone: string;
  phone?: string | null;
  email?: string | null;
  address: string;
  residenceCity: string;
  shirtSize?: string | null;
  pantsSize?: string | null;
  shoeSize?: string | null;
  joinedOn?: string;
  profileId: string;
  notes?: string | null;
  chargeEnrollment?: boolean;
};

export type UpdateMemberPayload = {
  documentType?: DocumentTypeCode;
  documentNumber?: string;
  firstNames?: string;
  lastNames?: string;
  sex?: SexCode;
  birthDate?: string;
  mobilePhone?: string;
  phone?: string | null;
  email?: string | null;
  address?: string;
  residenceCity?: string;
  shirtSize?: string | null;
  pantsSize?: string | null;
  shoeSize?: string | null;
  joinedOn?: string;
  profileId?: string;
  status?: MemberStatusCode;
  notes?: string | null;
};

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

/** DateFieldMUI keeps ISO in `value` but emits `dd/MM/yyyy` on change. */
export function toIsoDateInput(value: string): string {
  const trimmed = value.trim();
  if (ISO_DATE.test(trimmed)) return trimmed;
  const match = DISPLAY_DATE.exec(trimmed);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return trimmed;
}

export function emptyMemberForm(today = ''): MemberFormValues {
  return {
    documentType: 'CC',
    documentNumber: '',
    firstNames: '',
    lastNames: '',
    sex: 'UNSPECIFIED',
    birthDate: '',
    mobilePhone: '',
    phone: '',
    email: '',
    address: '',
    residenceCity: '',
    shirtSize: '',
    pantsSize: '',
    shoeSize: '',
    joinedOn: today,
    profileId: '',
    status: 'ACTIVE',
    notes: '',
    chargeEnrollment: false,
  };
}

export function formatMemberNumber(value: number): string {
  return String(value).padStart(4, '0');
}

export function formatPesos(value: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatIsoDateLabel(iso: string): string {
  const normalized = toIsoDateInput(iso);
  const match = ISO_DATE.exec(normalized);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function optionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T,
): string {
  return options.find((item) => item.value === value)?.label ?? value;
}

function emptyToNull(value: string): string | null {
  const text = value.trim();
  return text.length > 0 ? text : null;
}

export function formValuesFromMember(row: MemberRecord): MemberFormValues {
  return {
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    firstNames: row.firstNames,
    lastNames: row.lastNames,
    sex: row.sex,
    birthDate: row.birthDate,
    mobilePhone: row.mobilePhone,
    phone: row.phone,
    email: row.email,
    address: row.address,
    residenceCity: row.residenceCity,
    shirtSize: row.shirtSize,
    pantsSize: row.pantsSize,
    shoeSize: row.shoeSize,
    joinedOn: row.joinedOn,
    profileId: row.profileId,
    status: row.status,
    notes: row.notes,
    chargeEnrollment: false,
  };
}

export function mapMember(row: {
  id: string;
  memberNumber: number;
  documentType: DocumentTypeCode;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  sex: SexCode;
  birthDate: string;
  mobilePhone: string;
  phone: string | null;
  email: string | null;
  address: string;
  residenceCity: string;
  shirtSize: string | null;
  pantsSize: string | null;
  shoeSize: string | null;
  joinedOn: string;
  profileId: string;
  profileName: string;
  profilePercent: string;
  status: MemberStatusCode;
  notes: string | null;
  currentFee: number;
  inArrears: boolean;
  totalPaid: number;
  paidFeesThisYear: number;
}): MemberRecord {
  return {
    id: row.id,
    memberNumber: row.memberNumber,
    memberNumberLabel: formatMemberNumber(row.memberNumber),
    documentType: row.documentType,
    documentTypeLabel: optionLabel(DOCUMENT_TYPE_OPTIONS, row.documentType),
    documentNumber: row.documentNumber,
    documentLabel: `${optionLabel(DOCUMENT_TYPE_OPTIONS, row.documentType)} ${row.documentNumber}`,
    firstNames: row.firstNames,
    lastNames: row.lastNames,
    fullName: `${row.firstNames} ${row.lastNames}`.trim(),
    sex: row.sex,
    sexLabel: optionLabel(SEX_OPTIONS, row.sex),
    birthDate: row.birthDate,
    birthDateLabel: formatIsoDateLabel(row.birthDate),
    mobilePhone: row.mobilePhone,
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address,
    residenceCity: row.residenceCity,
    shirtSize: row.shirtSize ?? '',
    pantsSize: row.pantsSize ?? '',
    shoeSize: row.shoeSize ?? '',
    joinedOn: row.joinedOn,
    joinedOnLabel: formatIsoDateLabel(row.joinedOn),
    profileId: row.profileId,
    profileName: row.profileName,
    profilePercent: row.profilePercent,
    status: row.status,
    statusLabel: optionLabel(STATUS_OPTIONS, row.status),
    notes: row.notes ?? '',
    currentFee: row.currentFee,
    currentFeeLabel: formatPesos(row.currentFee),
    inArrears: row.inArrears,
    inArrearsLabel: row.inArrears ? 'Sí' : 'No',
    totalPaid: row.totalPaid,
    totalPaidLabel: formatPesos(row.totalPaid),
    paidFeesThisYear: row.paidFeesThisYear,
  };
}

export function toProfileSelectOptions(
  profiles: ProfileOption[],
  currentProfileId?: string,
): { value: string; label: string }[] {
  return profiles
    .filter((profile) => profile.isActive || profile.id === currentProfileId)
    .map((profile) => ({
      value: profile.id,
      label: profile.isActive ? profile.name : `${profile.name} (inactivo)`,
    }));
}

function isIsoDate(value: string): boolean {
  return ISO_DATE.test(toIsoDateInput(value));
}

export function validateMemberForm(values: MemberFormValues): MemberFormErrors {
  const errors: MemberFormErrors = {};
  if (!values.documentNumber.trim()) {
    errors.documentNumber = 'El documento es obligatorio.';
  }
  if (!values.firstNames.trim()) errors.firstNames = 'Los nombres son obligatorios.';
  if (!values.lastNames.trim()) errors.lastNames = 'Los apellidos son obligatorios.';
  if (!isIsoDate(values.birthDate)) {
    errors.birthDate = 'La fecha de nacimiento no es válida.';
  }
  if (!values.mobilePhone.trim()) errors.mobilePhone = 'El celular es obligatorio.';
  if (!values.address.trim()) errors.address = 'La dirección es obligatoria.';
  if (!values.residenceCity.trim()) {
    errors.residenceCity = 'La ciudad de residencia es obligatoria.';
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Escribe un correo válido.';
  }
  if (!isIsoDate(values.joinedOn)) {
    errors.joinedOn = 'La fecha de afiliación no es válida.';
  }
  if (!values.profileId) errors.profileId = 'El perfil es obligatorio.';
  return errors;
}

export function toCreatePayload(values: MemberFormValues): CreateMemberPayload {
  return {
    documentType: values.documentType,
    documentNumber: values.documentNumber.trim(),
    firstNames: values.firstNames.trim(),
    lastNames: values.lastNames.trim(),
    sex: values.sex,
    birthDate: toIsoDateInput(values.birthDate),
    mobilePhone: values.mobilePhone.trim(),
    phone: emptyToNull(values.phone),
    email: emptyToNull(values.email)?.toLowerCase() ?? null,
    address: values.address.trim(),
    residenceCity: values.residenceCity.trim(),
    shirtSize: emptyToNull(values.shirtSize),
    pantsSize: emptyToNull(values.pantsSize),
    shoeSize: emptyToNull(values.shoeSize),
    joinedOn: toIsoDateInput(values.joinedOn),
    profileId: values.profileId,
    notes: emptyToNull(values.notes),
    chargeEnrollment: values.chargeEnrollment,
  };
}

export function toUpdatePayload(values: MemberFormValues): UpdateMemberPayload {
  const created = toCreatePayload(values);
  return {
    documentType: created.documentType,
    documentNumber: created.documentNumber,
    firstNames: created.firstNames,
    lastNames: created.lastNames,
    sex: created.sex,
    birthDate: created.birthDate,
    mobilePhone: created.mobilePhone,
    phone: created.phone,
    email: created.email,
    address: created.address,
    residenceCity: created.residenceCity,
    shirtSize: created.shirtSize,
    pantsSize: created.pantsSize,
    shoeSize: created.shoeSize,
    joinedOn: created.joinedOn,
    profileId: created.profileId,
    status: values.status,
    notes: created.notes,
  };
}

export function matchesMemberSearch(row: MemberRecord, query: string): boolean {
  const needle = query.trim();
  if (!needle) return true;
  const haystack = [
    row.fullName,
    row.firstNames,
    row.lastNames,
    row.documentNumber,
    row.memberNumberLabel,
    String(row.memberNumber),
  ].join(' ');
  return haystack.toLocaleLowerCase('es').includes(needle.toLocaleLowerCase('es'));
}
