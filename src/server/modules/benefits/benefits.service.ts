import 'server-only';

import { Prisma, type Benefit } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  createAuditLog,
  createBenefitRecord,
  findBenefit,
  listBenefits,
  updateBenefitRecord,
} from './benefits.repository';
import type { CreateBenefitInput, UpdateBenefitInput } from './benefits.schema';

export type BenefitDto = {
  id: string;
  name: string;
  internalDescription: string;
  publicText: string | null;
  isPublic: boolean;
  type: 'ANNUAL' | 'EVENTUAL';
  audience: 'ALL' | 'FEMALE' | 'MALE';
  minPaidFeesInYear: number;
  maxDeliveriesPerYear: number;
  suggestedMonth: number | null;
  requiresMinimumSetup: boolean;
  isActive: boolean;
};

export function normalizeMaxDeliveries(
  type: 'ANNUAL' | 'EVENTUAL',
  maxDeliveriesPerYear: number,
): number {
  if (type === 'ANNUAL') return 1;
  if (maxDeliveriesPerYear < 1 || maxDeliveriesPerYear > 12) {
    throw new HttpError(
      400,
      'Un beneficio eventual permite de 1 a 12 entregas al año.',
    );
  }
  return maxDeliveriesPerYear;
}

export function toBenefitDto(row: Benefit): BenefitDto {
  return {
    id: row.id,
    name: row.name,
    internalDescription: row.internalDescription,
    publicText: row.publicText,
    isPublic: row.isPublic,
    type: row.type,
    audience: row.audience,
    minPaidFeesInYear: row.minPaidFeesInYear,
    maxDeliveriesPerYear: row.maxDeliveriesPerYear,
    suggestedMonth: row.suggestedMonth,
    requiresMinimumSetup: row.requiresMinimumSetup,
    isActive: row.isActive,
  };
}

export async function getBenefits(): Promise<BenefitDto[]> {
  const rows = await listBenefits();
  return rows.map(toBenefitDto);
}

export async function createBenefit(
  actorId: string,
  input: CreateBenefitInput,
): Promise<BenefitDto> {
  const maxDeliveriesPerYear = normalizeMaxDeliveries(
    input.type,
    input.maxDeliveriesPerYear,
  );
  return prisma.$transaction(async (tx) => {
    const created = await createBenefitRecord(
      {
        name: input.name,
        internalDescription: input.internalDescription,
        publicText: input.publicText,
        isPublic: input.isPublic,
        type: input.type,
        audience: input.audience,
        minPaidFeesInYear: input.minPaidFeesInYear,
        maxDeliveriesPerYear,
        suggestedMonth: input.suggestedMonth ?? null,
        requiresMinimumSetup: input.requiresMinimumSetup,
        isActive: input.isActive ?? true,
      },
      tx,
    );
    const after = toBenefitDto(created);
    await createAuditLog(
      {
        userId: actorId,
        entity: 'benefit',
        entityId: created.id,
        action: 'benefit.create',
        detail: { after },
      },
      tx,
    );
    return after;
  });
}

export async function updateBenefit(
  actorId: string,
  id: string,
  input: UpdateBenefitInput,
): Promise<BenefitDto> {
  return prisma.$transaction(async (tx) => {
    const current = await findBenefit(id, tx);
    if (!current) throw new HttpError(404, 'Ese beneficio no existe.');

    const type = input.type ?? current.type;
    const maxDeliveriesPerYear = normalizeMaxDeliveries(
      type,
      input.maxDeliveriesPerYear ?? current.maxDeliveriesPerYear,
    );
    const isPublic = input.isPublic ?? current.isPublic;
    const publicText =
      input.publicText !== undefined ? input.publicText : current.publicText;
    if (isPublic && !publicText) {
      throw new HttpError(
        400,
        'El texto público es obligatorio si el beneficio se muestra en la página.',
      );
    }

    const data: Prisma.BenefitUpdateInput = {
      type,
      maxDeliveriesPerYear,
      isPublic,
      publicText,
    };
    if (input.name !== undefined) data.name = input.name;
    if (input.internalDescription !== undefined) {
      data.internalDescription = input.internalDescription;
    }
    if (input.audience !== undefined) data.audience = input.audience;
    if (input.minPaidFeesInYear !== undefined) {
      data.minPaidFeesInYear = input.minPaidFeesInYear;
    }
    if (input.suggestedMonth !== undefined) data.suggestedMonth = input.suggestedMonth;
    if (input.requiresMinimumSetup !== undefined) {
      data.requiresMinimumSetup = input.requiresMinimumSetup;
    }
    if (input.isActive !== undefined) data.isActive = input.isActive;

    const updated = await updateBenefitRecord(id, data, tx);
    const before = toBenefitDto(current);
    const after = toBenefitDto(updated);
    await createAuditLog(
      {
        userId: actorId,
        entity: 'benefit',
        entityId: id,
        action: 'benefit.update',
        detail: { before, after },
      },
      tx,
    );
    return after;
  });
}
