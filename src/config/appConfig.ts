/**
 * ============================================================================
 * Product identity (the ONLY object to edit when cloning the template)
 * ============================================================================
 *
 * Every value can be set from .env (NEXT_PUBLIC_*) without touching code.
 * The rest of the UI reads from this object.
 *
 * Full guide: docs/BRANDING.md
 */

/** Trimmed env value, or undefined when empty. */
function env(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

const name = env(process.env.NEXT_PUBLIC_APP_NAME) ?? "App";

export const appConfig = {
  /** Short commercial name (header, SEO titles, generated logo) */
  name,

  /** Long / legal name (optional) */
  fullName: env(process.env.NEXT_PUBLIC_APP_FULL_NAME) ?? "Aplicación plantilla",

  /** Login subtitle and short descriptions */
  tagline: env(process.env.NEXT_PUBLIC_APP_TAGLINE) ?? "Plantilla frontend",

  /** Default SEO description */
  description:
    env(process.env.NEXT_PUBLIC_APP_DESCRIPTION) ??
    "Plantilla base para nuevos proyectos frontend.",

  /** Public site URL (canonical SEO). Local uses localhost. */
  siteUrl: env(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:4200",

  /**
   * Brand assets. Paths are relative to /public (e.g. /brand/logo.svg) or absolute URLs.
   * When a logo is not set, BrandLogo renders a monogram with the initials of `name`
   * in the primary color, so the template has no third-party branding.
   */
  assets: {
    /** Full logo: expanded sidebar */
    logoFull: env(process.env.NEXT_PUBLIC_LOGO_FULL),
    /** Compact mark: collapsed sidebar */
    logoMark: env(process.env.NEXT_PUBLIC_LOGO_MARK),
    /** Login screen logo (falls back to logoFull) */
    logoLogin:
      env(process.env.NEXT_PUBLIC_LOGO_LOGIN) ?? env(process.env.NEXT_PUBLIC_LOGO_FULL),
    /** Browser tab icon (falls back to src/app/favicon.ico) */
    favicon: env(process.env.NEXT_PUBLIC_FAVICON),
  },

  /** Initials used by the generated logo (defaults to the first letters of `name`) */
  monogram: env(process.env.NEXT_PUBLIC_APP_MONOGRAM),

  /** Accessibility / alt text */
  logoAlt: `Logo ${name}`,
} as const;

export type AppConfig = typeof appConfig;
