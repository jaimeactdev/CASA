import { describe, expect, it } from "vitest";
import { resolveAssetUrl, toMonogram } from "./monogram";

describe("toMonogram", () => {
  it("uses the first letter of the first two words", () => {
    expect(toMonogram("Gestión Operativa")).toBe("GO");
  });

  it("uses two letters for a single word", () => {
    expect(toMonogram("App")).toBe("AP");
  });

  it("prefers an explicit override", () => {
    expect(toMonogram("Gestión Operativa", "x")).toBe("X");
  });

  it("falls back when the name has no letters", () => {
    expect(toMonogram("  ")).toBe("A");
  });
});

describe("resolveAssetUrl", () => {
  it("makes public files root-relative", () => {
    expect(resolveAssetUrl("/brand/logo.svg")).toBe("/brand/logo.svg");
    expect(resolveAssetUrl("brand/logo.svg")).toBe("/brand/logo.svg");
  });

  it("keeps absolute and data URLs", () => {
    expect(resolveAssetUrl("https://cdn.example.com/l.png")).toBe(
      "https://cdn.example.com/l.png",
    );
    expect(resolveAssetUrl("data:image/png;base64,AAA")).toBe(
      "data:image/png;base64,AAA",
    );
  });
});
