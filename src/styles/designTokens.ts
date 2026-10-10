/**
 * Design-system tokens for the template.
 * Brand color: NEXT_PUBLIC_BRAND_COLOR (see src/styles/brandColor.ts and docs/BRANDING.md).
 * Shell chrome stays neutral so the primary reads as an accent, not a full-bleed fill.
 */
import { brandPalette } from "./brandColor";

const {
  brand,
  brandPress,
  brandBg,
  brandTint,
  brandShadow,
  brandShadowStrong,
} = brandPalette;

export const colors = {
  // Brand (parameterized)
  brand,
  brandPress,
  brandHover: "#3F3F3F",
  brandDisabled: "#F1F1F1",
  brandUnselected: "#C3C3C3",
  brandBg,
  brandTint,
  brandShadow,
  brandShadowStrong,

  // Typography
  textPrincipal: brand,
  textBody: "#1A1A1A",
  textSecondary: "#999999",
  textPlaceholderDisabled: "#F5F5F5",
  textPositive: "#FFFFFF",
  textNegative: "#000000",

  // Surfaces
  surface0: "#FFFFFF",
  surface1: "#FAFAFA",
  surface2: "#E7E7E7",
  surface3: "#C3C3C3",

  // Iconography
  iconMid: "#CACACA",

  // Semantic states
  success: "#00B86B",
  successBg: "#E8FFF4",
  successText: "#005C38",

  warning: "#FFD600",
  warningBg: "#FFFDE7",
  warningText: "#7A5F00",

  error: "#E5003B",
  errorBg: "#FFF0F4",
  errorText: "#8B0022",

  info: "#00AEEF",
  infoBg: "#E0F7FF",
  infoText: "#005C80",

  alt2: "#6B21A8",
  alt2Bg: "#F5F0FF",
  alt2Text: "#4A1580",
} as const;

/**
 * App shell. Header, sidebar and canvas use different neutrals.
 * The primary appears as a hairline, active state and call to action.
 */
export const chrome = {
  headerBg: "#FFFFFF",
  headerText: "#1C1C1C",
  headerMuted: "#5C5854",
  headerBorder: "#E6E2DA",
  sidebarBg: "#F6F5F3",
  sidebarBorder: "#E4E0D8",
  sidebarText: "#2C2C2C",
  sidebarMuted: "#6A655E",
  sidebarActiveBg: brandBg,
  canvasBg: "#F0F2F5",
} as const;

/**
 * Type scale (base 14px, standard for dense business apps).
 * Change sizes here; typography.ts, shell and form styles read from it.
 */
export const fontSizes = {
  xs: "0.75rem", // 12px — captions, helper text
  sm: "0.8125rem", // 13px — secondary text, breadcrumbs
  md: "0.875rem", // 14px — body, menu, inputs
  lg: "1rem", // 16px — emphasized body, header title
  xl: "1.125rem", // 18px — card / section titles
  h3: "1.25rem", // 20px
  h2: "1.5rem", // 24px — page titles
  h1: "1.75rem", // 28px — hero / landing titles
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

/** Icon sizes in px for shell chrome (header, sidebar). */
export const iconSizes = {
  sm: 18,
  md: 20,
  lg: 24,
} as const;

export type DesignColor = keyof typeof colors;

export const designTokens = {
  colors,
  chrome,
  fontSizes,
  fontWeights,
  iconSizes,
} as const;
