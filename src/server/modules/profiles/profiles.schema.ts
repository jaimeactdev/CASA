import { z } from 'zod';

const requiredText = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const percentField = z
  .union([z.string(), z.number()])
  .transform((value) => {
    const text =
      typeof value === 'number' ? String(value) : value.trim().replace(',', '.');
    if (/^\d+(\.\d{1,2})?$/.test(text)) {
      const [whole, fraction = ''] = text.split('.');
      return `${whole}.${fraction.padEnd(2, '0')}`;
    }
    return text;
  })
  .refine((value) => /^\d+\.\d{2}$/.test(value), {
    message: 'Usa un porcentaje con hasta dos decimales.',
  })
  .refine((value) => {
    const amount = Number(value);
    return amount > 0 && amount <= 100;
  }, 'El porcentaje debe ser mayor que 0 y máximo 100.');

const benefitIdsField = z
  .array(z.string().uuid('Hay un beneficio que no es válido.'))
  .transform((ids) => [...new Set(ids)]);

export const createProfileSchema = z.object({
  name: requiredText('El nombre es obligatorio.', 80),
  percent: percentField,
  benefitIds: benefitIdsField.optional().transform((ids) => ids ?? []),
  isActive: z.boolean().optional(),
});

export const updateProfileSchema = z
  .object({
    name: requiredText('El nombre es obligatorio.', 80).optional(),
    percent: percentField.optional(),
    benefitIds: benefitIdsField.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.percent !== undefined ||
      value.benefitIds !== undefined ||
      value.isActive !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const profileIdSchema = z.string().uuid('El perfil no es válido.');

export type CreateProfileInput = z.infer<typeof createProfileSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
