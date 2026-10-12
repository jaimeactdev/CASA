import { FeesRepository } from '../data/repositories/FeesRepository';
import {
  emptyPayForm,
  mapFeeFromUnknown,
  toPayPayload,
  validatePayForm,
  validateRevertNote,
  type FeeRecord,
  type PayFeesPayload,
  type PayFormErrors,
  type PayFormValues,
  type PaymentMethodOption,
  type RevertFeePayload,
} from './feesTypes';

export type FeesPage = {
  today: string;
  year: number;
  minimumWage: number;
  allowMultiFeePayment: boolean;
  surchargePercent: string;
  paymentMethods: PaymentMethodOption[];
  fees: FeeRecord[];
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

export function toFeesPage(payload: unknown): FeesPage {
  const body = asRecord(payload);
  const fees = Array.isArray(body.fees)
    ? body.fees.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const mapped = mapFeeFromUnknown(item as Record<string, unknown>);
        return mapped ? [mapped] : [];
      })
    : [];
  const paymentMethods = Array.isArray(body.paymentMethods)
    ? body.paymentMethods.flatMap((item) => {
        if (!item || typeof item !== 'object') return [];
        const row = item as Record<string, unknown>;
        if (typeof row.id !== 'string' || typeof row.name !== 'string') return [];
        return [{ id: row.id, name: row.name }];
      })
    : [];
  return {
    today: text(body.today),
    year: Number(body.year ?? 0),
    minimumWage: Number(body.minimumWage ?? 0),
    allowMultiFeePayment: body.allowMultiFeePayment !== false,
    surchargePercent: text(body.surchargePercent || '0.00'),
    paymentMethods,
    fees,
  };
}

export class FeesService {
  constructor(private readonly repo = new FeesRepository()) {}

  createEmptyPayForm(today: string) {
    return emptyPayForm(today);
  }

  async load(year?: number): Promise<FeesPage> {
    return toFeesPage(await this.repo.getFees(year));
  }

  preparePay(
    values: PayFormValues,
    today: string,
    feeIds: string[],
  ):
    | { ok: false; errors: PayFormErrors }
    | { ok: true; payload: PayFeesPayload } {
    const errors = validatePayForm(values, today);
    if (Object.keys(errors).length > 0) return { ok: false, errors };
    if (feeIds.length === 0) {
      return {
        ok: false,
        errors: { paymentMethodId: 'Selecciona al menos una cuota.' },
      };
    }
    return { ok: true, payload: toPayPayload(values, feeIds) };
  }

  prepareRevert(note: string): { ok: false; error: string } | { ok: true; payload: RevertFeePayload } {
    const error = validateRevertNote(note);
    if (error) return { ok: false, error };
    return { ok: true, payload: { note: note.trim() } };
  }

  async pay(payload: PayFeesPayload): Promise<void> {
    await this.repo.payFees(payload);
  }

  async revert(id: string, payload: RevertFeePayload): Promise<void> {
    await this.repo.revertFee(id, payload);
  }
}
