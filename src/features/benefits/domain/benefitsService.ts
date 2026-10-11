import { BenefitsRepository } from '../data/repositories/BenefitsRepository';
import {
  emptyBenefitForm,
  mapBenefit,
  toBenefitPayload,
  validateBenefitForm,
  type AudienceCode,
  type BenefitFormErrors,
  type BenefitFormValues,
  type BenefitPayload,
  type BenefitRecord,
  type BenefitTypeCode,
} from './benefitsTypes';

function asRecord(payload: unknown): Record<string, unknown> {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!body || typeof body !== 'object' || Array.isArray(body)) return {};
  return body as Record<string, unknown>;
}

function asList(payload: unknown): Record<string, unknown>[] {
  const body = (payload as { data?: unknown } | null)?.data ?? payload;
  if (!Array.isArray(body)) return [];
  return body.filter(
    (item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object',
  );
}

function text(value: unknown): string {
  if (value == null) return '';
  return String(value);
}

function asType(value: unknown): BenefitTypeCode {
  return value === 'EVENTUAL' ? 'EVENTUAL' : 'ANNUAL';
}

function asAudience(value: unknown): AudienceCode {
  if (value === 'FEMALE' || value === 'MALE') return value;
  return 'ALL';
}

export function toBenefit(row: Record<string, unknown>): BenefitRecord | null {
  if (typeof row.id !== 'string' || typeof row.name !== 'string') return null;
  return mapBenefit({
    id: row.id,
    name: row.name,
    internalDescription: text(row.internalDescription),
    publicText: row.publicText == null ? null : text(row.publicText),
    isPublic: row.isPublic === true,
    type: asType(row.type),
    audience: asAudience(row.audience),
    minPaidFeesInYear: Number(row.minPaidFeesInYear ?? 0),
    maxDeliveriesPerYear: Number(row.maxDeliveriesPerYear ?? 1),
    suggestedMonth:
      row.suggestedMonth == null || row.suggestedMonth === ''
        ? null
        : Number(row.suggestedMonth),
    requiresMinimumSetup: row.requiresMinimumSetup === true,
    isActive: row.isActive === true,
  });
}

export function toBenefits(payload: unknown): BenefitRecord[] {
  return asList(payload).flatMap((row) => {
    const mapped = toBenefit(row);
    return mapped ? [mapped] : [];
  });
}

export class BenefitsService {
  constructor(private readonly repo = new BenefitsRepository()) {}

  createEmptyForm() {
    return emptyBenefitForm();
  }

  async load(): Promise<BenefitRecord[]> {
    return toBenefits(await this.repo.getBenefits());
  }

  prepareSave(
    values: BenefitFormValues,
  ): { ok: false; errors: BenefitFormErrors } | { ok: true; payload: BenefitPayload } {
    const errors = validateBenefitForm(values);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    return { ok: true, payload: toBenefitPayload(values) };
  }

  async create(payload: BenefitPayload): Promise<BenefitRecord> {
    const mapped = toBenefit(asRecord(await this.repo.createBenefit(payload)));
    if (!mapped) throw new Error('No pudimos leer el beneficio creado.');
    return mapped;
  }

  async update(
    id: string,
    payload: BenefitPayload | { isActive: boolean },
  ): Promise<BenefitRecord> {
    const mapped = toBenefit(asRecord(await this.repo.updateBenefit(id, payload)));
    if (!mapped) throw new Error('No pudimos leer el beneficio actualizado.');
    return mapped;
  }
}
