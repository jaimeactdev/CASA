import 'server-only';

import { Prisma } from '@prisma/client';
import {
  calendarDate,
  parseIsoDate,
  toIsoDate,
  todayInBogota,
  yearMonthOf,
  type CalendarDate,
} from '@/rules/calendar';
import {
  canGenerateMonthlyFee,
  countPaidMonthlyFeesInYear,
  isMemberInArrears,
  periodDates,
  quoteFullFee,
  quoteMonthlyFee,
  resolveFeeCharge,
  sumTotalPaid,
  type PaidFeeSnapshot,
} from '@/rules/fees';
import {
  evaluateBenefit,
  type BenefitConditionResult,
} from '@/rules/benefits';
import {
  formatPercentHundredths,
  toPercentHundredths,
} from '@/rules/money';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import { ensureFeesUpToDate } from '@/server/modules/fees/fees.service';
import {
  createAuditLog,
  createFeeRecord,
  createMemberRecord,
  findMember,
  findMemberByDocument,
  findProfile,
  findSettings,
  listMembers,
  listProfiles,
  updateMemberRecord,
  type DbClient,
  type MemberDetailRow,
  type MemberListRow,
} from './members.repository';
import type { CreateMemberInput, UpdateMemberInput } from './members.schema';

export const MINIMUM_WAGE_REQUIRED_MESSAGE =
  'Falta configurar el SMMLV vigente. No se puede afiliar ni generar cuotas.';

type DocumentType = 'CC' | 'CE' | 'PASSPORT' | 'PPT';
type Sex = 'FEMALE' | 'MALE' | 'UNSPECIFIED';
type MemberStatus = 'ACTIVE' | 'SUSPENDED' | 'RETIRED';
type FeeType = 'MONTHLY' | 'ENROLLMENT';
type FeeStatus = 'PENDING' | 'OVERDUE' | 'PAID';

export type MemberListDto = {
  id: string;
  memberNumber: number;
  documentType: DocumentType;
  documentNumber: string;
  firstNames: string;
  lastNames: string;
  sex: Sex;
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
  status: MemberStatus;
  notes: string | null;
  currentFee: number;
  inArrears: boolean;
  totalPaid: number;
  paidFeesThisYear: number;
};

export type MemberFeeDto = {
  id: string;
  type: FeeType;
  periodYear: number | null;
  periodMonth: number | null;
  baseAmount: number;
  isReduced: boolean;
  reductionPercent: string | null;
  status: FeeStatus;
  dueDate: string;
  dueLimit: string;
  paidOn: string | null;
  paymentMethodName: string | null;
  surchargeAmount: number;
  total: number;
};

export type MemberBenefitDto = {
  id: string;
  name: string;
  minPaidFeesInYear: number;
  deliveriesThisYear: number;
  meetsMinimum: boolean;
  alreadyReceived: boolean;
  minimumBlocked: boolean;
  canDeliver: boolean;
  canDeliverWithException: boolean;
  conditions: BenefitConditionResult[];
};

export type MemberBenefitsDto = {
  memberId: string;
  year: number;
  paidFeesThisYear: number;
  benefits: MemberBenefitDto[];
};

export type CurrentFeeQuoteDto = {
  minimumWage: number;
  profilePercent: string;
  fullFee: number;
};

export type MemberDetailDto = MemberListDto & {
  createdByName: string;
  currentFeeQuote: CurrentFeeQuoteDto;
  fees: MemberFeeDto[];
  benefits: MemberBenefitDto[];
};

export type ProfileOptionDto = {
  id: string;
  name: string;
  isActive: boolean;
};

export type MembersSettingsDto = {
  minimumWage: number;
  enrollmentFee: number;
  firstFeeCutoffDay: number;
  firstFeePercent: string;
};

export type MembersPageDto = {
  today: string;
  settings: MembersSettingsDto;
  profiles: ProfileOptionDto[];
  members: MemberListDto[];
};

type SettingsRow = {
  minimumWage: number;
  enrollmentFee: number;
  firstFeeCutoffDay: number;
  firstFeePercent: Prisma.Decimal;
  graceDays: number;
  surchargePercent: Prisma.Decimal;
};

type ProfileRow = {
  id: string;
  name: string;
  percent: Prisma.Decimal;
  isActive: boolean;
};

export function assertCanEnroll(minimumWage: number): void {
  if (minimumWage <= 0) {
    throw new HttpError(409, MINIMUM_WAGE_REQUIRED_MESSAGE);
  }
}

export function dateToIso(value: Date): string {
  return toIsoDate(
    calendarDate(
      value.getUTCFullYear(),
      value.getUTCMonth() + 1,
      value.getUTCDate(),
    ),
  );
}

export function isoToDate(iso: string): Date {
  parseIsoDate(iso);
  return new Date(`${iso}T00:00:00.000Z`);
}

function decimalText(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

function currentFeeOf(minimumWage: number, percent: Prisma.Decimal): number {
  if (minimumWage <= 0) return 0;
  return quoteFullFee(minimumWage, toPercentHundredths(percent));
}

function paidSnapshots(
  fees: ReadonlyArray<{
    type: FeeType;
    status: FeeStatus;
    periodYear: number | null;
    totalPaid: number | null;
  }>,
): PaidFeeSnapshot[] {
  return fees.map((fee) => ({
    type: fee.type,
    status: fee.status,
    periodYear: fee.periodYear,
    totalPaid: fee.totalPaid,
  }));
}

function memberTotals(
  fees: ReadonlyArray<{
    type: FeeType;
    status: FeeStatus;
    periodYear: number | null;
    totalPaid: number | null;
  }>,
  year: number,
) {
  const snapshots = paidSnapshots(fees);
  return {
    inArrears: isMemberInArrears(fees),
    totalPaid: sumTotalPaid(snapshots),
    paidFeesThisYear: countPaidMonthlyFeesInYear(snapshots, year),
  };
}

function toListDto(
  row: MemberListRow | MemberDetailRow,
  minimumWage: number,
  year: number,
): MemberListDto {
  const totals = memberTotals(row.fees, year);
  return {
    id: row.id,
    memberNumber: row.memberNumber,
    documentType: row.documentType,
    documentNumber: row.documentNumber,
    firstNames: row.firstNames,
    lastNames: row.lastNames,
    sex: row.sex,
    birthDate: dateToIso(row.birthDate),
    mobilePhone: row.mobilePhone,
    phone: row.phone,
    email: row.email,
    address: row.address,
    residenceCity: row.residenceCity,
    shirtSize: row.shirtSize,
    pantsSize: row.pantsSize,
    shoeSize: row.shoeSize,
    joinedOn: dateToIso(row.joinedOn),
    profileId: row.profileId,
    profileName: row.profile.name,
    profilePercent: decimalText(row.profile.percent),
    status: row.status,
    notes: row.notes,
    currentFee: currentFeeOf(minimumWage, row.profile.percent),
    inArrears: totals.inArrears,
    totalPaid: totals.totalPaid,
    paidFeesThisYear: totals.paidFeesThisYear,
  };
}

function toFeeDto(
  row: MemberDetailRow['fees'][number],
  today: CalendarDate,
  surchargePercent: Prisma.Decimal,
): MemberFeeDto {
  const isPaid = row.status === 'PAID';
  const charge = resolveFeeCharge({
    type: row.type,
    isPaid,
    baseAmount: row.baseAmount,
    dueLimit: parseIsoDate(dateToIso(row.dueLimit)),
    today,
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    minimumWageUsed: row.minimumWageUsed,
    surchargePercent: toPercentHundredths(surchargePercent),
    frozen: isPaid
      ? {
          monthsLateCharged: row.monthsLateCharged ?? 0,
          surchargeAmount: row.surchargeAmount ?? 0,
        }
      : null,
  });
  return {
    id: row.id,
    type: row.type,
    periodYear: row.periodYear,
    periodMonth: row.periodMonth,
    baseAmount: row.baseAmount,
    isReduced: row.isReduced,
    reductionPercent: row.reductionPercent
      ? decimalText(row.reductionPercent)
      : null,
    status: charge.status,
    dueDate: dateToIso(row.dueDate),
    dueLimit: dateToIso(row.dueLimit),
    paidOn: row.paidOn ? dateToIso(row.paidOn) : null,
    paymentMethodName: row.paymentMethod?.name ?? null,
    surchargeAmount: charge.surcharge,
    total: charge.total,
  };
}

function toBenefitDtos(
  row: MemberDetailRow,
  year: number,
): MemberBenefitDto[] {
  const paidThisYear = memberTotals(row.fees, year).paidFeesThisYear;
  return [...row.profile.benefits]
    .map((link) => link.benefit)
    .sort((left, right) => left.name.localeCompare(right.name, 'es'))
    .map((benefit) => {
      const deliveriesThisYear = row.deliveries.filter(
        (delivery) =>
          delivery.benefitId === benefit.id && delivery.year === year,
      ).length;
      const evaluation = evaluateBenefit({
        memberStatus: row.status,
        profileIncludesBenefit: true,
        memberSex: row.sex,
        audience: benefit.audience,
        paidMonthlyFeesInYear: paidThisYear,
        minPaidFeesInYear: benefit.minPaidFeesInYear,
        deliveriesThisYear,
        maxDeliveriesPerYear: benefit.maxDeliveriesPerYear,
        requiresMinimumSetup: benefit.requiresMinimumSetup,
      });
      const byKey = Object.fromEntries(
        evaluation.conditions.map((item) => [item.key, item.passed]),
      );
      return {
        id: benefit.id,
        name: benefit.name,
        minPaidFeesInYear: benefit.minPaidFeesInYear,
        deliveriesThisYear,
        meetsMinimum: byKey.minPaidFeesMet === true,
        alreadyReceived: deliveriesThisYear > 0,
        minimumBlocked: byKey.minimumConfigured === false,
        canDeliver: evaluation.canDeliver,
        canDeliverWithException: evaluation.canDeliverWithException,
        conditions: evaluation.conditions,
      };
    });
}

function toDetailDto(
  row: MemberDetailRow,
  settings: SettingsRow,
  year: number,
  today: CalendarDate,
): MemberDetailDto {
  const fees = row.fees.map((fee) =>
    toFeeDto(fee, today, settings.surchargePercent),
  );
  return {
    ...toListDto(row, settings.minimumWage, year),
    inArrears: isMemberInArrears(fees),
    createdByName: row.createdBy.name,
    currentFeeQuote: {
      minimumWage: settings.minimumWage,
      profilePercent: decimalText(row.profile.percent),
      fullFee: currentFeeOf(settings.minimumWage, row.profile.percent),
    },
    fees,
    benefits: toBenefitDtos(row, year),
  };
}

function assertNotFuture(date: CalendarDate, today: CalendarDate, message: string) {
  if (
    date.year > today.year ||
    (date.year === today.year && date.month > today.month) ||
    (date.year === today.year &&
      date.month === today.month &&
      date.day > today.day)
  ) {
    throw new HttpError(400, message);
  }
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

function uniqueConflictMessage(error: Prisma.PrismaClientKnownRequestError): string {
  const target = Array.isArray(error.meta?.target)
    ? (error.meta?.target as string[]).join(',')
    : String(error.meta?.target ?? '');
  if (target.includes('document')) {
    return 'Ya existe un afiliado con ese documento.';
  }
  return 'Ese afiliado entra en conflicto con un registro existente.';
}

async function write<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isUniqueConstraint(error)) {
      throw new HttpError(
        409,
        uniqueConflictMessage(error as Prisma.PrismaClientKnownRequestError),
      );
    }
    throw error;
  }
}

async function requireSettings(db: DbClient = prisma): Promise<SettingsRow> {
  const settings = await findSettings(db);
  if (!settings) {
    throw new HttpError(500, 'No hay parámetros configurados.');
  }
  return settings;
}

async function requireAssignableProfile(
  profileId: string,
  db: DbClient,
  currentProfileId?: string,
): Promise<ProfileRow> {
  const profile = await findProfile(profileId, db);
  if (!profile) {
    throw new HttpError(400, 'Ese perfil no existe.');
  }
  if (!profile.isActive && profile.id !== currentProfileId) {
    throw new HttpError(
      409,
      'Ese perfil no se asigna a afiliados nuevos.',
    );
  }
  return profile;
}

async function assertDocumentAvailable(
  documentType: DocumentType,
  documentNumber: string,
  db: DbClient,
  currentId?: string,
) {
  const existing = await findMemberByDocument(documentType, documentNumber, db);
  if (existing && existing.id !== currentId) {
    throw new HttpError(409, 'Ya existe un afiliado con ese documento.');
  }
}

async function createMonthlyFeeForNewMember(input: {
  memberId: string;
  memberStatus: MemberStatus;
  joinedOn: CalendarDate;
  today: CalendarDate;
  profile: ProfileRow;
  settings: SettingsRow;
  actorId: string;
  db: DbClient;
}): Promise<void> {
  const period = yearMonthOf(input.today);
  if (
    !canGenerateMonthlyFee({
      memberStatus: input.memberStatus,
      joinedOn: input.joinedOn,
      periodYear: period.year,
      periodMonth: period.month,
      today: input.today,
    })
  ) {
    return;
  }

  const quote = quoteMonthlyFee({
    minimumWage: input.settings.minimumWage,
    profilePercent: toPercentHundredths(input.profile.percent),
    isFirstMonthlyFee: true,
    joinedOn: input.joinedOn,
    firstFeeCutoffDay: input.settings.firstFeeCutoffDay,
    firstFeePercent: toPercentHundredths(input.settings.firstFeePercent),
  });
  const dates = periodDates(period.year, period.month, input.settings.graceDays);
  const created = await createFeeRecord(
    {
      memberId: input.memberId,
      type: 'MONTHLY',
      periodYear: period.year,
      periodMonth: period.month,
      minimumWageUsed: input.settings.minimumWage,
      profilePercent: input.profile.percent,
      baseAmount: quote.baseAmount,
      isReduced: quote.isReduced,
      reductionPercent:
        quote.reductionPercent == null
          ? null
          : new Prisma.Decimal(formatPercentHundredths(quote.reductionPercent)),
      dueDate: isoToDate(toIsoDate(dates.dueDate)),
      dueLimit: isoToDate(toIsoDate(dates.dueLimit)),
      status: 'PENDING',
    },
    input.db,
  );
  await createAuditLog(
    {
      userId: input.actorId,
      entity: 'fee',
      entityId: created.id,
      action: 'fee.generate',
      detail: {
        type: 'MONTHLY',
        memberId: input.memberId,
        periodYear: period.year,
        periodMonth: period.month,
        baseAmount: quote.baseAmount,
        isReduced: quote.isReduced,
      },
    },
    input.db,
  );
}

async function createEnrollmentFee(input: {
  memberId: string;
  joinedOn: CalendarDate;
  amount: number;
  actorId: string;
  db: DbClient;
}): Promise<void> {
  const due = isoToDate(toIsoDate(input.joinedOn));
  const created = await createFeeRecord(
    {
      memberId: input.memberId,
      type: 'ENROLLMENT',
      periodYear: null,
      periodMonth: null,
      minimumWageUsed: 0,
      profilePercent: new Prisma.Decimal('0.00'),
      baseAmount: input.amount,
      isReduced: false,
      reductionPercent: null,
      dueDate: due,
      dueLimit: due,
      status: 'PENDING',
    },
    input.db,
  );
  await createAuditLog(
    {
      userId: input.actorId,
      entity: 'fee',
      entityId: created.id,
      action: 'fee.generate',
      detail: {
        type: 'ENROLLMENT',
        memberId: input.memberId,
        baseAmount: input.amount,
      },
    },
    input.db,
  );
}

export async function getMembersPage(now = new Date()): Promise<MembersPageDto> {
  const today = todayInBogota(now);
  const [settings, profiles, members] = await Promise.all([
    requireSettings(),
    listProfiles(),
    listMembers(),
  ]);
  return {
    today: toIsoDate(today),
    settings: {
      minimumWage: settings.minimumWage,
      enrollmentFee: settings.enrollmentFee,
      firstFeeCutoffDay: settings.firstFeeCutoffDay,
      firstFeePercent: decimalText(settings.firstFeePercent),
    },
    profiles,
    members: members.map((row) =>
      toListDto(row, settings.minimumWage, today.year),
    ),
  };
}

export async function getMember(
  id: string,
  now = new Date(),
  actorId: string | null = null,
): Promise<MemberDetailDto> {
  await ensureFeesUpToDate(now, { actorId, source: 'request' });
  const today = todayInBogota(now);
  const [settings, row] = await Promise.all([requireSettings(), findMember(id)]);
  if (!row) throw new HttpError(404, 'Ese afiliado no existe.');
  return toDetailDto(row, settings, today.year, today);
}

export async function getMemberBenefits(
  id: string,
  year: number | undefined,
  now = new Date(),
  actorId: string | null = null,
): Promise<MemberBenefitsDto> {
  await ensureFeesUpToDate(now, { actorId, source: 'request' });
  const today = todayInBogota(now);
  const targetYear = year ?? today.year;
  const row = await findMember(id);
  if (!row) throw new HttpError(404, 'Ese afiliado no existe.');
  return {
    memberId: row.id,
    year: targetYear,
    paidFeesThisYear: memberTotals(row.fees, targetYear).paidFeesThisYear,
    benefits: toBenefitDtos(row, targetYear),
  };
}

export async function createMember(
  actorId: string,
  input: CreateMemberInput,
  now = new Date(),
): Promise<MemberListDto> {
  const today = todayInBogota(now);
  const joinedOn = parseIsoDate(input.joinedOn ?? toIsoDate(today));
  const birthDate = parseIsoDate(input.birthDate);
  assertNotFuture(birthDate, today, 'La fecha de nacimiento no puede ser futura.');
  assertNotFuture(joinedOn, today, 'La fecha de afiliación no puede ser futura.');

  return write(() =>
    prisma.$transaction(async (tx) => {
      const settings = await requireSettings(tx);
      assertCanEnroll(settings.minimumWage);
      const profile = await requireAssignableProfile(input.profileId, tx);
      await assertDocumentAvailable(
        input.documentType,
        input.documentNumber,
        tx,
      );

      const created = await createMemberRecord(
        {
          documentType: input.documentType,
          documentNumber: input.documentNumber,
          firstNames: input.firstNames,
          lastNames: input.lastNames,
          sex: input.sex,
          birthDate: isoToDate(input.birthDate),
          mobilePhone: input.mobilePhone,
          phone: input.phone ?? null,
          email: input.email ?? null,
          address: input.address,
          residenceCity: input.residenceCity,
          shirtSize: input.shirtSize ?? null,
          pantsSize: input.pantsSize ?? null,
          shoeSize: input.shoeSize ?? null,
          joinedOn: isoToDate(toIsoDate(joinedOn)),
          status: 'ACTIVE',
          notes: input.notes ?? null,
          profile: { connect: { id: profile.id } },
          createdBy: { connect: { id: actorId } },
        },
        tx,
      );

      await createMonthlyFeeForNewMember({
        memberId: created.id,
        memberStatus: 'ACTIVE',
        joinedOn,
        today,
        profile,
        settings,
        actorId,
        db: tx,
      });

      if (input.chargeEnrollment === true && settings.enrollmentFee > 0) {
        await createEnrollmentFee({
          memberId: created.id,
          joinedOn,
          amount: settings.enrollmentFee,
          actorId,
          db: tx,
        });
      }

      const fresh = await findMember(created.id, tx);
      if (!fresh) throw new HttpError(404, 'Ese afiliado no existe.');
      const after = toListDto(fresh, settings.minimumWage, today.year);
      await createAuditLog(
        {
          userId: actorId,
          entity: 'member',
          entityId: created.id,
          action: 'member.create',
          detail: { after },
        },
        tx,
      );
      return after;
    }),
  );
}

export async function updateMember(
  actorId: string,
  id: string,
  input: UpdateMemberInput,
  now = new Date(),
): Promise<MemberListDto> {
  const today = todayInBogota(now);
  if (input.birthDate) {
    assertNotFuture(
      parseIsoDate(input.birthDate),
      today,
      'La fecha de nacimiento no puede ser futura.',
    );
  }
  if (input.joinedOn) {
    assertNotFuture(
      parseIsoDate(input.joinedOn),
      today,
      'La fecha de afiliación no puede ser futura.',
    );
  }

  return write(() =>
    prisma.$transaction(async (tx) => {
      const current = await findMember(id, tx);
      if (!current) throw new HttpError(404, 'Ese afiliado no existe.');
      const settings = await requireSettings(tx);

      const nextDocumentType = input.documentType ?? current.documentType;
      const nextDocumentNumber = input.documentNumber ?? current.documentNumber;
      if (
        nextDocumentType !== current.documentType ||
        nextDocumentNumber !== current.documentNumber
      ) {
        await assertDocumentAvailable(
          nextDocumentType,
          nextDocumentNumber,
          tx,
          id,
        );
      }

      if (input.profileId && input.profileId !== current.profileId) {
        await requireAssignableProfile(input.profileId, tx, current.profileId);
      }

      const data: Prisma.MemberUpdateInput = {};
      if (input.documentType !== undefined) data.documentType = input.documentType;
      if (input.documentNumber !== undefined) {
        data.documentNumber = input.documentNumber;
      }
      if (input.firstNames !== undefined) data.firstNames = input.firstNames;
      if (input.lastNames !== undefined) data.lastNames = input.lastNames;
      if (input.sex !== undefined) data.sex = input.sex;
      if (input.birthDate !== undefined) data.birthDate = isoToDate(input.birthDate);
      if (input.mobilePhone !== undefined) data.mobilePhone = input.mobilePhone;
      if (input.phone !== undefined) data.phone = input.phone;
      if (input.email !== undefined) data.email = input.email;
      if (input.address !== undefined) data.address = input.address;
      if (input.residenceCity !== undefined) {
        data.residenceCity = input.residenceCity;
      }
      if (input.shirtSize !== undefined) data.shirtSize = input.shirtSize;
      if (input.pantsSize !== undefined) data.pantsSize = input.pantsSize;
      if (input.shoeSize !== undefined) data.shoeSize = input.shoeSize;
      if (input.joinedOn !== undefined) data.joinedOn = isoToDate(input.joinedOn);
      if (input.notes !== undefined) data.notes = input.notes;
      if (input.status !== undefined) data.status = input.status;
      if (input.profileId !== undefined) {
        data.profile = { connect: { id: input.profileId } };
      }

      await updateMemberRecord(id, data, tx);
      const fresh = await findMember(id, tx);
      if (!fresh) throw new HttpError(404, 'Ese afiliado no existe.');

      const before = toListDto(current, settings.minimumWage, today.year);
      const after = toListDto(fresh, settings.minimumWage, today.year);
      const statusChanged = input.status !== undefined && input.status !== current.status;
      const otherChanged =
        input.status === undefined ||
        Object.keys(input).some((key) => key !== 'status');

      if (statusChanged) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'member',
            entityId: id,
            action: 'member.status_change',
            detail: {
              before: { status: current.status },
              after: { status: fresh.status },
            },
          },
          tx,
        );
      }
      if (otherChanged) {
        await createAuditLog(
          {
            userId: actorId,
            entity: 'member',
            entityId: id,
            action: 'member.update',
            detail: { before, after },
          },
          tx,
        );
      }
      return after;
    }),
  );
}
