"use client";

import { useMemo } from "react";
import { RepConfig, FontToken } from "../core/RepConfig";

// =============================================================================
// TYPOGRAPHY ENGINE
// =============================================================================
// Constructs Google Fonts URL dynamically and injects typographic CSS variables.
// =============================================================================

function extractFamilies(config: RepConfig["tokens"]["typography"]) {
  const families = new Set<string>();
  const weightsByFamily: Record<string, Set<number>> = {};

  const addFont = (token: FontToken) => {
    families.add(token.family);
    if (!weightsByFamily[token.family]) {
      weightsByFamily[token.family] = new Set();
    }
    weightsByFamily[token.family].add(token.weight);
  };

  addFont(config.display);
  addFont(config.heading);
  addFont(config.title);
  addFont(config.body);
  addFont(config.caption);
  addFont(config.button);

  return { families: Array.from(families), weightsByFamily };
}

export function TypographyEngine({ config }: { config: RepConfig }) {
  const { typoConfig, fontUrl } = useMemo(() => {
    const typo = config.tokens.typography;
    const { families, weightsByFamily } = extractFamilies(typo);

    // Build Google Fonts URL
    const params = families.map(fam => {
      const safeFam = fam.replace(/\s+/g, "+");
      const weights = Array.from(weightsByFamily[fam]).sort().join(";");
      return `family=${safeFam}:wght@${weights}`;
    });
    
    let fontUrl = "";
    if (params.length > 0) {
      fontUrl = `https://fonts.googleapis.com/css2?${params.join("&")}&display=swap`;
    }

    return { typoConfig: typo, fontUrl };
  }, [config.tokens.typography]);

  const cssString = useMemo(() => {
    return `
      ${fontUrl ? `@import url('${fontUrl}');` : ''}
      
      :root {
        --rep-base-size: ${typoConfig.baseSize}px;
        
        /* Display */
        --rep-font-display: '${typoConfig.display.family}', sans-serif;
        --rep-weight-display: ${typoConfig.display.weight};
        --rep-tracking-display: ${typoConfig.display.letterSpacing};
        --rep-lh-display: ${typoConfig.display.lineHeight};
        --rep-transform-display: ${typoConfig.display.textTransform};
        
        /* Heading */
        --rep-font-heading: '${typoConfig.heading.family}', sans-serif;
        --rep-weight-heading: ${typoConfig.heading.weight};
        --rep-tracking-heading: ${typoConfig.heading.letterSpacing};
        --rep-lh-heading: ${typoConfig.heading.lineHeight};
        --rep-transform-heading: ${typoConfig.heading.textTransform};
        
        /* Title */
        --rep-font-title: '${typoConfig.title.family}', sans-serif;
        --rep-weight-title: ${typoConfig.title.weight};
        --rep-tracking-title: ${typoConfig.title.letterSpacing};
        --rep-lh-title: ${typoConfig.title.lineHeight};
        --rep-transform-title: ${typoConfig.title.textTransform};
        
        /* Body */
        --rep-font-body: '${typoConfig.body.family}', sans-serif;
        --rep-weight-body: ${typoConfig.body.weight};
        --rep-tracking-body: ${typoConfig.body.letterSpacing};
        --rep-lh-body: ${typoConfig.body.lineHeight};
        --rep-transform-body: ${typoConfig.body.textTransform};
        
        /* Caption */
        --rep-font-caption: '${typoConfig.caption.family}', sans-serif;
        --rep-weight-caption: ${typoConfig.caption.weight};
        --rep-tracking-caption: ${typoConfig.caption.letterSpacing};
        --rep-lh-caption: ${typoConfig.caption.lineHeight};
        --rep-transform-caption: ${typoConfig.caption.textTransform};
        
        /* Button */
        --rep-font-button: '${typoConfig.button.family}', sans-serif;
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
  }, [typoConfig, fontUrl]);

  return <style suppressHydrationWarning>{cssString}</style>;
}
