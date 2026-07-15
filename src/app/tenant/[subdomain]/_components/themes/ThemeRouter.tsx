"use client";

import React from "react";
import dynamic from "next/dynamic";
import { ThemeProps } from "./ThemeProps";

// =============================================================================
// THEME ROUTER (MATRIX ARCHITECTURE)
// =============================================================================
// Reads tenant.layoutStyle and loads the completely hardcoded theme.
// =============================================================================

// 1. The Heritage Craft (Classic & Artisanal)
// 2. Neo-Modernist (Sleek & Minimalist)
// 3. Cyber-Barista (High-Tech & Futuristic)
// 4. Botanical Laboratory (Organic & Eco-Friendly)
// 5. The Roaster's Diary (Editorial & Storytelling)
// 6. Liquid Symphony (Interactive & Sensory-Focused)
// 7. Industrial Alchemy (Gritty & Bold)
// 8. Coffee Club (Subscription & Community)
// 9. Luxury Reserve (Elite & Ultra-Premium)
// 1. The Heritage Craft (Classic & Artisanal)
const HeritageTheme = dynamic(() => import("./heritage/HeritageTheme").then(mod => mod.HeritageTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#F4F1EA] text-[#3E2723] font-serif uppercase tracking-widest text-xs">Loading Heritage Craft...</div> });

// 2. Neo-Modernist (Sleek & Minimalist)
const NeoModernTheme = dynamic(() => import("./neomodern/NeoModernTheme").then(mod => mod.NeoModernTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-white text-zinc-900 font-sans font-bold">Loading Modern Experience...</div> });

// 3. Cyber-Barista (High-Tech & Futuristic)
const CyberTheme = dynamic(() => import("./cyber/CyberTheme").then(mod => mod.CyberTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#050510] text-[#00FF41] font-mono font-bold">INITIATING...</div> });

// 4. Botanical Laboratory (Organic & Eco-Friendly)
const BotanicalTheme = dynamic(() => import("./botanical/BotanicalTheme").then(mod => mod.BotanicalTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#F0F4F1] text-[#2C4A3B] font-sans">Sprouting...</div> });

// 5. The Roaster's Diary (Editorial & Storytelling)
const EditorialTheme = dynamic(() => import("./editorial/EditorialTheme").then(mod => mod.EditorialTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#FAFAFA] text-[#111111] font-serif uppercase tracking-widest text-xs font-bold">Printing Issue...</div> });

// 6. Liquid Symphony (Interactive & Sensory-Focused)
const LiquidTheme = dynamic(() => import("./liquid/LiquidTheme").then(mod => mod.LiquidTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#0d0714] text-[#FF3B7C] font-sans font-black tracking-tighter">Preparing Symphony...</div> });

// 7. Industrial Alchemy (Gritty & Bold)
const IndustrialTheme = dynamic(() => import("./industrial/IndustrialTheme").then(mod => mod.IndustrialTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#1F1F1F] text-[#F5B041] font-sans font-black uppercase tracking-tighter">Firing up...</div> });

// 8. Coffee Club (Subscription & Community)
const ClubTheme = dynamic(() => import("./club/ClubTheme").then(mod => mod.ClubTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#FFFDF8] text-[#E67E22] font-sans font-black">Joining Club...</div> });

// 9. Luxury Reserve (Elite & Ultra-Premium)
const LuxuryTheme = dynamic(() => import("./luxury/LuxuryTheme").then(mod => mod.LuxuryTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#0A0A0A] text-[#D4AF37] font-serif uppercase tracking-[0.2em] text-xs">Loading Luxury Experience...</div> });

// 10. Playful Brew (Vibrant & Pop Art)
const PlayfulTheme = dynamic(() => import("./playful/PlayfulTheme").then(mod => mod.PlayfulTheme), { loading: () => <div className="w-full h-screen flex items-center justify-center bg-[#33CCFF] text-white font-sans font-black text-2xl uppercase">Popping...</div> });

export function ThemeRouter(props: ThemeProps) {
  const layoutStyle = props.tenant.layoutStyle?.toLowerCase() || "modern";
  
  // Customization mappings
  const colorMap: Record<string, string> = {
    amber: "#f59e0b",
    blue: "#3b82f6",
    emerald: "#10b981",
    rose: "#f43f5e",
    violet: "#8b5cf6",
    zinc: "#71717a",
  };
  const themePrimary = props.tenant.themeColor ? colorMap[props.tenant.themeColor] || colorMap.amber : undefined;
  
  const radiusMap: Record<string, string> = {
    none: "0px",
    sm: "4px",
    md: "8px",
    xl: "12px",
    full: "9999px",
  };
  const themeRadius = props.tenant.borderRadius ? radiusMap[props.tenant.borderRadius] || radiusMap.md : undefined;

  const fontMap: Record<string, string> = {
    sans: "ui-sans-serif, system-ui, sans-serif",
    serif: "ui-serif, Georgia, Cambria, Times New Roman, Times, serif",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, Courier New, monospace",
  };
  const themeFont = props.tenant.fontFamily ? fontMap[props.tenant.fontFamily] || fontMap.sans : undefined;

  // Render the selected theme
  const renderTheme = () => {
    switch (layoutStyle) {
      case "heritage": return <HeritageTheme {...props} />;
      case "neomodern": return <NeoModernTheme {...props} />;
      case "cyber": return <CyberTheme {...props} />;
      case "botanical": return <BotanicalTheme {...props} />;
      case "editorial": return <EditorialTheme {...props} />;
      case "liquid": return <LiquidTheme {...props} />;
      case "industrial": return <IndustrialTheme {...props} />;
      case "club": return <ClubTheme {...props} />;
      case "luxury": return <LuxuryTheme {...props} />;
      case "playful": return <PlayfulTheme {...props} />;

      // Fallbacks
      case "classic": return <LuxuryTheme {...props} />;
      case "vintage": return <HeritageTheme {...props} />;
      case "futuristic": return <CyberTheme {...props} />;
      case "minimalist": return <NeoModernTheme {...props} />;
      case "magazine": return <EditorialTheme {...props} />;
      case "organic": return <BotanicalTheme {...props} />;
      case "glass": return <LiquidTheme {...props} />;
      case "cinematic": return <NeoModernTheme {...props} />;
      case "zen": return <NeoModernTheme {...props} />;
      case "neobrutalism": return <EditorialTheme {...props} />;
      case "bento": return <NeoModernTheme {...props} />;
      case "modern":
      default: return <NeoModernTheme {...props} />;
    }
  };

  // Theme Mode Inversion Logic
  // Some themes are natively dark, others natively light. 
  // If the requested mode (isDark) differs from native mode, we apply a CSS invert filter.
  const nativeDarkThemes = ["cyber", "liquid", "industrial", "luxury"];
  const isNativeDark = nativeDarkThemes.includes(layoutStyle);
  
  const shouldInvert = (props.isDark && !isNativeDark) || (!props.isDark && isNativeDark);
  const filterStyle = shouldInvert ? 'invert(1) hue-rotate(180deg)' : 'none';

  return (
    <div 
      className={`rep-theme-wrapper w-full min-h-screen ${shouldInvert ? 'theme-inverted' : ''}`}
      style={{
        filter: filterStyle,
        ...(themePrimary && { '--theme-primary': themePrimary }),
        ...(themeRadius && { '--theme-radius': themeRadius }),
        ...(themeFont && { '--theme-font': themeFont, fontFamily: 'var(--theme-font)' }),
      } as React.CSSProperties}
    >
      {shouldInvert && (
        <style dangerouslySetInnerHTML={{ __html: `
          .theme-inverted img, .theme-inverted video {
            filter: invert(1) hue-rotate(180deg) !important;
          }
        `}} />
      )}
      {renderTheme()}
    </div>
  );
}
