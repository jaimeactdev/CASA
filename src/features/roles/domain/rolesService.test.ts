import { describe, expect, it } from 'vitest';
import { groupPermissions, validateRoleForm } from './rolesTypes';

describe('validateRoleForm', () => {
  it('requires a name and allows a role without permissions', () => {
    expect(
      validateRoleForm({ name: '  ', description: '', permissionIds: [] }).name,
    ).toMatch(/obligatorio/);
    expect(
      validateRoleForm({ name: 'Caja', description: '', permissionIds: [] }),
    ).toEqual({});
  });
});

describe('groupPermissions', () => {
  it('groups claims by module using the screen labels', () => {
    const groups = groupPermissions([
      { id: '1', key: 'roles.view', module: 'roles', label: 'Ver roles' },
      { id: '2', key: 'members.view', module: 'members', label: 'Ver afiliados' },
      { id: '3', key: 'members.create', module: 'members', label: 'Crear afiliados' },
    ]);
    expect(groups.map((group) => group.label)).toEqual(['Afiliados', 'Roles']);
    expect(groups[0]?.items.map((item) => item.key)).toEqual([
      'members.view',
      'members.create',
    ]);
  });
});
