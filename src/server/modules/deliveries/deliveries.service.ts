import 'server-only';

import {
  calendarDate,
  isOnOrBefore,
  parseIsoDate,
  toIsoDate,
  todayInBogota,
  type CalendarDate,
} from '@/rules/calendar';
import { countPaidMonthlyFeesInYear } from '@/rules/fees';
import { evaluateBenefit } from '@/rules/benefits';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  countActiveDeliveries,
  createDeliveryAuditLog,
  createDeliveryRecord,
  findBenefitForDelivery,
  findDelivery,
  findMemberForDelivery,
  listBenefitOptions,
  listDeliveriesForYear,
  lockMemberRow,
  markDeliveryVoided,
  type DeliveryRow,
} from './deliveries.repository';
import type {
  DeliverBenefitInput,
  DeliveriesQuery,
  VoidDeliveryInput,
} from './deliveries.schema';

export type DeliveryAccess = {
  canDeliver: boolean;
  canDeliverException: boolean;
};

export type DeliveryDto = {
  id: string;
  memberId: string;
  memberNumber: number;
  memberName: string;
  benefitId: string;
  benefitName: string;
  year: number;
  deliveredOn: string;
  isException: boolean;
  isVoided: boolean;
  note: string | null;
  voidNote: string | null;
  deliveredByName: string;
  voidedByName: string | null;
};

export type DeliveriesPageDto = {
  today: string;
  year: number;
  benefits: { id: string; name: string }[];
  deliveries: DeliveryDto[];
};

const QUOTA_MESSAGE =
  'Ese beneficio ya alcanzó el máximo de entregas de este año.';
const EXCEPTION_NOTE_MESSAGE =
  'La nota es obligatoria cuando la entrega es una excepción.';
const EXCEPTION_PERMISSION_MESSAGE =
  'No tienes permiso para entregar con excepción.';

function utcDateToCalendar(value: Date): CalendarDate {
  return calendarDate(
    value.getUTCFullYear(),
    value.getUTCMonth() + 1,
    value.getUTCDate(),
  );
}

function calendarToDbDate(date: CalendarDate): Date {
  return new Date(`${toIsoDate(date)}T00:00:00.000Z`);
}

function memberName(row: { firstNames: string; lastNames: string }): string {
  return `${row.firstNames} ${row.lastNames}`.trim();
}

function toDeliveryDto(row: DeliveryRow): DeliveryDto {
  return {
    id: row.id,
    memberId: row.memberId,
    memberNumber: row.member.memberNumber,
    memberName: memberName(row.member),
    benefitId: row.benefitId,
    benefitName: row.benefit.name,
    year: row.year,
    deliveredOn: toIsoDate(utcDateToCalendar(row.deliveredOn)),
    isException: row.isException,
    isVoided: row.isVoided,
    note: row.note,
    voidNote: row.voidNote,
    deliveredByName: row.deliveredBy.name,
    voidedByName: row.voidedBy?.name ?? null,
  };
}

export async function getDeliveriesPage(
  query: DeliveriesQuery,
  now = new Date(),
): Promise<DeliveriesPageDto> {
  const today = todayInBogota(now);
  const year = query.year ?? today.year;
  const [rows, benefits] = await Promise.all([
    listDeliveriesForYear(year, {
      benefitId: query.benefitId,
      memberId: query.memberId,
    }),
    listBenefitOptions(),
  ]);
  const deliveries = rows.map(toDeliveryDto).sort((left, right) => {
    const byDate = right.deliveredOn.localeCompare(left.deliveredOn);
    if (byDate !== 0) return byDate;
    return left.memberName.localeCompare(right.memberName, 'es');
  });
  return {
    today: toIsoDate(today),
    year,
    benefits,
    deliveries,
  };
}

export async function deliverBenefit(
  actorId: string,
  access: DeliveryAccess,
  input: DeliverBenefitInput,
  now = new Date(),
): Promise<{ id: string; year: number; isException: boolean; deliveredOn: string }> {
  if (!access.canDeliver && !access.canDeliverException) {
    throw new HttpError(403, 'No tienes permiso para esta acción.');
  }
  const today = todayInBogota(now);
  const deliveredOn = parseIsoDate(input.deliveredOn);
  if (!isOnOrBefore(deliveredOn, today)) {
    throw new HttpError(400, 'La fecha de entrega no puede ser futura.');
  }

  return prisma.$transaction(async (tx) => {
    await lockMemberRow(input.memberId, tx);
    const member = await findMemberForDelivery(input.memberId, tx);
    if (!member) throw new HttpError(404, 'Ese afiliado no existe.');
    const benefit = await findBenefitForDelivery(input.benefitId, tx);
    if (!benefit) throw new HttpError(404, 'Ese beneficio no existe.');
    if (!benefit.isActive) {
      throw new HttpError(409, 'Ese beneficio no está activo.');
    }

    const deliveriesThisYear = await countActiveDeliveries(
      member.id,
      benefit.id,
      deliveredOn.year,
      tx,
    );
    const evaluation = evaluateBenefit({
      memberStatus: member.status,
      profileIncludesBenefit: member.profile.benefits.some(
        (link) => link.benefitId === benefit.id,
      ),
      memberSex: member.sex,
      audience: benefit.audience,
      paidMonthlyFeesInYear: countPaidMonthlyFeesInYear(
        member.fees.map((fee) => ({
          type: fee.type,
          status: fee.status,
          periodYear: fee.periodYear,
          totalPaid: null,
        })),
        deliveredOn.year,
      ),
      minPaidFeesInYear: benefit.minPaidFeesInYear,
      deliveriesThisYear,
      maxDeliveriesPerYear: benefit.maxDeliveriesPerYear,
      requiresMinimumSetup: benefit.requiresMinimumSetup,
    });

    if (!evaluation.canDeliverWithException) {
      throw new HttpError(409, QUOTA_MESSAGE);
    }

    const isException = !evaluation.canDeliver;
    if (isException && !access.canDeliverException) {
      throw new HttpError(403, EXCEPTION_PERMISSION_MESSAGE);
    }
    if (isException && !input.note) {
      throw new HttpError(400, EXCEPTION_NOTE_MESSAGE);
    }

    const created = await createDeliveryRecord(
      {
        memberId: member.id,
        benefitId: benefit.id,
        year: deliveredOn.year,
        deliveredOn: calendarToDbDate(deliveredOn),
        deliveredById: actorId,
        isException,
        note: input.note,
      },
      tx,
    );
    await createDeliveryAuditLog(
      {
        userId: actorId,
        entity: 'benefit_delivery',
        entityId: created.id,
        action: 'benefit.deliver',
        note: input.note,
        detail: {
          memberId: member.id,
          benefitId: benefit.id,
          year: deliveredOn.year,
          deliveredOn: input.deliveredOn,
          isException,
          conditions: evaluation.conditions,
        },
      },
      tx,
    );
    return {
      id: created.id,
      year: deliveredOn.year,
      isException,
      deliveredOn: input.deliveredOn,
    };
  });
}

export async function voidDelivery(
  actorId: string,
  id: string,
  input: VoidDeliveryInput,
  now = new Date(),
): Promise<{ id: string; isVoided: true }> {
  return prisma.$transaction(async (tx) => {
    const delivery = await findDelivery(id, tx);
    if (!delivery) throw new HttpError(404, 'Esa entrega no existe.');
    if (delivery.isVoided) {
      throw new HttpError(409, 'Esa entrega ya está anulada.');
    }
    const cleared = await markDeliveryVoided(
      id,
      { voidedById: actorId, voidedAt: now, voidNote: input.note },
      tx,
    );
    if (cleared.count !== 1) {
      throw new HttpError(409, 'Esa entrega ya está anulada.');
    }
    await createDeliveryAuditLog(
      {
        userId: actorId,
        entity: 'benefit_delivery',
        entityId: delivery.id,
        action: 'benefit.void',
        note: input.note,
        detail: {
          memberId: delivery.memberId,
          benefitId: delivery.benefitId,
          year: delivery.year,
          before: { isVoided: false },
          after: { isVoided: true, voidedById: actorId },
        },
      },
      tx,
    );
    return { id: delivery.id, isVoided: true };
  });
}
