const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export type BenefitOption = {
  id: string;
  name: string;
};

export type DeliveryRecord = {
  id: string;
  memberId: string;
  memberNumber: number;
  memberNumberLabel: string;
  memberName: string;
  benefitId: string;
  benefitName: string;
  year: number;
  deliveredOn: string;
  deliveredOnLabel: string;
  isException: boolean;
  exceptionLabel: string;
  isVoided: boolean;
  voidedLabel: string;
  note: string;
  voidNote: string;
  deliveredByName: string;
  voidedByName: string;
};

export type DeliveryFilters = {
  search: string;
  benefitId: string;
  memberId: string;
  voided: string;
};

export type VoidDeliveryPayload = {
  note: string;
};

export function emptyDeliveryFilters(): DeliveryFilters {
  return { search: '', benefitId: '', memberId: '', voided: '' };
}

export function yearOptions(currentYear: number, span = 10) {
  const years: { value: string; label: string }[] = [];
  for (let year = currentYear; year >= currentYear - span; year -= 1) {
    years.push({ value: String(year), label: String(year) });
  }
  return years;
}

export function formatMemberNumber(value: number): string {
  return String(value).padStart(4, '0');
}

export function toIsoDateInput(value: string): string {
  const trimmed = value.trim();
  if (ISO_DATE.test(trimmed)) return trimmed;
  const match = DISPLAY_DATE.exec(trimmed);
  if (match) return `${match[3]}-${match[2]}-${match[1]}`;
  return trimmed;
}

export function formatIsoDateLabel(iso: string): string {
  const normalized = toIsoDateInput(iso);
  const match = ISO_DATE.exec(normalized);
  if (!match) return iso;
  return `${match[3]}/${match[2]}/${match[1]}`;
}

function yesNo(value: boolean): string {
  return value ? 'Sí' : 'No';
}

export function validateVoidNote(note: string): string {
  const text = note.trim();
  if (!text) return 'La nota es obligatoria.';
  if (text.length > 500) return 'Máximo 500 caracteres.';
  return '';
}

export function matchesDeliveryFilters(
  row: DeliveryRecord,
  filters: DeliveryFilters,
): boolean {
  if (filters.benefitId && row.benefitId !== filters.benefitId) return false;
  if (filters.memberId && row.memberId !== filters.memberId) return false;
  if (filters.voided === 'yes' && !row.isVoided) return false;
  if (filters.voided === 'no' && row.isVoided) return false;
  const needle = filters.search.trim();
  if (!needle) return true;
  const haystack = [
    row.memberName,
    row.memberNumberLabel,
    String(row.memberNumber),
    row.benefitName,
  ].join(' ');
  return haystack.toLocaleLowerCase('es').includes(needle.toLocaleLowerCase('es'));
}

export function mapDelivery(row: Record<string, unknown>): DeliveryRecord | null {
  if (typeof row.id !== 'string' || typeof row.memberId !== 'string') return null;
  if (typeof row.benefitId !== 'string' || typeof row.benefitName !== 'string') {
    return null;
  }
  const deliveredOn = typeof row.deliveredOn === 'string' ? row.deliveredOn : '';
  const note = typeof row.note === 'string' ? row.note : '';
  const voidNote = typeof row.voidNote === 'string' ? row.voidNote : '';
  return {
    id: row.id,
    memberId: row.memberId,
    memberNumber: Number(row.memberNumber ?? 0),
    memberNumberLabel: formatMemberNumber(Number(row.memberNumber ?? 0)),
    memberName: typeof row.memberName === 'string' ? row.memberName : '',
    benefitId: row.benefitId,
    benefitName: row.benefitName,
    year: Number(row.year ?? 0),
    deliveredOn,
    deliveredOnLabel: deliveredOn ? formatIsoDateLabel(deliveredOn) : '',
    isException: row.isException === true,
    exceptionLabel: yesNo(row.isException === true),
    isVoided: row.isVoided === true,
    voidedLabel: yesNo(row.isVoided === true),
    note,
    voidNote,
    deliveredByName:
      typeof row.deliveredByName === 'string' ? row.deliveredByName : '',
    voidedByName: typeof row.voidedByName === 'string' ? row.voidedByName : '',
  };
}
