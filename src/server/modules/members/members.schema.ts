import { z } from 'zod';
import { parseIsoDate } from '@/rules/calendar';

const DOCUMENT_TYPES = ['CC', 'CE', 'PASSPORT', 'PPT'] as const;
const SEXES = ['FEMALE', 'MALE', 'UNSPECIFIED'] as const;
const STATUSES = ['ACTIVE', 'SUSPENDED', 'RETIRED'] as const;

function emptyToNull(value: unknown): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  return text.length > 0 ? text : null;
}

const requiredText = (message: string, max: number) =>
  z
    .string({ error: message })
    .trim()
    .min(1, message)
    .max(max, `Máximo ${max} caracteres.`);

const optionalCreateText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => emptyToNull(value ?? null))
    .refine((value) => value == null || value.length <= max, {
      message: `Máximo ${max} caracteres.`,
    });

const optionalPatchText = (max: number) =>
  z
    .union([z.string(), z.null()])
    .optional()
    .transform((value) => {
      if (value === undefined) return undefined;
      return emptyToNull(value);
    })
    .refine(
      (value) => value === undefined || value == null || value.length <= max,
      { message: `Máximo ${max} caracteres.` },
    );

const isoDateField = (message: string) =>
  z
    .string({ error: message })
    .trim()
    .refine((value) => {
      try {
        parseIsoDate(value);
        return true;
      } catch {
        return false;
      }
    }, message);

const optionalCreateEmail = optionalCreateText(160).refine(
  (value) => value == null || z.string().email().safeParse(value).success,
  { message: 'Escribe un correo válido.' },
);

const optionalPatchEmail = optionalPatchText(160).refine(
  (value) =>
    value === undefined ||
    value == null ||
    z.string().email().safeParse(value).success,
  { message: 'Escribe un correo válido.' },
);

const documentTypeField = z.enum(DOCUMENT_TYPES, {
  error: 'El tipo de documento no es válido.',
});

const sexField = z.enum(SEXES, { error: 'El sexo no es válido.' });

const statusField = z.enum(STATUSES, { error: 'El estado no es válido.' });

const profileIdField = z.string().uuid('El perfil no es válido.');

const memberFields = {
  documentType: documentTypeField,
  documentNumber: requiredText('El documento es obligatorio.', 30),
  firstNames: requiredText('Los nombres son obligatorios.', 80),
  lastNames: requiredText('Los apellidos son obligatorios.', 80),
  sex: sexField,
  birthDate: isoDateField('La fecha de nacimiento no es válida.'),
  mobilePhone: requiredText('El celular es obligatorio.', 20),
  phone: optionalCreateText(20),
  email: optionalCreateEmail,
  address: requiredText('La dirección es obligatoria.', 200),
  residenceCity: requiredText('La ciudad de residencia es obligatoria.', 80),
  shirtSize: optionalCreateText(20),
  pantsSize: optionalCreateText(20),
  shoeSize: optionalCreateText(20),
  profileId: profileIdField,
  notes: optionalCreateText(500),
};

export const createMemberSchema = z.object({
  ...memberFields,
  joinedOn: isoDateField('La fecha de afiliación no es válida.').optional(),
  chargeEnrollment: z.boolean().optional(),
});

export const updateMemberSchema = z
  .object({
    documentType: documentTypeField.optional(),
    documentNumber: requiredText('El documento es obligatorio.', 30).optional(),
    firstNames: requiredText('Los nombres son obligatorios.', 80).optional(),
    lastNames: requiredText('Los apellidos son obligatorios.', 80).optional(),
    sex: sexField.optional(),
    birthDate: isoDateField('La fecha de nacimiento no es válida.').optional(),
    mobilePhone: requiredText('El celular es obligatorio.', 20).optional(),
    phone: optionalPatchText(20),
    email: optionalPatchEmail,
    address: requiredText('La dirección es obligatoria.', 200).optional(),
    residenceCity: requiredText('La ciudad de residencia es obligatoria.', 80).optional(),
    shirtSize: optionalPatchText(20),
    pantsSize: optionalPatchText(20),
    shoeSize: optionalPatchText(20),
    joinedOn: isoDateField('La fecha de afiliación no es válida.').optional(),
    profileId: profileIdField.optional(),
    status: statusField.optional(),
    notes: optionalPatchText(500),
  })
  .refine(
    (value) =>
      value.documentType !== undefined ||
      value.documentNumber !== undefined ||
      value.firstNames !== undefined ||
      value.lastNames !== undefined ||
      value.sex !== undefined ||
      value.birthDate !== undefined ||
      value.mobilePhone !== undefined ||
      value.phone !== undefined ||
      value.email !== undefined ||
      value.address !== undefined ||
      value.residenceCity !== undefined ||
      value.shirtSize !== undefined ||
      value.pantsSize !== undefined ||
      value.shoeSize !== undefined ||
      value.joinedOn !== undefined ||
      value.profileId !== undefined ||
      value.status !== undefined ||
      value.notes !== undefined,
    { message: 'No hay cambios para guardar.' },
  );

export const memberIdSchema = z.string().uuid('El afiliado no es válido.');

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberInput = z.infer<typeof updateMemberSchema>;
