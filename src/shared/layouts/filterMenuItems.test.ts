import { describe, expect, it } from 'vitest';
import { filterMenuItemsBySession } from './filterMenuItems';
import type { MenuItem } from '@/types/menu';

const items: MenuItem[] = [
  { text: 'Inicio', url: '/home', status: 'A' },
  { text: 'Privado', url: '/privado', status: 'R' },
  { text: 'Oculto', url: '/oculto', status: 'I' },
  {
    text: 'Grupo',
    status: 'A',
    subItems: [
      { text: 'Hijo público', url: '/grupo/a', status: 'A' },
      { text: 'Hijo restringido', url: '/grupo/r', status: 'R' },
    ],
  },
];

describe('filterMenuItemsBySession', () => {
  it('without a session shows A and hides R and I', () => {
    const visible = filterMenuItemsBySession(items, false);
    expect(visible.map((item) => item.text)).toEqual(['Inicio', 'Grupo']);
    expect(visible[1].subItems?.map((item) => item.text)).toEqual([
      'Hijo público',
    ]);
  });

  it('with a session shows A and R, and still hides I', () => {
    const visible = filterMenuItemsBySession(items, true);
    expect(visible.map((item) => item.text)).toEqual([
      'Inicio',
      'Privado',
      'Grupo',
    ]);
    expect(visible[2].subItems?.map((item) => item.text)).toEqual([
      'Hijo público',
      'Hijo restringido',
    ]);
  });
});
