import { describe, expect, it } from "vitest";
import { DEFAULT_BRAND, parseHex, resolveBrandPalette } from "./brandColor";

function channelSum(hex: string): number {
  const rgb = parseHex(hex);
  if (!rgb) throw new Error(`Invalid hex: ${hex}`);
  return rgb.r + rgb.g + rgb.b;
}

describe("resolveBrandPalette", () => {
  it("uses the CASA forest green when no color is configured", () => {
    expect(resolveBrandPalette(undefined)).toEqual(
      expect.objectContaining({
        brand: DEFAULT_BRAND,
        brandPress: "#1A4A2A",
        brandBg: "#E9EEEA",
        brandTint: "rgba(30, 86, 49, 0.12)",
      }),
    );
  });

  it("accepts a 6-digit hex with or without a leading hash", () => {
    expect(resolveBrandPalette("1F4E79").brand).toBe("#1F4E79");
    expect(resolveBrandPalette("#1f4e79").brand).toBe("#1F4E79");
  });

  it("falls back to the default when the value is not a 6-digit hex", () => {
    expect(resolveBrandPalette("").brand).toBe(DEFAULT_BRAND);
    expect(resolveBrandPalette("green").brand).toBe(DEFAULT_BRAND);
    expect(resolveBrandPalette("#FFF").brand).toBe(DEFAULT_BRAND);
  });

  it("derives a darker press and a light background from a custom brand", () => {
    const palette = resolveBrandPalette("#1F4E79");
    expect(channelSum(palette.brandPress)).toBeLessThan(channelSum(palette.brand));
    expect(channelSum(palette.brandBg)).toBeGreaterThan(channelSum(palette.brand));
    expect(palette.brandTint.startsWith("rgba(31, 78, 121,")).toBe(true);
  });
});
