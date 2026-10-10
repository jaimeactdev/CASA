import { colors } from "./designTokens";

/**
 * Custom properties applied on <html> so stylesheets follow the brand parameter.
 * Inline styles win over the fallbacks in variables.css / globals.css.
 */
export function brandCssVars(): Record<string, string> {
  return {
    "--color-primary": colors.brand,
    "--color-primary-title": colors.textPrincipal,
    "--color-primary-background-button": colors.brand,
    "--color-focus-input": colors.brand,
    "--color-color-focus-input": colors.brand,
    "--color-brand-press": colors.brandPress,
    "--color-brand-hover": colors.brandHover,
    "--color-brand-bg": colors.brandBg,
    "--color-brand-tint": colors.brandTint,
    "--color-brand-shadow": colors.brandShadow,
  };
}
