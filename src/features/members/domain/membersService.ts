import { MembersRepository } from '../data/repositories/MembersRepository';
import {
  benefitConditionLabel,
  emptyMemberForm,
  formatIsoDateLabel,
  formatPesos,
  mapMember,
  toCreatePayload,
  toDeliverBenefitPayload,
  toUpdatePayload,
  validateBenefitDelivery,
  validateMemberForm,
  type BenefitConditionRecord,
  type BenefitDeliveryFormErrors,
  type BenefitDeliveryFormValues,
  type CreateMemberPayload,
  type CurrentFeeQuote,
  type DeliverBenefitPayload,
  type MemberBenefitRecord,
  type MemberDetail,
  type MemberFeeRecord,
  type MemberFormErrors,
  type MemberFormValues,
  type MemberRecord,
  type MembersSettings,
  type ProfileOption,
  type UpdateMemberPayload,
} from './membersTypes';

export type MembersPage = {
  today: string;
  settings: MembersSettings;
  profiles: ProfileOption[];
  members: MemberRecord[];
};

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function optionalText(value: unknown): string | null {
  if (value == null) return null;
  const next = String(value).trim();
  return next.length > 0 ? next : null;
}

function isDocumentType(
  value: unknown,
): value is MemberRecord['documentType'] {
  return value === 'CC' || value === 'CE' || value === 'PASSPORT' || value === 'PPT';
}

function isSex(value: unknown): value is MemberRecord['sex'] {
  return value === 'FEMALE' || value === 'MALE' || value === 'UNSPECIFIED';
}

function isStatus(value: unknown): value is MemberRecord['status'] {
  return value === 'ACTIVE' || value === 'SUSPENDED' || value === 'RETIRED';
}

function toProfileOption(row: Record<string, unknown>): ProfileOption | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return { id: row.id, name: row.name, isActive: row.isActive === true };
}

function toMember(row: Record<string, unknown>): MemberRecord | null {
  if (typeof row.id !== 'string') return null;
  if (!isDocumentType(row.documentType) || !isSex(row.sex) || !isStatus(row.status)) {
    return null;
  }
  if (typeof row.firstNames !== 'string' || typeof row.lastNames !== 'string') {
    return null;
  }
  return mapMember({
    id: row.id,
    memberNumber: Number(row.memberNumber ?? 0),
    documentType: row.documentType,
    documentNumber: text(row.documentNumber),
    firstNames: row.firstNames,
    lastNames: row.lastNames,
    sex: row.sex,
    birthDate: text(row.birthDate),
    mobilePhone: text(row.mobilePhone),
    phone: optionalText(row.phone),
    email: optionalText(row.email),
    address: text(row.address),
    residenceCity: text(row.residenceCity),
    shirtSize: optionalText(row.shirtSize),
    pantsSize: optionalText(row.pantsSize),
    shoeSize: optionalText(row.shoeSize),
    joinedOn: text(row.joinedOn),
    profileId: text(row.profileId),
    profileName: text(row.profileName),
    profilePercent: text(row.profilePercent),
    status: row.status,
    notes: optionalText(row.notes),
    currentFee: Number(row.currentFee ?? 0),
    inArrears: row.inArrears === true,
    totalPaid: Number(row.totalPaid ?? 0),
    paidFeesThisYear: Number(row.paidFeesThisYear ?? 0),
  });
}

function feePeriodLabel(row: Record<string, unknown>): string {
  if (row.type === 'ENROLLMENT') return 'Ingreso';
  const year = Number(row.periodYear ?? 0);
  const month = Number(row.periodMonth ?? 0);
  if (!year || !month) return 'Mensual';
  return `${String(month).padStart(2, '0')}/${year}`;
}

function toFee(row: Record<string, unknown>): MemberFeeRecord | null {
  if (typeof row.id !== 'string') return null;
  const type = row.type === 'ENROLLMENT' ? 'ENROLLMENT' : 'MONTHLY';
  const status =
    row.status === 'PAID' ? 'PAID' : row.status === 'OVERDUE' ? 'OVERDUE' : 'PENDING';
  const statusLabel =
    status === 'PAID' ? 'Pagado' : status === 'OVERDUE' ? 'Moroso' : 'Pendiente';
  return {
    id: row.id,
    type,
    periodLabel: feePeriodLabel(row),
    baseAmountLabel: formatPesos(Number(row.baseAmount ?? 0)),
    surchargeLabel: formatPesos(Number(row.surchargeAmount ?? 0)),
    totalLabel: formatPesos(Number(row.total ?? row.baseAmount ?? 0)),
    statusLabel,
    isReduced: row.isReduced === true,
    dueDateLabel: formatIsoDateLabel(text(row.dueDate)),
    paidOnLabel: row.paidOn ? formatIsoDateLabel(text(row.paidOn)) : '',
    paymentMethodName: text(row.paymentMethodName),
  };
}

function toConditions(value: unknown): BenefitConditionRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.key !== 'string') return [];
    return [
      {
        key: row.key,
        label: benefitConditionLabel(row.key),
        passed: row.passed === true,
      },
    ];
  });
}

function toBenefit(row: Record<string, unknown>): MemberBenefitRecord | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return {
    id: row.id,
    name: row.name,
    minPaidFeesInYear: Number(row.minPaidFeesInYear ?? 0),
    deliveriesThisYear: Number(row.deliveriesThisYear ?? 0),
    meetsMinimum: row.meetsMinimum === true,
    alreadyReceived: row.alreadyReceived === true,
    minimumBlocked: row.minimumBlocked === true,
    canDeliver: row.canDeliver === true,
    canDeliverWithException: row.canDeliverWithException === true,
    conditions: toConditions(row.conditions),
  };
}

function toQuote(row: Record<string, unknown>): CurrentFeeQuote {
  const minimumWage = Number(row.minimumWage ?? 0);
  const fullFee = Number(row.fullFee ?? 0);
  return {
    minimumWage,
    profilePercent: text(row.profilePercent),
    fullFee,
    fullFeeLabel: formatPesos(fullFee),
    minimumWageLabel: formatPesos(minimumWage),
  };
}

export function toMembersPage(payload: unknown): MembersPage {
  const body = asRecord(payload);
  const settingsBody = asRecord(body.settings);
  const members = Array.isArray(body.members)
    ? body.members.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toMember(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  const profiles = Array.isArray(body.profiles)
    ? body.profiles.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toProfileOption(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    today: text(body.today),
    settings: {
      minimumWage: Number(settingsBody.minimumWage ?? 0),
      enrollmentFee: Number(settingsBody.enrollmentFee ?? 0),
      firstFeeCutoffDay: Number(settingsBody.firstFeeCutoffDay ?? 15),
      firstFeePercent: text(settingsBody.firstFeePercent || '50.00'),
    },
    profiles,
    members,
  };
}

export function toMemberDetail(payload: unknown): MemberDetail | null {
  const body = asRecord(payload);
  const member = toMember(body);
  if (!member) return null;
  const quote = asRecord(body.currentFeeQuote);
  const fees = Array.isArray(body.fees)
    ? body.fees.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toFee(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  const benefits = Array.isArray(body.benefits)
    ? body.benefits.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = toBenefit(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    ...member,
    createdByName: text(body.createdByName),
    currentFeeQuote: toQuote(quote),
    fees,
    benefits,
  };
}

export class MembersService {
  constructor(private readonly repo = new MembersRepository()) {}

  createEmptyForm(today: string) {
    return emptyMemberForm(today);
  }

  async load(): Promise<MembersPage> {
    return toMembersPage(await this.repo.getMembers());
  }

  async loadDetail(id: string): Promise<MemberDetail> {
    const mapped = toMemberDetail(await this.repo.getMember(id));
    if (!mapped) throw new Error('No pudimos leer la ficha del afiliado.');
    return mapped;
  }

  prepareCreate(
    values: MemberFormValues,
  ):
    | { ok: false; errors: MemberFormErrors }
    | { ok: true; payload: CreateMemberPayload } {
    const errors = validateMemberForm(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toCreatePayload(values) };
  }

  prepareUpdate(
    values: MemberFormValues,
  ):
    | { ok: false; errors: MemberFormErrors }
    | { ok: true; payload: UpdateMemberPayload } {
    const errors = validateMemberForm(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toUpdatePayload(values) };
  }

  async create(payload: CreateMemberPayload): Promise<MemberRecord> {
    const mapped = toMember(asRecord(await this.repo.createMember(payload)));
    if (!mapped) throw new Error('No pudimos leer el afiliado creado.');
    return mapped;
  }

  async update(id: string, payload: UpdateMemberPayload): Promise<MemberRecord> {
    const mapped = toMember(asRecord(await this.repo.updateMember(id, payload)));
    if (!mapped) throw new Error('No pudimos leer el afiliado actualizado.');
    return mapped;
  }

  prepareDelivery(
    memberId: string,
    benefitId: string,
    values: BenefitDeliveryFormValues,
    today: string,
    year: number,
    requiresNote: boolean,
  ):
    | { ok: false; errors: BenefitDeliveryFormErrors }
    | { ok: true; payload: DeliverBenefitPayload } {
    const errors = validateBenefitDelivery(values, today, year, requiresNote);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return {
      ok: true,
      payload: toDeliverBenefitPayload(memberId, benefitId, values),
    };
  }

  async deliver(payload: DeliverBenefitPayload): Promise<void> {
    await this.repo.deliverBenefit(payload);
  }
}
