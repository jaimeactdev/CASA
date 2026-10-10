import type { MenuItem } from '@/types/menu';

/**
 * Visible: `A` always; `R` only with a session; `I` never.
 */
export function filterMenuItemsBySession(
  items: MenuItem[],
  hasSession: boolean,
): MenuItem[] {
  return items.flatMap((item) => {
    if (item.status === 'I') return [];
    if (item.status === 'R' && !hasSession) return [];

    const subItems = item.subItems
      ? filterMenuItemsBySession(item.subItems, hasSession)
      : undefined;

    return [{ ...item, subItems }];
  });
}
