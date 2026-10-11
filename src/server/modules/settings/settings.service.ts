import 'server-only';

import { Prisma, type PaymentMethod, type Settings } from '@prisma/client';
import { prisma } from '@/server/db/prisma';
import { HttpError } from '@/server/http/errors';
import {
  createAuditLog,
  createPaymentMethodRecord,
  findPaymentMethod,
  findSettings,
  listActiveProfiles,
  listPaymentMethods,
  maxPaymentMethodSortOrder,
  updatePaymentMethodRecord,
  updateSettingsRecord,
} from './settings.repository';
import type {
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
  UpdateSettingsInput,
} from './settings.schema';

export type SettingsDto = {
  id: number;
  name: string;
  acronym: string;
  serviceCity: string;
  phone: string | null;
  contactEmail: string | null;
  address: string | null;
  openingHours: string | null;
  minimumWage: number;
  firstFeeCutoffDay: number;
  firstFeePercent: string;
  graceDays: number;
  surchargePercent: string;
  enrollmentFee: number;
  allowMultiFeePayment: boolean;
  updatedAt: string;
};

export type PaymentMethodDto = {
  id: string;
  name: string;
  isActive: boolean;
  sortOrder: number;
};

export type ProfilePreviewDto = {
  id: string;
  name: string;
  percent: string;
};

export type SettingsPageDto = SettingsDto & {
  paymentMethods: PaymentMethodDto[];
  profiles: ProfilePreviewDto[];
};

export type MoneyFieldChange = {
  minimumWage?: { from: number; to: number };
  surchargePercent?: { from: string; to: string };
};

export function decimalToText(value: Prisma.Decimal): string {
  return value.toFixed(2);
}

export function toSettingsDto(row: Settings): SettingsDto {
  return {
    id: row.id,
    name: row.name,
    acronym: row.acronym,
    serviceCity: row.serviceCity,
    phone: row.phone,
    contactEmail: row.contactEmail,
    address: row.address,
    openingHours: row.openingHours,
    minimumWage: row.minimumWage,
    firstFeeCutoffDay: row.firstFeeCutoffDay,
    firstFeePercent: decimalToText(row.firstFeePercent),
    graceDays: row.graceDays,
    surchargePercent: decimalToText(row.surchargePercent),
    enrollmentFee: row.enrollmentFee,
    allowMultiFeePayment: row.allowMultiFeePayment,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function toPaymentMethodDto(row: PaymentMethod): PaymentMethodDto {
  return {
    id: row.id,
    name: row.name,
    isActive: row.isActive,
    sortOrder: row.sortOrder,
  };
}

export function moneyFieldChanges(
  before: Pick<SettingsDto, 'minimumWage' | 'surchargePercent'>,
  after: Pick<SettingsDto, 'minimumWage' | 'surchargePercent'>,
): MoneyFieldChange {
  const changes: MoneyFieldChange = {};
  if (before.minimumWage !== after.minimumWage) {
    changes.minimumWage = { from: before.minimumWage, to: after.minimumWage };
  }
  if (before.surchargePercent !== after.surchargePercent) {
    changes.surchargePercent = {
      from: before.surchargePercent,
      to: after.surchargePercent,
    };
  }
  return changes;
}

function isUniqueConstraint(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

async function requireSettings() {
  const row = await findSettings();
  if (!row) {
    throw new HttpError(404, 'No hay parámetros configurados.');
  }
  return row;
}

function toProfilePreview(row: {
  id: string;
  name: string;
  percent: Prisma.Decimal;
}): ProfilePreviewDto {
  return {
    id: row.id,
    name: row.name,
    percent: decimalToText(row.percent),
  };
}

export async function getSettingsPage(): Promise<SettingsPageDto> {
  const [settings, paymentMethods, profiles] = await Promise.all([
    requireSettings(),
    listPaymentMethods(false),
    listActiveProfiles(),
  ]);
  return {
    ...toSettingsDto(settings),
    paymentMethods: paymentMethods.map(toPaymentMethodDto),
    profiles: profiles.map(toProfilePreview),
  };
}

export async function getActivePaymentMethods(): Promise<PaymentMethodDto[]> {
  const rows = await listPaymentMethods(true);
  return rows.map(toPaymentMethodDto);
}

export async function updateSettings(
  userId: string,
  input: UpdateSettingsInput,
): Promise<SettingsPageDto> {
  return prisma.$transaction(async (tx) => {
    const current = await findSettings(tx);
    if (!current) {
      throw new HttpError(404, 'No hay parámetros configurados.');
    }

    const updated = await updateSettingsRecord(
      {
        name: input.name,
        acronym: input.acronym,
        serviceCity: input.serviceCity,
        phone: input.phone,
        contactEmail: input.contactEmail,
        address: input.address,
        openingHours: input.openingHours,
        minimumWage: input.minimumWage,
        firstFeeCutoffDay: input.firstFeeCutoffDay,
        firstFeePercent: new Prisma.Decimal(input.firstFeePercent),
        graceDays: input.graceDays,
        surchargePercent: new Prisma.Decimal(input.surchargePercent),
        enrollmentFee: input.enrollmentFee,
        allowMultiFeePayment: input.allowMultiFeePayment,
      },
      tx,
    );

    const before = toSettingsDto(current);
    const after = toSettingsDto(updated);
    await createAuditLog(
      {
        userId,
        entity: 'settings',
        entityId: '1',
        action: 'settings.update',
        detail: {
          before,
          after,
          money: moneyFieldChanges(before, after),
        },
      },
      tx,
    );

    const [paymentMethods, profiles] = await Promise.all([
      listPaymentMethods(false, tx),
      listActiveProfiles(tx),
    ]);
    return {
      ...after,
      paymentMethods: paymentMethods.map(toPaymentMethodDto),
      profiles: profiles.map(toProfilePreview),
    };
  });
}

export async function createPaymentMethod(
  userId: string,
  input: CreatePaymentMethodInput,
): Promise<PaymentMethodDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      const max = await maxPaymentMethodSortOrder(tx);
      const created = await createPaymentMethodRecord(
        {
          name: input.name,
          isActive: input.isActive ?? true,
          sortOrder: input.sortOrder ?? (max._max.sortOrder ?? 0) + 1,
        },
        tx,
      );
      await createAuditLog(
        {
          userId,
          entity: 'payment_method',
          entityId: created.id,
          action: 'payment_method.create',
          detail: { after: toPaymentMethodDto(created) },
        },
        tx,
      );
      return toPaymentMethodDto(created);
    });
  } catch (error) {
    if (isUniqueConstraint(error)) {
      throw new HttpError(409, 'Ya existe un medio de pago con ese nombre.');
    }
    throw error;
  }
}

export async function updatePaymentMethod(
  userId: string,
  id: string,
  input: UpdatePaymentMethodInput,
): Promise<PaymentMethodDto> {
  try {
    return await prisma.$transaction(async (tx) => {
      const current = await findPaymentMethod(id, tx);
      if (!current) {
        throw new HttpError(404, 'Ese medio de pago no existe.');
      }

      const updated = await updatePaymentMethodRecord(
        id,
        {
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
        tx,
      );

      await createAuditLog(
        {
          userId,
          entity: 'payment_method',
          entityId: updated.id,
          action: 'payment_method.update',
          detail: {
            before: toPaymentMethodDto(current),
            after: toPaymentMethodDto(updated),
          },
        },
        tx,
      );
      return toPaymentMethodDto(updated);
    });
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (isUniqueConstraint(error)) {
      throw new HttpError(409, 'Ya existe un medio de pago con ese nombre.');
    }
    throw error;
  }
}
