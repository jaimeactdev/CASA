import { DeliveriesRepository } from '../data/repositories/DeliveriesRepository';
import {
  mapDelivery,
  validateVoidNote,
  type BenefitOption,
  type DeliveryRecord,
  type VoidDeliveryPayload,
} from './deliveriesTypes';

export type DeliveriesPage = {
  today: string;
  year: number;
  benefits: BenefitOption[];
  deliveries: DeliveryRecord[];
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

export function toDeliveriesPage(payload: unknown): DeliveriesPage {
  const body = asRecord(payload);
  const benefits = Array.isArray(body.benefits)
    ? body.benefits.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        if (typeof row.id !== 'string' || typeof row.name !== 'string') return [];
        return [{ id: row.id, name: row.name }];
      })
    : [];
  const deliveries = Array.isArray(body.deliveries)
    ? body.deliveries.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = mapDelivery(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  return {
    today: text(body.today),
    year: Number(body.year ?? 0),
    benefits,
    deliveries,
  };
}

export class DeliveriesService {
  constructor(private readonly repo = new DeliveriesRepository()) {}

  async load(year?: number): Promise<DeliveriesPage> {
    return toDeliveriesPage(await this.repo.getDeliveries(year));
  }

  prepareVoid(note: string):
    | { ok: false; error: string }
    | { ok: true; payload: VoidDeliveryPayload } {
    const error = validateVoidNote(note);
    if (error) return { ok: false, error };
    return { ok: true, payload: { note: note.trim() } };
  }

  async voidDelivery(id: string, payload: VoidDeliveryPayload): Promise<void> {
    await this.repo.voidDelivery(id, payload);
  }
}
