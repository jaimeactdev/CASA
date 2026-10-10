// src/config/routeModalConfig.ts

export interface RouteModalConfig {
  route: string;
  title: string;
  message: string;
  status: "A" | "I";
  icon?: "checkmark-circle" | "alert-circle" | "warning" | "info";
  lottieAnimation?: string;
  buttons?: {
    text: string;
    variant?: "contained" | "outlined" | "text";
    color?: "primary" | "secondary" | "error" | "warning" | "success";
    action?: () => void;
  }[];
}

/** Per-route modal config. Empty in the template; add entries as needed. */
export const routeModalConfigs: RouteModalConfig[] = [];

/**
 * Whether the current date/time is inside the allowed window to show the modal.
 */
export function isWithinDateTimeRange(
  startDateTime?: string,
  endDateTime?: string,
): boolean {
  if (!startDateTime && !endDateTime) return true;

  const now = new Date();

  if (startDateTime) {
    const start = new Date(startDateTime);
    if (now < start) return false;
  }

  if (endDateTime) {
    const end = new Date(endDateTime);
    if (now > end) return false;
  }

  return true;
}

export function getActiveRouteModalConfig(
  pathname: string,
): RouteModalConfig | undefined {
  const normalized = pathname.endsWith("/") ? pathname : `${pathname}/`;
  return routeModalConfigs.find(
    (config) =>
      config.status === "A" &&
      (normalized === config.route ||
        normalized.startsWith(config.route) ||
        pathname === config.route.replace(/\/$/, "")),
  );
}
