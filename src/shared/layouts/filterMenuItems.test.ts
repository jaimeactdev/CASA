import { describe, expect, it } from 'vitest';
import { filterMenuItemsBySession } from './filterMenuItems';
import type { MenuItem } from '@/types/menu';

const items: MenuItem[] = [
  { text: 'Inicio', url: '/home', status: 'R' },
  { text: 'Afiliados', url: '/afiliados', status: 'R', permission: 'members.view' },
  { text: 'Parámetros', url: '/parametros', status: 'R', permission: 'settings.view' },
  { text: 'Oculto', url: '/oculto', status: 'I' },
];

describe('filterMenuItemsBySession', () => {
  it('without a session hides restricted items', () => {
    expect(filterMenuItemsBySession(items, false).map((item) => item.text)).toEqual(
      [],
    );
  });

  it('with a session shows only items covered by permissions', () => {
    const visible = filterMenuItemsBySession(items, true, ['members.view']);
    expect(visible.map((item) => item.text)).toEqual(['Inicio', 'Afiliados']);
  });
});
