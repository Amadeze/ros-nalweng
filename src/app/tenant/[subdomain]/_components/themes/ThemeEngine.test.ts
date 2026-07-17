import { describe, expect, it } from "vitest";
import { resolveConfig } from "./ThemeEngine";

function tenant(overrides: Record<string, unknown> = {}) {
  return {
    layoutStyle: "heritage",
    themeColor: "amber",
    fontFamily: "sans",
    themeMode: "light",
    borderRadius: "md",
    animationStyle: "subtle",
    ...overrides,
  } as never;
}

describe("tenant theme configuration", () => {
  it("maps each storefront layout to its intended preset family", () => {
    expect(resolveConfig(tenant({ layoutStyle: "heritage", fontFamily: undefined })).typography.displayFont)
      .toBe("Playfair Display");
    expect(resolveConfig(tenant({ layoutStyle: "cyber", fontFamily: undefined })).typography.displayFont)
      .toBe("Orbitron");
    expect(resolveConfig(tenant({ layoutStyle: "luxury", fontFamily: undefined, themeMode: "dark" })).colors.background)
      .toBe("#000000");
    expect(resolveConfig(tenant({ layoutStyle: "playful", fontFamily: undefined })).shadows.type)
      .toBe("brutalist");
  });

  it("applies every top-level visual setting", () => {
    const config = resolveConfig(tenant({
      themeColor: "rose",
      fontFamily: "mono",
      borderRadius: "full",
      animationStyle: "fast",
      themeMode: "dark",
    }));

    expect(config.colors.primary).toBe("#f43f5e");
    expect(config.colors.background).toBe("#0b0b0c");
    expect(config.typography.fontFamily).toBe("JetBrains Mono");
    expect(config.layout.borderRadius).toBe(999);
    expect(config.animations.level).toBe("high-tech");
    expect(config.animations.durationScale).toBe(0.55);
  });

  it("keeps advanced themeConfig overrides as the final authority", () => {
    const config = resolveConfig(tenant({
      themeConfig: {
        colors: { primary: "#123456" },
        layout: { borderRadius: 21 },
      },
    }));

    expect(config.colors.primary).toBe("#123456");
    expect(config.layout.borderRadius).toBe(21);
  });

  it("provides matching surface colors when a native dark theme is switched to light", () => {
    const config = resolveConfig(tenant({
      layoutStyle: "cyber",
      themeMode: "light",
      fontFamily: undefined,
    }));

    expect(config.colors.background).toBe("#fafafa");
    expect(config.colors.surface).toBe("#ffffff");
    expect(config.colors.text).toBe("#18181b");
  });
});
