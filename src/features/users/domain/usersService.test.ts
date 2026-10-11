import { describe, expect, it } from 'vitest';
import {
  isSelfAdminLock,
  SYSTEM_ADMIN_ROLE_NAME,
  toRoleSelectOptions,
  validatePasswordReset,
  validateUserForm,
} from './usersTypes';

const active = {
  id: 'role-a',
  name: 'Operativo',
  isActive: true,
  isSystem: true,
};
const inactive = {
  id: 'role-b',
  name: 'Antiguo',
  isActive: false,
  isSystem: false,
};

describe('validateUserForm', () => {
  it('requires a password only when creating', () => {
    const values = {
      name: 'Ana',
      email: 'ana@casa.test',
      roleId: 'role-a',
      password: '',
      confirmPassword: '',
    };
    expect(validateUserForm(values, 'edit')).toEqual({});
    expect(validateUserForm(values, 'create').password).toMatch(/8/);
  });

  it('rejects a mismatched confirmation', () => {
    expect(
      validatePasswordReset({
        password: 'clave123',
        confirmPassword: 'clave124',
      }).confirmPassword,
    ).toMatch(/no coincide/);
  });
});

describe('toRoleSelectOptions', () => {
  it('keeps the current inactive role and hides the other inactive ones', () => {
    const labels = toRoleSelectOptions([active, inactive], inactive.id).map(
      (option) => option.label,
    );
    expect(labels).toEqual(['Antiguo (inactivo)', 'Operativo']);
    expect(
      toRoleSelectOptions([active, inactive]).map((option) => option.value),
    ).toEqual([active.id]);
  });
});

describe('isSelfAdminLock', () => {
  it('locks only the signed-in system administrator', () => {
    const admin = {
      id: 'me',
      roleName: SYSTEM_ADMIN_ROLE_NAME,
      roleIsSystem: true,
    };
    expect(isSelfAdminLock(admin, 'me')).toBe(true);
    expect(isSelfAdminLock(admin, 'other')).toBe(false);
    expect(
      isSelfAdminLock({ ...admin, roleName: 'Operativo' }, 'me'),
    ).toBe(false);
  });
});
