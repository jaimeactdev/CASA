import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email('Escribe un correo válido.')
    .transform((value) => value.toLowerCase()),
  password: z.string().min(1, 'La clave es obligatoria.'),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'La clave actual es obligatoria.'),
    newPassword: z
      .string()
      .min(8, 'La clave nueva debe tener al menos 8 caracteres.'),
  })
  .refine((value) => value.currentPassword !== value.newPassword, {
    message: 'La clave nueva debe ser distinta de la actual.',
    path: ['newPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
