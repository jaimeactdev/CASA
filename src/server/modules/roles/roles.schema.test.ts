import { describe, expect, it } from 'vitest';
import { createRoleSchema, updateRoleSchema } from './roles.schema';

const permissionId = '22222222-2222-4222-8222-222222222222';

describe('createRoleSchema', () => {
  it('trims the name, clears a blank description and dedupes permissions', () => {
    expect(
      createRoleSchema.parse({
        name: '  Tesorería  ',
        description: '   ',
        permissionIds: [permissionId, permissionId],
      }),
    ).toEqual({
      name: 'Tesorería',
      description: null,
      permissionIds: [permissionId],
    });
  });

  it('rejects an empty name', () => {
    expect(createRoleSchema.safeParse({ name: '  ' }).success).toBe(false);
  });
});

describe('updateRoleSchema', () => {
  it('keeps omitted permissions out of the patch', () => {
    expect(updateRoleSchema.parse({ name: 'Caja' })).toEqual({ name: 'Caja' });
  });

  it('rejects an empty patch', () => {
    expect(updateRoleSchema.safeParse({}).success).toBe(false);
  });
});
