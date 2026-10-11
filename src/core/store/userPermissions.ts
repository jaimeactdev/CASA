/** Stable fallback so selectors never return a new `[]` on each snapshot. */
export const EMPTY_PERMISSIONS: string[] = [];

export function selectUserPermissions(state: {
  user: { permissions?: string[] } | null;
}): string[] {
  return state.user?.permissions ?? EMPTY_PERMISSIONS;
}
