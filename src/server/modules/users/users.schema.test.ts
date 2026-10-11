import { describe, expect, it } from 'vitest';
import { createUserSchema, updateUserSchema } from './users.schema';

const roleId = '11111111-1111-4111-8111-111111111111';

describe('createUserSchema', () => {
  it('lowercases the email and accepts a password of 8 characters', () => {
    expect(
      createUserSchema.parse({
        name: '  Ana Pérez  ',
        email: 'Ana@Casa.Test',
        password: 'clave123',
        roleId,
      }),
    ).toMatchObject({
      name: 'Ana Pérez',
      email: 'ana@casa.test',
      password: 'clave123',
      roleId,
    });
  });

  it('rejects a short password and an invalid email', () => {
    expect(
      createUserSchema.safeParse({
        name: 'Ana',
        email: 'ana@casa.test',
        password: 'corta',
        roleId,
      }).success,
    ).toBe(false);
    expect(
      createUserSchema.safeParse({
        name: 'Ana',
        email: 'no-es-correo',
        password: 'clave123',
        roleId,
      }).success,
    ).toBe(false);
  });
});

describe('updateUserSchema', () => {
  it('accepts a password assignment on its own', () => {
    expect(updateUserSchema.parse({ password: 'nueva123' })).toEqual({
      password: 'nueva123',
    });
  });

  it('rejects an empty patch', () => {
    expect(updateUserSchema.safeParse({}).success).toBe(false);
  });
});
