import { z } from 'zod';

const requiredText = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const optionalText = z
  .union([z.string().trim().max(500, 'Máximo 500 caracteres.'), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return value.length > 0 ? value : null;
  });

const benefitType = z.enum(['ANNUAL', 'EVENTUAL'], {
  error: 'El tipo no es válido.',
});

const benefitAudience = z.enum(['ALL', 'FEMALE', 'MALE'], {
  error: 'El público objetivo no es válido.',
});

const suggestedMonth = z
  .union([z.null(), z.coerce.number().int().min(1).max(12)])
  .optional()
  .transform((value) => (value === undefined ? undefined : value));

const benefitFields = {
  name: requiredText('El nombre es obligatorio.', 120),
  internalDescription: requiredText('La descripción interna es obligatoria.', 500),
  publicText: optionalText,
  isPublic: z.boolean({ error: 'Indica si se muestra en la página pública.' }),
  type: benefitType,
  audience: benefitAudience,
  minPaidFeesInYear: z.coerce
    .number({ error: 'El mínimo de cuotas es obligatorio.' })
    .int()
    .min(0, 'El mínimo de cuotas no puede ser negativo.'),
  maxDeliveriesPerYear: z.coerce
    .number({ error: 'El máximo al año es obligatorio.' })
    .int(),
  suggestedMonth,
  requiresMinimumSetup: z.boolean({
    error: 'Indica si hay que configurar el mínimo antes de entregar.',
  }),
  isActive: z.boolean().optional(),
};

function normalizeBenefit<T extends { type: 'ANNUAL' | 'EVENTUAL'; maxDeliveriesPerYear: number; publicText?: string | null }>(
  value: T,
): T {
  return {
    ...value,
    maxDeliveriesPerYear: value.type === 'ANNUAL' ? 1 : value.maxDeliveriesPerYear,
    publicText: value.publicText ?? null,
  };
}

function checkBenefitRules(
  value: {
    isPublic: boolean;
    publicText?: string | null;
    type: 'ANNUAL' | 'EVENTUAL';
    maxDeliveriesPerYear: number;
  },
  ctx: z.RefinementCtx,
) {
  if (value.isPublic && !value.publicText) {
    ctx.addIssue({
      code: 'custom',
      message: 'El texto público es obligatorio si el beneficio se muestra en la página.',
      path: ['publicText'],
    });
  }
  if (
    value.type === 'EVENTUAL' &&
    (value.maxDeliveriesPerYear < 1 || value.maxDeliveriesPerYear > 12)
  ) {
    ctx.addIssue({
      code: 'custom',
      message: 'Un beneficio eventual permite de 1 a 12 entregas al año.',
      path: ['maxDeliveriesPerYear'],
    });
  }
}

export const createBenefitSchema = z
  .object(benefitFields)
  .superRefine(checkBenefitRules)
  .transform(normalizeBenefit);

export const updateBenefitSchema = z
  .object({
    name: benefitFields.name.optional(),
    internalDescription: benefitFields.internalDescription.optional(),
    publicText: optionalText,
    isPublic: z.boolean().optional(),
    type: benefitType.optional(),
    audience: benefitAudience.optional(),
    minPaidFeesInYear: benefitFields.minPaidFeesInYear.optional(),
    maxDeliveriesPerYear: z.coerce.number().int().optional(),
    suggestedMonth,
    requiresMinimumSetup: z.boolean().optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.internalDescription !== undefined ||
      value.publicText !== undefined ||
      value.isPublic !== undefined ||
      value.type !== undefined ||
      value.audience !== undefined ||
      value.minPaidFeesInYear !== undefined ||
      value.maxDeliveriesPerYear !== undefined ||
      value.suggestedMonth !== undefined ||
      value.requiresMinimumSetup !== undefined ||
      value.isActive !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const benefitIdSchema = z.string().uuid('El beneficio no es válido.');

export type CreateBenefitInput = z.infer<typeof createBenefitSchema>;
export type UpdateBenefitInput = z.infer<typeof updateBenefitSchema>;
