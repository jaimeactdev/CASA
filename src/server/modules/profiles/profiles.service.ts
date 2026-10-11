import 'server-only';

import { Prisma } from '@prisma/client';
import { quoteFullFee } from '@/rules/fees';
import { toPercentHundredths } from '@/rules/money';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  createAuditLog,
  createProfileRecord,
  findBenefitsByIds,
  findMinimumWage,
  findProfile,
  listBenefitOptions,
  listProfiles,
  replaceProfileBenefits,
  updateProfileRecord,
  type DbClient,
} from './profiles.repository';
import type { CreateProfileInput, UpdateProfileInput } from './profiles.schema';

export type BenefitOptionDto = {
  id: string;
  name: string;
  isActive: boolean;
};

export type ProfileDto = {
  id: string;
  name: string;
  percent: string;
  isActive: boolean;
  benefitIds: string[];
  benefitNames: string[];
  fullFee: number;
};

export type ProfilesPageDto = {
  minimumWage: number;
  profiles: ProfileDto[];
  benefits: BenefitOptionDto[];
};

type ProfileRow = {
  id: string;
  name: string;
  percent: Prisma.Decimal;
  isActive: boolean;
  benefits: { benefitId: string; benefit: { id: string; name: string } }[];
};

export function profileFullFee(minimumWage: number, percentText: string): number {
  if (minimumWage <= 0) return 0;
  return quoteFullFee(minimumWage, toPercentHundredths(percentText));
}

export function toProfileDto(row: ProfileRow, minimumWage: number): ProfileDto {
  const percent = row.percent.toFixed(2);
  const links = [...row.benefits].sort((left, right) =>
    left.benefit.name.localeCompare(right.benefit.name, 'es'),
  );
  return {
    id: row.id,
    name: row.name,
    percent,
    isActive: row.isActive,
    benefitIds: links.map((item) => item.benefitId).sort(),
    benefitNames: links.map((item) => item.benefit.name),
    fullFee: profileFullFee(minimumWage, percent),
  };
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function write<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isUniqueConstraint(error)) {
      throw new HttpError(409, 'Ya existe un perfil con ese nombre.');
    }
    throw error;
  }
}

async function assertBenefitsExist(ids: string[], db: DbClient) {
  if (ids.length === 0) return;
  const found = await findBenefitsByIds(ids, db);
  if (found.length !== ids.length) {
    throw new HttpError(400, 'Hay beneficios que no existen.');
  }
}

async function wageOf(db: DbClient): Promise<number> {
  const settings = await findMinimumWage(db);
  return settings?.minimumWage ?? 0;
}

export async function getProfilesPage(): Promise<ProfilesPageDto> {
  const [settingsWage, profiles, benefits] = await Promise.all([
    findMinimumWage(),
    listProfiles(),
    listBenefitOptions(),
  ]);
  const minimumWage = settingsWage?.minimumWage ?? 0;
  return {
    minimumWage,
    profiles: profiles.map((row) => toProfileDto(row, minimumWage)),
    benefits,
  };
}

export async function createProfile(
  actorId: string,
  input: CreateProfileInput,
): Promise<ProfileDto> {
  return write(() =>
    prisma.$transaction(async (tx) => {
      await assertBenefitsExist(input.benefitIds, tx);
      const created = await createProfileRecord(
        {
          name: input.name,
          percent: new Prisma.Decimal(input.percent),
          isActive: input.isActive ?? true,
        },
        tx,
      );
      await replaceProfileBenefits(created.id, input.benefitIds, tx);
      const fresh = await findProfile(created.id, tx);
      if (!fresh) throw new HttpError(404, 'Ese perfil no existe.');
      const after = toProfileDto(fresh, await wageOf(tx));
      await createAuditLog(
        {
          userId: actorId,
          entity: 'profile',
          entityId: created.id,
          action: 'profile.create',
          detail: { after },
        },
        tx,
      );
      return after;
    }),
  );
}

export async function updateProfile(
  actorId: string,
  id: string,
  input: UpdateProfileInput,
): Promise<ProfileDto> {
  return write(() =>
    prisma.$transaction(async (tx) => {
      const current = await findProfile(id, tx);
      if (!current) throw new HttpError(404, 'Ese perfil no existe.');
      if (input.benefitIds) await assertBenefitsExist(input.benefitIds, tx);

      const data: Prisma.MembershipProfileUpdateInput = {};
      if (input.name !== undefined) data.name = input.name;
      if (input.percent !== undefined) data.percent = new Prisma.Decimal(input.percent);
      if (input.isActive !== undefined) data.isActive = input.isActive;
      if (Object.keys(data).length > 0) {
        await updateProfileRecord(id, data, tx);
      }
      if (input.benefitIds) {
        await replaceProfileBenefits(id, input.benefitIds, tx);
      }

      const fresh = await findProfile(id, tx);
      if (!fresh) throw new HttpError(404, 'Ese perfil no existe.');
      const wage = await wageOf(tx);
      const before = toProfileDto(current, wage);
      const after = toProfileDto(fresh, wage);
      await createAuditLog(
        {
          userId: actorId,
          entity: 'profile',
          entityId: id,
          action: 'profile.update',
          detail: { before, after },
        },
        tx,
      );
      return after;
    }),
  );
}
