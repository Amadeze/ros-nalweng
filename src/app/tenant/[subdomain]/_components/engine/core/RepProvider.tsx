"use client";

import React, { createContext, useContext, useMemo } from "react";
import { RepConfig, DEFAULT_REP_CONFIG } from "./RepConfig";
import { StyleEngine } from "../style/StyleEngine";
import { TypographyEngine } from "../style/TypographyEngine";
import { MotionEngine } from "../motion/MotionEngine";

// =============================================================================
// REP PROVIDER (Core State Manager)
// =============================================================================
// This component manages the global RepConfig state and orchestrates the
// Micro-Engines (Style, Typography, Motion).
// =============================================================================

interface RepContextType {
  config: RepConfig;
  tenant: any; // We'll pass the full tenant object down
}

const RepContext = createContext<RepContextType | undefined>(undefined);

export function useRep() {
  const context = useContext(RepContext);
  if (!context) {
    throw new Error("useRep must be used within a RepProvider");
  }
  return context;
}

interface RepProviderProps {
  tenant: any;
  children: React.ReactNode;
  overrideConfig?: import("./RepConfig").RepConfig;
}

export function RepProvider({ tenant, children, overrideConfig }: RepProviderProps) {
  // Parse config from tenant, fallback to DEFAULT, or use overrideConfig
  const config = useMemo<RepConfig>(() => {
    if (overrideConfig) {
      return overrideConfig;
    }

    // Start with default config
    let finalConfig: RepConfig = JSON.parse(JSON.stringify(DEFAULT_REP_CONFIG));

    if (tenant) {
      // Map Prisma Database fields to RepConfig tokens
      if (tenant.themeColor) {
        const colors: Record<string, string> = {
          amber: "#F59E0B", blue: "#3B82F6", emerald: "#10B981", 
          rose: "#F43F5E", violet: "#8B5CF6", zinc: "#71717A"
        };
        if (colors[tenant.themeColor]) {
          finalConfig.tokens.colors.primary = colors[tenant.themeColor];
        }
      }
      
      if (tenant.fontFamily) {
        const fontFamily = tenant.fontFamily === "serif" ? "Playfair Display" 
                         : tenant.fontFamily === "mono" ? "Roboto Mono" 
                         : "Inter";
        finalConfig.tokens.typography.display.family = fontFamily;
        finalConfig.tokens.typography.heading.family = fontFamily;
        finalConfig.tokens.typography.body.family = fontFamily;
      }
      
      if (tenant.borderRadius) {
        const radiusMap: Record<string, string> = { none: "0", sharp: "0", sm: "4", md: "8", lg: "16", full: "full" };
        finalConfig.tokens.radius = (radiusMap[tenant.borderRadius] || "8") as any;
      }
      
      if (tenant.animationStyle) {
        finalConfig.tokens.motion = tenant.animationStyle as any;
      }
      
      if (tenant.themeMode === "dark") {
        // Simple dark mode inversion mapping
        finalConfig.tokens.colors.background = "#111111";
        finalConfig.tokens.colors.surface = "#1A1A1A";
        finalConfig.tokens.colors.text = "#F5F5F5";
        finalConfig.tokens.colors.textMuted = "#A3A3A3";
      }

      // If there's an explicit JSON themeConfig saved (from Phase 10 Editor in the future)
      if (tenant.themeConfig) {
        try {
          const parsed = typeof tenant.themeConfig === "string" 
            ? JSON.parse(tenant.themeConfig) 
            : tenant.themeConfig;
          if (parsed.tokens) {
            finalConfig = parsed as RepConfig;
          }
        } catch (e) {
          console.error("[RepProvider] Failed to parse tenant.themeConfig:", e);
        }
      }
    }
    
    return finalConfig;
  }, [tenant, overrideConfig]);

  return (
    <RepContext.Provider value={{ config, tenant }}>
      {/* 
        The Provider orchestrates the core engines.
        StyleEngine & TypographyEngine inject CSS variables.
        MotionEngine wraps the app in Framer Motion configurations (like MotionConfig).
      */}
      <TypographyEngine config={config} />
      <StyleEngine config={config} />
      <MotionEngine config={config}>
        {children}
      </MotionEngine>
    </RepContext.Provider>
  );
}
