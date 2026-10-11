import { describe, expect, it } from 'vitest';
import { EMPTY_PERMISSIONS, selectUserPermissions } from './userPermissions';

describe('selectUserPermissions', () => {
  it('returns the same empty array when the user has no permissions', () => {
    expect(selectUserPermissions({ user: null })).toBe(EMPTY_PERMISSIONS);
    expect(selectUserPermissions({ user: { name: 'Ana' } })).toBe(EMPTY_PERMISSIONS);
  });

  it('returns the stored permissions reference when present', () => {
    const permissions = ['settings.edit'];
    expect(selectUserPermissions({ user: { permissions } })).toBe(permissions);
  });
});
