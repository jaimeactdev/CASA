import { quoteFullFee } from '@/rules/fees';
import { applyPercent, toPercentHundredths } from '@/rules/money';
import { SettingsRepository } from '../data/repositories/SettingsRepository';
import {
  emptyPaymentMethodValues,
  emptySettingsValues,
  formatPercentLabel,
  mapPaymentMethod,
  moneyConfirmation,
  toSettingsPayload,
  validatePaymentMethod,
  validateSettings,
  type MoneyConfirmation,
  type PaymentMethodRecord,
  type PaymentMethodValues,
  type ProfilePreview,
  type SettingsErrors,
  type SettingsPayload,
  type SettingsRecord,
  type SettingsValues,
} from './settingsTypes';

export type SettingsPage = {
  settings: SettingsRecord;
  paymentMethods: PaymentMethodRecord[];
  profiles: ProfilePreview[];
};

export type ProfileFeePreview = {
  name: string;
  percentLabel: string;
  fullFee: number;
  firstReducedFee: number;
};

export type SettingsFeePreview = {
  wage: number;
  cutoffDay: number;
  surchargePerMonth: number;
  enrollmentFee: number;
  profiles: ProfileFeePreview[];
};

export type SettingsSaveResult =
  | { ok: true; page: SettingsPage; confirmation?: undefined }
  | { ok: false; errors: SettingsErrors };

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object') return {};
  return body as Record<string, unknown>;
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function toSettingsRecord(row: Record<string, unknown>): SettingsRecord {
  return {
    id: Number(row.id ?? 1),
    name: text(row.name),
    acronym: text(row.acronym),
    serviceCity: text(row.serviceCity),
    phone: text(row.phone),
    contactEmail: text(row.contactEmail),
    address: text(row.address),
    openingHours: text(row.openingHours),
    minimumWage: text(row.minimumWage || 0),
    firstFeeCutoffDay: text(row.firstFeeCutoffDay || 15),
    firstFeePercent: text(row.firstFeePercent || '50.00'),
    graceDays: text(row.graceDays || 0),
    surchargePercent: text(row.surchargePercent || '0.00'),
    enrollmentFee: text(row.enrollmentFee || 0),
    allowMultiFeePayment: row.allowMultiFeePayment !== false,
    updatedAt: text(row.updatedAt),
  };
}

function toPaymentMethods(value: unknown): PaymentMethodRecord[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || typeof row.name !== 'string') return [];
    return [
      mapPaymentMethod({
        id: row.id,
        name: row.name,
        isActive: row.isActive === true,
        sortOrder: Number(row.sortOrder ?? 0),
      }),
    ];
  });
}

function toProfiles(value: unknown): ProfilePreview[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!item || typeof item !== 'object') return [];
    const row = item as Record<string, unknown>;
    if (typeof row.id !== 'string' || typeof row.name !== 'string') return [];
    return [{ id: row.id, name: row.name, percent: text(row.percent || '0') }];
  });
}

function toPage(payload: unknown): SettingsPage {
  const row = asRecord(payload);
  return {
    settings: toSettingsRecord(row),
    paymentMethods: toPaymentMethods(row.paymentMethods),
    profiles: toProfiles(row.profiles),
  };
}

function digitsFrom(value: string): number {
  const parsed = Number(value.trim().replace(/\./g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
}

function percentOr(value: string, fallback: string): ReturnType<typeof toPercentHundredths> {
  try {
    return toPercentHundredths(value.trim().replace(',', '.'));
  } catch {
    return toPercentHundredths(fallback);
  }
}

export function buildFeePreview(
  values: SettingsValues,
  profiles: ProfilePreview[],
): SettingsFeePreview {
  const wage = digitsFrom(values.minimumWage);
  const firstHundredths = percentOr(values.firstFeePercent, '50');
  const surchargeHundredths = percentOr(values.surchargePercent, '0');
  const cutoffDay = digitsFrom(values.firstFeeCutoffDay) || 15;

  return {
    wage,
    cutoffDay,
    surchargePerMonth: wage > 0 ? applyPercent(wage, surchargeHundredths) : 0,
    enrollmentFee: digitsFrom(values.enrollmentFee),
    profiles:
      wage <= 0
        ? []
        : profiles.map((profile) => {
            const fullFee = quoteFullFee(
              wage,
              percentOr(profile.percent, '0'),
            );
            return {
              name: profile.name,
              percentLabel: formatPercentLabel(profile.percent),
              fullFee,
              firstReducedFee: applyPercent(fullFee, firstHundredths),
            };
          }),
  };
}

export class SettingsService {
  constructor(private readonly repo = new SettingsRepository()) {}

  createEmpty() {
    return emptySettingsValues();
  }

  createEmptyPaymentMethod() {
    return emptyPaymentMethodValues();
  }

  async load(): Promise<SettingsPage> {
    return toPage(await this.repo.getSettings());
  }

  prepareSave(
    values: SettingsValues,
    saved: SettingsValues | null,
  ):
    | { ok: false; errors: SettingsErrors }
    | { ok: true; payload: SettingsPayload; confirmation: MoneyConfirmation | null } {
    const errors = validateSettings(values);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }
    const payload = toSettingsPayload(values);
    const confirmation = saved
      ? moneyConfirmation(toSettingsPayload(saved), payload)
      : null;
    return { ok: true, payload, confirmation };
  }

  async save(payload: SettingsPayload): Promise<SettingsSaveResult> {
    const page = toPage(await this.repo.updateSettings(payload));
    return { ok: true, page };
  }

  async createPaymentMethod(
    values: PaymentMethodValues,
  ): Promise<
    | { ok: false; errors: ReturnType<typeof validatePaymentMethod> }
    | { ok: true; method: PaymentMethodRecord }
  > {
    const errors = validatePaymentMethod(values);
    if (Object.keys(errors).length > 0) {
      return { ok: false, errors };
    }
    const sortOrder = values.sortOrder.trim()
      ? Number(values.sortOrder.trim().replace(/\./g, ''))
      : undefined;
    const response = await this.repo.createPaymentMethod({
      name: values.name.trim(),
      ...(sortOrder ? { sortOrder } : {}),
    });
    const row = asRecord(response);
    return {
      ok: true,
      method: mapPaymentMethod({
        id: String(row.id),
        name: String(row.name),
        isActive: row.isActive !== false,
        sortOrder: Number(row.sortOrder ?? 0),
      }),
    };
  }

  async updatePaymentMethod(
    id: string,
    payload: { name?: string; sortOrder?: number; isActive?: boolean },
  ): Promise<PaymentMethodRecord> {
    const row = asRecord(await this.repo.updatePaymentMethod(id, payload));
    return mapPaymentMethod({
      id: String(row.id),
      name: String(row.name),
      isActive: row.isActive === true,
      sortOrder: Number(row.sortOrder ?? 0),
    });
  }
}
