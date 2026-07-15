"use client";

import { useMemo } from "react";
import { RepConfig } from "../core/RepConfig";

// =============================================================================
// STYLE ENGINE
// =============================================================================
// Injects raw CSS variables for Colors, Shadows, and Border Radius.
// =============================================================================

function resolveShadow(type: RepConfig["tokens"]["shadow"]) {
  switch (type) {
    case "xs": return "0 1px 2px rgba(0,0,0,0.05)";
    case "sm": return "0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)";
    case "md": return "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)";
    case "lg": return "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)";
    case "xl": return "0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)";
    case "glass": return "0 8px 32px 0 rgba(31, 38, 135, 0.07)";
    case "luxury": return "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.02)";
    case "industrial": return "8px 8px 0px rgba(0,0,0,1)";
    default: return "none";
  }
}

export function StyleEngine({ config }: { config: RepConfig }) {
  const cssString = useMemo(() => {
    const { colors, radius, shadow } = config.tokens;
    
    // Convert radius from preset string to actual CSS value
    const radiusValue = radius === "full" ? "9999px" : `${radius}px`;
    
    return `
      :root {
        --rep-primary: ${colors.primary};
        --rep-secondary: ${colors.secondary};
        --rep-accent: ${colors.accent};
        --rep-bg: ${colors.background};
        --rep-surface: ${colors.surface};
        --rep-border: ${colors.border};
        --rep-text: ${colors.text};
        --rep-text-muted: ${colors.textMuted};
        --rep-success: ${colors.success};
        --rep-warning: ${colors.warning};
        --rep-danger: ${colors.danger};
        
        --rep-radius: ${radiusValue};
        --rep-shadow: ${resolveShadow(shadow)};
      }
    `;
  }, [config.tokens]);

  return <style suppressHydrationWarning>{cssString}</style>;
}
