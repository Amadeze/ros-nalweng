"use client";

import { useMemo } from "react";
import { RepConfig } from "../core/RepConfig";
import { resolveThemeFontFamily } from "../../themes/ThemeFonts";

// =============================================================================
// TYPOGRAPHY ENGINE
// =============================================================================
// Injects typographic CSS variables backed by locally bundled fonts.
// =============================================================================

export function TypographyEngine({ config }: { config: RepConfig }) {
  const typoConfig = config.tokens.typography;

  const cssString = useMemo(() => {
    return `
      :root {
        --rep-base-size: ${typoConfig.baseSize}px;
        
        /* Display */
        --rep-font-display: ${resolveThemeFontFamily(typoConfig.display.family)};
        --rep-weight-display: ${typoConfig.display.weight};
        --rep-tracking-display: ${typoConfig.display.letterSpacing};
        --rep-lh-display: ${typoConfig.display.lineHeight};
        --rep-transform-display: ${typoConfig.display.textTransform};
        
        /* Heading */
        --rep-font-heading: ${resolveThemeFontFamily(typoConfig.heading.family)};
        --rep-weight-heading: ${typoConfig.heading.weight};
        --rep-tracking-heading: ${typoConfig.heading.letterSpacing};
        --rep-lh-heading: ${typoConfig.heading.lineHeight};
        --rep-transform-heading: ${typoConfig.heading.textTransform};
        
        /* Title */
        --rep-font-title: ${resolveThemeFontFamily(typoConfig.title.family)};
        --rep-weight-title: ${typoConfig.title.weight};
        --rep-tracking-title: ${typoConfig.title.letterSpacing};
        --rep-lh-title: ${typoConfig.title.lineHeight};
        --rep-transform-title: ${typoConfig.title.textTransform};
        
        /* Body */
        --rep-font-body: ${resolveThemeFontFamily(typoConfig.body.family)};
        --rep-weight-body: ${typoConfig.body.weight};
        --rep-tracking-body: ${typoConfig.body.letterSpacing};
        --rep-lh-body: ${typoConfig.body.lineHeight};
        --rep-transform-body: ${typoConfig.body.textTransform};
        
        /* Caption */
        --rep-font-caption: ${resolveThemeFontFamily(typoConfig.caption.family)};
        --rep-weight-caption: ${typoConfig.caption.weight};
        --rep-tracking-caption: ${typoConfig.caption.letterSpacing};
        --rep-lh-caption: ${typoConfig.caption.lineHeight};
        --rep-transform-caption: ${typoConfig.caption.textTransform};
        
        /* Button */
        --rep-font-button: ${resolveThemeFontFamily(typoConfig.button.family)};
        --rep-weight-button: ${typoConfig.button.weight};
        --rep-tracking-button: ${typoConfig.button.letterSpacing};
        --rep-lh-button: ${typoConfig.button.lineHeight};
        --rep-transform-button: ${typoConfig.button.textTransform};
        
        /* Fluid Typography Scale */
        --rep-fs-xs: clamp(0.75rem, 0.70rem + 0.25vw, 0.875rem);
        --rep-fs-sm: clamp(0.875rem, 0.83rem + 0.22vw, 1rem);
        --rep-fs-base: clamp(1rem, 0.95rem + 0.25vw, 1.125rem);
        --rep-fs-lg: clamp(1.125rem, 1.05rem + 0.38vw, 1.35rem);
        --rep-fs-xl: clamp(1.25rem, 1.15rem + 0.50vw, 1.6rem);
        --rep-fs-2xl: clamp(1.5rem, 1.35rem + 0.75vw, 2rem);
        --rep-fs-3xl: clamp(1.875rem, 1.60rem + 1.38vw, 2.75rem);
        --rep-fs-4xl: clamp(2.25rem, 1.85rem + 2.00vw, 3.5rem);
        --rep-fs-5xl: clamp(3rem, 2.40rem + 3.00vw, 5rem);
        --rep-fs-6xl: clamp(3.75rem, 2.85rem + 4.50vw, 6.5rem);
      }
      
      body {
        font-family: var(--rep-font-body);
        font-size: var(--rep-fs-base);
        color: var(--rep-text);
        background-color: var(--rep-bg);
      }
    `;
  }, [typoConfig]);

  return <style suppressHydrationWarning>{cssString}</style>;
}
