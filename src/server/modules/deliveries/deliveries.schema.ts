import { z } from 'zod';
import { parseIsoDate } from '@/rules/calendar';

const uuid = (message: string) => z.string().uuid(message);

const isoDate = z
  .string({ error: 'La fecha de entrega no es válida.' })
  .trim()
  .refine((value) => {
    try {
      parseIsoDate(value);
      return true;
    } catch {
      return false;
    }
  }, 'La fecha de entrega no es válida.');

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

const yearField = z.coerce
  .number({ error: 'El año no es válido.' })
  .int()
  .min(2000, 'El año no es válido.')
  .max(2100, 'El año no es válido.');

export const deliveriesQuerySchema = z.object({
  year: yearField.optional(),
  benefitId: uuid('El beneficio no es válido.').optional(),
  memberId: uuid('El afiliado no es válido.').optional(),
});

export const deliverBenefitSchema = z.object({
  memberId: uuid('El afiliado no es válido.'),
  benefitId: uuid('El beneficio no es válido.'),
  deliveredOn: isoDate,
  note: optionalNote,
});

export const voidDeliverySchema = z.object({
  note: z
    .string({ error: 'La nota es obligatoria.' })
    .trim()
    .min(1, 'La nota es obligatoria.')
    .max(500, 'Máximo 500 caracteres.'),
});

export const deliveryIdSchema = uuid('La entrega no es válida.');

export type DeliveriesQuery = z.infer<typeof deliveriesQuerySchema>;
export type DeliverBenefitInput = z.infer<typeof deliverBenefitSchema>;
export type VoidDeliveryInput = z.infer<typeof voidDeliverySchema>;
