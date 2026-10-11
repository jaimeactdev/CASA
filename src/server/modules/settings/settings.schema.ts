import { z } from 'zod';

function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

const requiredText = (message: string, max = 160) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const optionalText = (max = 200) =>
  z
    .union([z.string(), z.null(), z.undefined()])
    .transform(emptyToNull)
    .refine((value) => value == null || value.length <= max, {
      message: `Máximo ${max} caracteres.`,
    });

const decimalText = z
  .union([z.string(), z.number()])
  .transform((value) => {
    const text = typeof value === 'number' ? String(value) : value.trim().replace(',', '.');
    if (/^\d+(\.\d{1,2})?$/.test(text)) {
      const [whole, fraction = ''] = text.split('.');
      return `${whole}.${fraction.padEnd(2, '0')}`;
    }
    return text;
  })
  .refine((value) => /^\d+\.\d{2}$/.test(value), {
    message: 'Usa un número con hasta dos decimales.',
  });

export const updateSettingsSchema = z.object({
  name: requiredText('El nombre es obligatorio.', 160),
  acronym: requiredText('La sigla es obligatoria.', 20),
  serviceCity: requiredText('La ciudad de servicios es obligatoria.', 80),
  phone: optionalText(30),
  contactEmail: optionalText(120).refine(
    (value) => value == null || z.string().email().safeParse(value).success,
    { message: 'Escribe un correo válido.' },
  ),
  address: optionalText(200),
  openingHours: optionalText(200),
  minimumWage: z.coerce
    .number({ error: 'El SMMLV es obligatorio.' })
    .int('El SMMLV va en pesos enteros.')
    .min(0, 'El SMMLV no puede ser negativo.'),
  firstFeeCutoffDay: z.coerce
    .number({ error: 'El día de corte es obligatorio.' })
    .int()
    .min(1, 'El día de corte va de 1 a 28.')
    .max(28, 'El día de corte va de 1 a 28.'),
  firstFeePercent: decimalText.refine((value) => {
    const amount = Number(value);
    return amount >= 1 && amount <= 100;
  }, 'El porcentaje de la primera cuota va de 1 a 100.'),
  graceDays: z.coerce
    .number({ error: 'Los días de holgura son obligatorios.' })
    .int()
    .min(0, 'La holgura va de 0 a 15 días.')
    .max(15, 'La holgura va de 0 a 15 días.'),
  surchargePercent: decimalText.refine((value) => Number(value) >= 0, {
    message: 'El recargo no puede ser negativo.',
  }),
  enrollmentFee: z.coerce
    .number({ error: 'La cuota de ingreso es obligatoria.' })
    .int('La cuota de ingreso va en pesos enteros.')
    .min(0, 'La cuota de ingreso no puede ser negativa.'),
  allowMultiFeePayment: z.boolean({
    error: 'Indica si se pueden pagar varias cuotas a la vez.',
  }),
});

export const createPaymentMethodSchema = z.object({
  name: requiredText('El nombre es obligatorio.', 80),
  sortOrder: z.coerce.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

export const updatePaymentMethodSchema = z
  .object({
    name: requiredText('El nombre es obligatorio.', 80).optional(),
    sortOrder: z.coerce.number().int().min(1).optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.sortOrder !== undefined ||
      value.isActive !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const paymentMethodIdSchema = z.string().uuid('El medio de pago no es válido.');

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
