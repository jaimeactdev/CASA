import { z } from 'zod';
import { parseIsoDate } from '@/rules/calendar';

const uuid = (message: string) => z.string().uuid(message);

const isoDate = z
  .string({ error: 'La fecha de pago no es válida.' })
  .trim()
  .refine((value) => {
    try {
      parseIsoDate(value);
      return true;
    } catch {
      return false;
    }
  }, 'La fecha de pago no es válida.');

const optionalNote = z
  .union([z.string(), z.null()])
  .optional()
  .transform((value) => {
    if (value == null) return null;
    const text = value.trim();
    return text.length > 0 ? text : null;
  })
  .refine((value) => value == null || value.length <= 500, {
    message: 'Máximo 500 caracteres.',
  });

export const feesQuerySchema = z.object({
  year: z.coerce
    .number({ error: 'El año no es válido.' })
    .int()
    .min(2000, 'El año no es válido.')
    .max(2100, 'El año no es válido.')
    .optional(),
});

export const payFeesSchema = z.object({
  feeIds: z
    .array(uuid('La cuota no es válida.'))
    .min(1, 'Selecciona al menos una cuota.')
    .max(120, 'Son demasiadas cuotas en un solo pago.')
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Hay cuotas repetidas.',
    }),
  paymentMethodId: uuid('El medio de pago no es válido.'),
  paidOn: isoDate,
  paymentNote: optionalNote,
});

export const revertFeeSchema = z.object({
  note: z
    .string({ error: 'La nota es obligatoria.' })
    .trim()
    .min(1, 'La nota es obligatoria.')
    .max(500, 'Máximo 500 caracteres.'),
});

export const feeIdSchema = uuid('La cuota no es válida.');

export type FeesQuery = z.infer<typeof feesQuerySchema>;
export type PayFeesInput = z.infer<typeof payFeesSchema>;
export type RevertFeeInput = z.infer<typeof revertFeeSchema>;
