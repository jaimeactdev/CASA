import type { MenuItem } from '@/types/menu';

export function filterMenuItemsBySession(
  items: MenuItem[],
  hasSession: boolean,
  permissions: readonly string[] = [],
): MenuItem[] {
  return items.flatMap((item) => {
    if (item.status === 'I') return [];
    if (item.status === 'R' && !hasSession) return [];
    if (item.permission && !permissions.includes(item.permission)) return [];

    const subItems = item.subItems
      ? filterMenuItemsBySession(item.subItems, hasSession, permissions)
      : undefined;

    return [{ ...item, subItems }];
  });
}
