import { z } from 'zod';

const requiredText = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const descriptionField = z
  .union([z.string().trim().max(400, 'Máximo 400 caracteres.'), z.null()])
  .optional()
  .transform((value) => {
    if (value === undefined) return undefined;
    if (value === null) return null;
    return value.length > 0 ? value : null;
  });

const permissionIdsField = z
  .array(z.string().uuid('Hay un permiso que no es válido.'))
  .transform((ids) => [...new Set(ids)]);

export const createRoleSchema = z.object({
  name: requiredText('El nombre es obligatorio.', 80),
  description: descriptionField,
  isActive: z.boolean().optional(),
  permissionIds: permissionIdsField.optional().transform((ids) => ids ?? []),
});

export const updateRoleSchema = z
  .object({
    name: requiredText('El nombre es obligatorio.', 80).optional(),
    description: descriptionField,
    isActive: z.boolean().optional(),
    permissionIds: permissionIdsField.optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.description !== undefined ||
      value.isActive !== undefined ||
      value.permissionIds !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const roleIdSchema = z.string().uuid('El rol no es válido.');

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
