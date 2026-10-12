import { parseIsoDate, toIsoDate } from '@/rules/calendar';
import { isValidPaymentDate, resolveFeeCharge } from '@/rules/fees';
import { toPercentHundredths } from '@/rules/money';

export const FEE_TYPE_OPTIONS = [
  { value: 'MONTHLY', label: 'Mensual' },
  { value: 'ENROLLMENT', label: 'Ingreso' },
] as const;

export const FEE_STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Pendiente' },
  { value: 'OVERDUE', label: 'Moroso' },
  { value: 'PAID', label: 'Pagado' },
] as const;

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
] as const;

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export type FeeTypeCode = (typeof FEE_TYPE_OPTIONS)[number]['value'];
export type FeeStatusCode = (typeof FEE_STATUS_OPTIONS)[number]['value'];

export type PaymentMethodOption = {
  id: string;
  name: string;
};

export type FeeRecord = {
  id: string;
  memberId: string;
  memberNumber: number;
  memberNumberLabel: string;
  memberName: string;
  type: FeeTypeCode;
  typeLabel: string;
  periodYear: number | null;
  periodMonth: number | null;
  periodLabel: string;
  baseAmount: number;
  baseAmountLabel: string;
  minimumWageUsed: number;
  surchargeAmount: number;
  surchargeLabel: string;
  total: number;
  totalLabel: string;
  status: FeeStatusCode;
  statusLabel: string;
  dueDate: string;
  dueDateLabel: string;
  dueLimit: string;
  dueLimitLabel: string;
  paidOn: string;
  paidOnLabel: string;
  paymentMethodId: string;
  paymentMethodName: string;
  payable: boolean;
};

export type PayFormValues = {
  paymentMethodId: string;
  paidOn: string;
  paymentNote: string;
};

export type PayFormErrors = Partial<Record<keyof PayFormValues, string>>;

export type PayFeesPayload = {
  feeIds: string[];
  paymentMethodId: string;
  paidOn: string;
  paymentNote: string | null;
};

export type RevertFeePayload = {
  note: string;
};

export type FeeFilters = {
  search: string;
  month: string;
  status: string;
  memberId: string;
  methodId: string;
};

export type PaymentPreviewLine = {
  id: string;
  periodLabel: string;
  baseAmount: number;
  surchargeAmount: number;
  total: number;
  baseLabel: string;
  surchargeLabel: string;
  totalLabel: string;
};

export type PaymentPreview = {
  lines: PaymentPreviewLine[];
  total: number;
  totalLabel: string;
};

export function emptyPayForm(today = ''): PayFormValues {
  return { paymentMethodId: '', paidOn: today, paymentNote: '' };
}

/** DateFieldMUI keeps ISO in `value` but emits `dd/MM/yyyy` on change. */
export function toIsoDateInput(value: string): string {
  const trimmed = value.trim();
  if (ISO_DATE.test(trimmed)) return trimmed;
  const match = DISPLAY_DATE.exec(trimmed);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return trimmed;
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

export function periodLabel(
  type: FeeTypeCode,
  year: number | null,
  month: number | null,
): string {
  if (type === 'ENROLLMENT') return 'Ingreso';
  if (!year || !month || month < 1 || month > 12) return 'Mensual';
  return `${MONTH_NAMES[month - 1]} ${year}`;
}

export function monthOptions(): { value: string; label: string }[] {
  return [
    { value: '', label: 'Todos' },
    ...MONTH_NAMES.map((name, index) => ({
      value: String(index + 1),
      label: name,
    })),
  ];
}

export function yearOptions(currentYear: number, span = 10) {
  const years: { value: string; label: string }[] = [];
  for (let year = currentYear; year >= currentYear - span; year -= 1) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
}

function optionLabel<T extends string>(
  options: readonly { value: T; label: string }[],
  value: T,
): string {
  return options.find((item) => item.value === value)?.label ?? value;
}

function isFeeType(value: unknown): value is FeeTypeCode {
  return value === 'MONTHLY' || value === 'ENROLLMENT';
}

function isFeeStatus(value: unknown): value is FeeStatusCode {
  return value === 'PENDING' || value === 'OVERDUE' || value === 'PAID';
}

export function mapFee(row: {
  id: string;
  memberId: string;
  memberNumber: number;
  memberName: string;
  type: FeeTypeCode;
  periodYear: number | null;
  periodMonth: number | null;
  baseAmount: number;
  minimumWageUsed: number;
  surchargeAmount: number;
  total: number;
  status: FeeStatusCode;
  dueDate: string;
  dueLimit: string;
  paidOn: string | null;
  paymentMethodId: string | null;
  paymentMethodName: string | null;
}): FeeRecord {
  return {
    id: row.id,
    memberId: row.memberId,
    memberNumber: row.memberNumber,
    memberNumberLabel: formatMemberNumber(row.memberNumber),
    memberName: row.memberName,
    type: row.type,
    typeLabel: optionLabel(FEE_TYPE_OPTIONS, row.type),
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    periodLabel: periodLabel(row.type, row.periodYear, row.periodMonth),
    baseAmount: row.baseAmount,
    baseAmountLabel: formatPesos(row.baseAmount),
    minimumWageUsed: row.minimumWageUsed,
    surchargeAmount: row.surchargeAmount,
    surchargeLabel: formatPesos(row.surchargeAmount),
    total: row.total,
    totalLabel: formatPesos(row.total),
    status: row.status,
    statusLabel: optionLabel(FEE_STATUS_OPTIONS, row.status),
    dueDate: row.dueDate,
    dueDateLabel: formatIsoDateLabel(row.dueDate),
    dueLimit: row.dueLimit,
    dueLimitLabel: formatIsoDateLabel(row.dueLimit),
    paidOn: row.paidOn ?? '',
    paidOnLabel: row.paidOn ? formatIsoDateLabel(row.paidOn) : '—',
    paymentMethodId: row.paymentMethodId ?? '',
    paymentMethodName: row.paymentMethodName ?? '—',
    payable: row.status !== 'PAID',
  };
}

export function mapFeeFromUnknown(row: Record<string, unknown>): FeeRecord | null {
  if (typeof row.id !== 'string' || typeof row.memberId !== 'string') return null;
  if (!isFeeType(row.type) || !isFeeStatus(row.status)) return null;
  if (typeof row.memberName !== 'string') return null;
  return mapFee({
    id: row.id,
    memberId: row.memberId,
    memberNumber: Number(row.memberNumber ?? 0),
    memberName: row.memberName,
    type: row.type,
    periodYear: row.periodYear == null ? null : Number(row.periodYear),
    periodMonth: row.periodMonth == null ? null : Number(row.periodMonth),
    baseAmount: Number(row.baseAmount ?? 0),
    minimumWageUsed: Number(row.minimumWageUsed ?? 0),
    surchargeAmount: Number(row.surchargeAmount ?? 0),
    total: Number(row.total ?? 0),
    status: row.status,
    dueDate: String(row.dueDate ?? ''),
    dueLimit: String(row.dueLimit ?? ''),
    paidOn: row.paidOn == null ? null : String(row.paidOn),
    paymentMethodId:
      row.paymentMethodId == null ? null : String(row.paymentMethodId),
    paymentMethodName:
      row.paymentMethodName == null ? null : String(row.paymentMethodName),
  });
}

export function matchesFeeSearch(row: FeeRecord, query: string): boolean {
  const needle = query.trim();
  if (!needle) return true;
  const haystack = [
    row.memberName,
    row.memberNumberLabel,
    String(row.memberNumber),
    row.periodLabel,
  ].join(' ');
  return haystack.toLocaleLowerCase('es').includes(needle.toLocaleLowerCase('es'));
}

export function matchesFeeFilters(row: FeeRecord, filters: FeeFilters): boolean {
  if (!matchesFeeSearch(row, filters.search)) return false;
  if (filters.month) {
    if (row.type !== 'MONTHLY' || String(row.periodMonth ?? '') !== filters.month) {
      return false;
    }
  }
  if (filters.status && row.status !== filters.status) return false;
  if (filters.memberId && row.memberId !== filters.memberId) return false;
  if (filters.methodId === 'none') return row.paymentMethodId === '';
  if (filters.methodId && row.paymentMethodId !== filters.methodId) return false;
  return true;
}

export function sameMember(fees: readonly { memberId: string }[]): boolean {
  if (fees.length <= 1) return true;
  return fees.every((fee) => fee.memberId === fees[0]?.memberId);
}

/**
 * Screen breakdown before confirming. The server recalculates the same
 * function when the payment is stored.
 */
export function previewPayment(
  fees: readonly Pick<
    FeeRecord,
    | 'id'
    | 'type'
    | 'periodLabel'
    | 'baseAmount'
    | 'dueLimit'
    | 'periodYear'
    | 'periodMonth'
    | 'minimumWageUsed'
  >[],
  todayIso: string,
  surchargePercent: string,
): PaymentPreview {
  let today;
  try {
    today = parseIsoDate(toIsoDateInput(todayIso));
  } catch {
    return { lines: [], total: 0, totalLabel: formatPesos(0) };
  }
  let percent = 0;
  try {
    percent = toPercentHundredths(surchargePercent || '0');
  } catch {
    percent = 0;
  }
  const lines = fees.flatMap((fee) => {
    let dueLimit;
    try {
      dueLimit = parseIsoDate(fee.dueLimit);
    } catch {
      return [];
    }
    const charge = resolveFeeCharge({
      type: fee.type,
      isPaid: false,
      baseAmount: fee.baseAmount,
      dueLimit,
      today,
      periodYear: fee.periodYear,
      periodMonth: fee.periodMonth,
      minimumWageUsed: fee.minimumWageUsed,
      surchargePercent: percent,
    });
    return [
      {
        id: fee.id,
        periodLabel: fee.periodLabel,
        baseAmount: fee.baseAmount,
        surchargeAmount: charge.surcharge,
        total: charge.total,
        baseLabel: formatPesos(fee.baseAmount),
        surchargeLabel: formatPesos(charge.surcharge),
        totalLabel: formatPesos(charge.total),
      },
    ];
  });
  const total = lines.reduce((sum, line) => sum + line.total, 0);
  return { lines, total, totalLabel: formatPesos(total) };
}

export function validatePayForm(
  values: PayFormValues,
  today: string,
): PayFormErrors {
  const errors: PayFormErrors = {};
  if (!values.paymentMethodId) {
    errors.paymentMethodId = 'El medio de pago es obligatorio.';
  }
  const paidOn = toIsoDateInput(values.paidOn);
  if (!ISO_DATE.test(paidOn)) {
    errors.paidOn = 'La fecha de pago no es válida.';
  } else {
    try {
      const todayIso = toIsoDateInput(today);
      if (!isValidPaymentDate(parseIsoDate(paidOn), parseIsoDate(todayIso))) {
        errors.paidOn = 'La fecha de pago no puede ser futura.';
      }
    } catch {
      errors.paidOn = 'La fecha de pago no es válida.';
    }
  }
  if (values.paymentNote.trim().length > 500) {
    errors.paymentNote = 'Máximo 500 caracteres.';
  }
  return errors;
}

export function validateRevertNote(note: string): string {
  const text = note.trim();
  if (!text) return 'La nota es obligatoria.';
  if (text.length > 500) return 'Máximo 500 caracteres.';
  return '';
}

export function toPayPayload(values: PayFormValues, feeIds: string[]): PayFeesPayload {
  const note = values.paymentNote.trim();
  return {
    feeIds,
    paymentMethodId: values.paymentMethodId,
    paidOn: toIsoDate(parseIsoDate(toIsoDateInput(values.paidOn))),
    paymentNote: note.length > 0 ? note : null,
  };
}
