/**
 * Brand color parameter for the template.
 * Set NEXT_PUBLIC_BRAND_COLOR to a 6-digit hex (for example #1E5631).
 * Press, soft background, tint and shadow are derived from that single value.
 */

const HEX_COLOR = /^#?([0-9a-fA-F]{6})$/;

/** CASA forest green. */
export const DEFAULT_BRAND = "#1E5631";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

export interface BrandPalette {
  brand: string;
  brandPress: string;
  brandBg: string;
  brandTint: string;
  brandShadow: string;
  brandShadowStrong: string;
}

export function parseHex(input: string): Rgb | null {
  const match = HEX_COLOR.exec(input.trim());
  if (!match) return null;
  const value = match[1];
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

export function toHex(rgb: Rgb): string {
  const channel = (value: number) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

export function mix(base: Rgb, target: Rgb, targetWeight: number): Rgb {
  const weight = Math.max(0, Math.min(1, targetWeight));
  return {
    r: base.r * (1 - weight) + target.r * weight,
    g: base.g * (1 - weight) + target.g * weight,
    b: base.b * (1 - weight) + target.b * weight,
  };
}

export function withAlpha(rgb: Rgb, alpha: number): string {
  const safe = Math.max(0, Math.min(1, alpha));
  return `rgba(${Math.round(rgb.r)}, ${Math.round(rgb.g)}, ${Math.round(rgb.b)}, ${safe})`;
}

export function resolveBrandPalette(raw?: string | null): BrandPalette {
  const rgb = (raw ? parseHex(raw) : null) ?? parseHex(DEFAULT_BRAND)!;

  return {
    brand: toHex(rgb),
    brandPress: toHex(mix(rgb, { r: 0, g: 0, b: 0 }, 0.14)),
    brandBg: toHex(mix(rgb, { r: 255, g: 255, b: 255 }, 0.9)),
    brandTint: withAlpha(rgb, 0.12),
    brandShadow: withAlpha(rgb, 0.35),
    brandShadowStrong: withAlpha(rgb, 0.4),
  };
}

export const brandPalette = resolveBrandPalette(
  process.env.NEXT_PUBLIC_BRAND_COLOR,
);
