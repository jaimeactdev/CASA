import { MenuItem } from '@/types/menu';

/**
 * Collects menu URLs whose status is `R`.
 */
export const getRestrictedRoutes = (menuItems: MenuItem[]): string[] => {
  const restrictedRoutes: string[] = [];

  const extractRestrictedUrls = (items: MenuItem[]): void => {
    items.forEach((item) => {
      if (item.status === 'R' && item.url) {
        restrictedRoutes.push(item.url);
      }

      if (item.subItems) {
        extractRestrictedUrls(item.subItems);
      }
    });
  };

  extractRestrictedUrls(menuItems);
  return restrictedRoutes;
};

/**
 * Returns the menu status for a path, or null if it is not in the tree.
 */
export const getRouteStatus = (
  currentPath: string,
  menuItems: MenuItem[],
): 'A' | 'R' | 'I' | null => {
  const findRouteStatus = (items: MenuItem[]): 'A' | 'R' | 'I' | null => {
    for (const item of items) {
      if (item.url === currentPath) {
        return item.status || 'A';
      }
      if (item.subItems) {
        const found = item.subItems.find((sub) => sub.url === currentPath);
        if (found) {
          return found.status || 'A';
        }
      }
    }
    return null;
  };

  return findRouteStatus(menuItems);
};

/**
 * True when the path is listed as restricted (`R`).
 */
export const isRestrictedRoute = (
  currentPath: string,
  menuItems: MenuItem[],
): boolean => {
  const restrictedRoutes = getRestrictedRoutes(menuItems);
  return restrictedRoutes.includes(currentPath);
};

/**
 * True when the path has status `R` or `A` (session-timeout control).
 */
export const isSessionControlledRoute = (
  currentPath: string,
  menuItems: MenuItem[],
): boolean => {
  const status = getRouteStatus(currentPath, menuItems);
  return status === 'R' || status === 'A';
};
