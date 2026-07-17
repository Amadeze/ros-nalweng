"use client";

import { useMemo } from "react";
import { ThemeConfig, getThemePreset } from "./ThemeConfig";
import { ExtendedTenant } from "./ThemeProps";
import { resolveThemeFontFamily } from "./ThemeFonts";

// =============================================================================
// THEME ENGINE — The $10k Infrastructure Core
// =============================================================================
// This component reads themeConfig from tenant DB (or falls back to preset)
// and injects CSS custom properties + Google Fonts dynamically.
// Every theme component MUST read from these variables, never hardcode.
// =============================================================================

interface ThemeEngineProps {
  tenant: ExtendedTenant & { themeConfig?: any; layoutStyle?: string };
  children: React.ReactNode;
}

const THEME_COLORS: Record<string, string> = {
  amber: "#f59e0b",
  blue: "#3b82f6",
  emerald: "#10b981",
  rose: "#f43f5e",
  violet: "#8b5cf6",
  zinc: "#71717a",
};

const THEME_FONTS: Record<string, string> = {
  sans: "Inter",
  serif: "Playfair Display",
  mono: "JetBrains Mono",
};

const THEME_RADII: Record<string, number> = {
  none: 0,
  sm: 4,
  md: 8,
  xl: 12,
  full: 999,
};

const THEME_ANIMATIONS: Record<string, Partial<ThemeConfig["animations"]>> = {
  none: { level: "none", durationScale: 0, hoverEffects: false, scrollTrigger: false },
  subtle: { level: "subtle", durationScale: 1 },
  bouncy: { level: "moderate", easing: [0.34, 1.56, 0.64, 1], durationScale: 0.9 },
  float: { level: "moderate", durationScale: 1.6 },
  fast: { level: "high-tech", durationScale: 0.55 },
  cinematic: { level: "cinematic", durationScale: 1.5 },
  spring: { level: "moderate", easing: [0.22, 1.4, 0.36, 1], durationScale: 0.85 },
  staggered: { level: "moderate", durationScale: 1.1 },
};

function applyThemeMode(
  colors: ThemeConfig["colors"],
  themeMode?: string | null,
  layoutStyle?: string | null,
): ThemeConfig["colors"] {
  const nativeDarkThemes = new Set([
    "cyber", "cyberpunk", "liquid", "glass", "industrial", "luxury", "cinematic",
  ]);
  const isNativeDark = nativeDarkThemes.has(layoutStyle?.toLowerCase() || "");

  if (themeMode === "light" && isNativeDark) {
    return {
      ...colors,
      background: "#fafafa",
      surface: "#ffffff",
      text: "#18181b",
      textMuted: "#71717a",
      border: "#e4e4e7",
    };
  }

  if (themeMode !== "dark" || isNativeDark) return colors;

  return {
    ...colors,
    background: "#0b0b0c",
    surface: "#171719",
    text: "#f8fafc",
    textMuted: "#a1a1aa",
    border: "#303036",
  };
}

/**
 * Resolves the final ThemeConfig by deep-merging:
 * 1. Preset defaults (based on layoutStyle)
 * 2. Tenant's custom themeConfig overrides
 */
function resolveConfig(tenant: ThemeEngineProps["tenant"]): ThemeConfig {
  const preset = getThemePreset(tenant.layoutStyle);

  // Parse tenant overrides
  let overrides: Partial<ThemeConfig> = {};
  if (tenant.themeConfig) {
    try {
      overrides = typeof tenant.themeConfig === "string"
        ? JSON.parse(tenant.themeConfig)
        : tenant.themeConfig;
    } catch (e) {
      console.error("[ThemeEngine] Failed to parse themeConfig:", e);
    }
  }

  // Deep merge (2 levels)
  const colors = {
    ...applyThemeMode(preset.colors, tenant.themeMode, tenant.layoutStyle),
    ...(tenant.themeColor && THEME_COLORS[tenant.themeColor]
      ? {
          primary: THEME_COLORS[tenant.themeColor],
          accent: THEME_COLORS[tenant.themeColor],
        }
      : {}),
    ...(overrides.colors || {}),
  };
  const selectedFont = tenant.fontFamily && THEME_FONTS[tenant.fontFamily];
  const typography = {
    ...preset.typography,
    ...(selectedFont
      ? { fontFamily: selectedFont, displayFont: selectedFont }
      : {}),
    ...(overrides.typography || {}),
  };
  const animations = {
    ...preset.animations,
    ...(tenant.animationStyle
      ? THEME_ANIMATIONS[tenant.animationStyle] || {}
      : {}),
    ...(overrides.animations || {}),
  };
  const layout = {
    ...preset.layout,
    ...(tenant.borderRadius && THEME_RADII[tenant.borderRadius] !== undefined
      ? { borderRadius: THEME_RADII[tenant.borderRadius] }
      : {}),
    ...(overrides.layout || {}),
  };

  return {
    colors,
    typography,
    shadows: { ...preset.shadows, ...(overrides.shadows || {}) },
    animations,
    layout,
  };
}

/**
 * Converts shadow config to CSS box-shadow string
 */
function resolveShadow(cfg: ThemeConfig["shadows"]): {
  sm: string; md: string; lg: string; xl: string;
} {
  const { type, color, intensity } = cfg;
  const i = intensity / 100;

  switch (type) {
    case "none":
      return { sm: "none", md: "none", lg: "none", xl: "none" };

    case "soft":
      return {
        sm: `0 1px 3px ${color}`,
        md: `0 4px 14px ${color}`,
        lg: `0 10px 40px ${color}`,
        xl: `0 20px 60px ${color}`,
      };

    case "sharp":
      return {
        sm: `2px 2px 0 ${color}`,
        md: `4px 4px 0 ${color}`,
        lg: `8px 8px 0 ${color}`,
        xl: `12px 12px 0 ${color}`,
      };

    case "deep3d":
      return {
        sm: `0 2px 4px ${color}, 0 1px 2px ${color}`,
        md: `0 4px 8px ${color}, 0 2px 4px ${color}, 0 0 1px ${color}`,
        lg: `0 12px 32px ${color}, 0 4px 12px ${color}, 0 0 2px ${color}`,
        xl: `0 24px 64px ${color}, 0 8px 24px ${color}, 0 0 4px ${color}`,
      };

    case "glow":
      return {
        sm: `0 0 8px ${color}`,
        md: `0 0 20px ${color}, 0 0 4px ${color}`,
        lg: `0 0 40px ${color}, 0 0 10px ${color}`,
        xl: `0 0 80px ${color}, 0 0 20px ${color}, 0 0 4px ${color}`,
      };

    case "brutalist":
      return {
        sm: `3px 3px 0 ${color}`,
        md: `6px 6px 0 ${color}`,
        lg: `10px 10px 0 ${color}`,
        xl: `14px 14px 0 ${color}`,
      };

    default:
      return { sm: "none", md: "none", lg: "none", xl: "none" };
  }
}

/**
 * Converts animation config to Framer Motion transition presets
 */
function resolveAnimations(cfg: ThemeConfig["animations"]) {
  const { level, easing, durationScale } = cfg;
  const ease = Array.isArray(easing) ? easing : [0.16, 1, 0.3, 1];
  const s = durationScale;

  if (level === "none") {
    return {
      enter: { duration: 0 },
      section: { duration: 0 },
      stagger: 0,
      hover: {},
    };
  }

  const configs: Record<string, any> = {
    subtle: {
      enter: { duration: 0.6 * s, ease },
      section: { duration: 0.8 * s, ease },
      stagger: 0.08,
      hover: { scale: 1.02, transition: { duration: 0.3 } },
    },
    moderate: {
      enter: { duration: 0.8 * s, ease },
      section: { duration: 1.0 * s, ease },
      stagger: 0.12,
      hover: { scale: 1.04, y: -4, transition: { duration: 0.3 } },
    },
    "high-tech": {
      enter: { duration: 0.5 * s, ease: [0.77, 0, 0.175, 1] },
      section: { duration: 0.7 * s, ease: [0.77, 0, 0.175, 1] },
      stagger: 0.06,
      hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
    },
    cinematic: {
      enter: { duration: 1.5 * s, ease },
      section: { duration: 2.0 * s, ease },
      stagger: 0.2,
      hover: { scale: 1.01, transition: { duration: 0.8 } },
    },
  };

  return configs[level] || configs.subtle;
}

/**
 * Resolves font-family CSS value from config name
 */
function resolveFontFamily(name: string): string {
  return resolveThemeFontFamily(name);
}

export function ThemeEngine({ tenant, children }: ThemeEngineProps) {
  const config = useMemo(() => resolveConfig(tenant), [tenant]);
  const shadows = useMemo(() => resolveShadow(config.shadows), [config.shadows]);
  const anims = useMemo(() => resolveAnimations(config.animations), [config.animations]);
  const { colors, typography, layout } = config;

  // Build the dynamic CSS
  const cssVariables = `
    .t-root {
      /* ── COLORS ────────────────────────────────── */
      --t-primary: ${colors.primary};
      --t-secondary: ${colors.secondary};
      --t-bg: ${colors.background};
      --t-surface: ${colors.surface};
      --t-text: ${colors.text};
      --t-text-muted: ${colors.textMuted};
      --t-border: ${colors.border};
      --t-accent: ${colors.accent};
      
      /* ── TYPOGRAPHY ────────────────────────────── */
      --t-font-body: ${resolveFontFamily(typography.fontFamily)};
      --t-font-display: ${resolveFontFamily(typography.displayFont)};
      --t-font-size-base: ${typography.baseFontSize}px;
      --t-font-weight-body: ${typography.bodyWeight};
      --t-font-weight-heading: ${typography.headingWeight};
      --t-heading-tracking: ${typography.headingTracking}em;
      --t-body-line-height: ${typography.bodyLineHeight};
      --t-heading-transform: ${typography.headingTransform};
      
      /* ── FLUID TYPE SCALE (modular scale, responsive) ── */
      --t-fs-xs:  clamp(0.75rem,  0.7rem  + 0.25vw, 0.875rem);
      --t-fs-sm:  clamp(0.875rem, 0.83rem + 0.22vw, 1rem);
      --t-fs-base: clamp(${Math.max(typography.baseFontSize - 2, 14)}px, ${typography.baseFontSize - 2}px + 0.25vw, ${typography.baseFontSize}px);
      --t-fs-lg:  clamp(1.125rem, 1rem    + 0.5vw,  1.35rem);
      --t-fs-xl:  clamp(1.25rem,  1.1rem  + 0.75vw, 1.75rem);
      --t-fs-2xl: clamp(1.5rem,   1.2rem  + 1.5vw,  2.5rem);
      --t-fs-3xl: clamp(2rem,     1.5rem  + 2.5vw,  3.5rem);
      --t-fs-4xl: clamp(2.5rem,   1.8rem  + 3.5vw,  5rem);
      --t-fs-5xl: clamp(3rem,     2rem    + 5vw,    7rem);
      
      /* ── SHADOWS ───────────────────────────────── */
      --t-shadow-sm: ${shadows.sm};
      --t-shadow-md: ${shadows.md};
      --t-shadow-lg: ${shadows.lg};
      --t-shadow-xl: ${shadows.xl};
      
      /* ── LAYOUT ────────────────────────────────── */
      --t-radius: ${layout.borderRadius}px;
      --t-border-w: ${layout.borderWidth}px;
      --t-max-w: ${layout.maxWidth}px;
      --t-spacing-scale: ${layout.spacingScale};
      
      /* ── ANIMATION DURATIONS ───────────────────── */
      --t-anim-enter: ${(anims.enter?.duration || 0.6).toFixed(2)}s;
      --t-anim-section: ${(anims.section?.duration || 0.8).toFixed(2)}s;
      --t-anim-stagger: ${(anims.stagger || 0.1).toFixed(2)}s;
      --theme-primary: ${colors.primary};
      --theme-background: ${colors.background};
      --theme-surface: ${colors.surface};
      --theme-text: ${colors.text};
      --theme-text-muted: ${colors.textMuted};
      --theme-border: ${colors.border};
      --theme-radius: ${layout.borderRadius}px;
      --theme-font: ${resolveFontFamily(typography.fontFamily)};
      
      /* ── APPLY BASE ────────────────────────────── */
      font-family: var(--t-font-body);
      font-size: var(--t-fs-base);
      font-weight: var(--t-font-weight-body);
      line-height: var(--t-body-line-height);
      color: var(--t-text);
      ${colors.background.startsWith('linear-gradient') || colors.background.startsWith('radial-gradient')
        ? `background: ${colors.background};`
        : `background-color: ${colors.background};`
      }
    }
    
    /* ── Heading styles ─────────────────────────── */
    .t-root h1, .t-root h2, .t-root h3, .t-root h4, .t-root h5, .t-root h6 {
      font-family: var(--t-font-display);
      font-weight: var(--t-font-weight-heading);
      letter-spacing: var(--t-heading-tracking);
      text-transform: var(--t-heading-transform);
      line-height: 1.15;
    }
  `;

  return (
    <div
      className="t-root min-h-screen w-full overflow-x-clip"
      data-theme={tenant.layoutStyle || "neomodern"}
      data-theme-mode={tenant.themeMode || "light"}
      data-animation={tenant.animationStyle || "subtle"}
      data-animation-direction={tenant.animationDirection || "up"}
    >
      <style suppressHydrationWarning>{cssVariables}</style>
      {children}
    </div>
  );
}

// =============================================================================
// HOOK — useThemeConfig (for child components to read resolved config)
// =============================================================================
export { resolveConfig, resolveShadow, resolveAnimations, resolveFontFamily };
