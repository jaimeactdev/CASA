import { z } from 'zod';

const requiredText = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const emailField = z
  .string({ error: 'El correo es obligatorio.' })
  .trim()
  .min(1, 'El correo es obligatorio.')
  .max(160, 'Máximo 160 caracteres.')
  .email('Escribe un correo válido.')
  .transform((value) => value.toLowerCase());

const passwordField = z
  .string({ error: 'La clave es obligatoria.' })
  .min(8, 'La clave debe tener al menos 8 caracteres.')
  .max(72, 'La clave admite hasta 72 caracteres.');

const roleIdField = z.string().uuid('El rol no es válido.');

export const createUserSchema = z.object({
  name: requiredText('El nombre es obligatorio.', 120),
  email: emailField,
  password: passwordField,
  roleId: roleIdField,
  isActive: z.boolean().optional(),
});

export const updateUserSchema = z
  .object({
    name: requiredText('El nombre es obligatorio.', 120).optional(),
    email: emailField.optional(),
    password: passwordField.optional(),
    roleId: roleIdField.optional(),
    isActive: z.boolean().optional(),
  })
  .refine(
    (value) =>
      value.name !== undefined ||
      value.email !== undefined ||
      value.password !== undefined ||
      value.roleId !== undefined ||
      value.isActive !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const userIdSchema = z.string().uuid('El usuario no es válido.');

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
