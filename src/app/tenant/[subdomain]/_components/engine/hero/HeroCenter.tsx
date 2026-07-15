"use client";

import React from "react";
import { RepSection, RepHeading, RepText, RepButton } from "../components/PrimitiveRenderer";

// =============================================================================
// HERO CENTER
// =============================================================================

export interface HeroCenterProps {
  headline?: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  backgroundImageUrl?: string;
  tenant?: any;
}

export function HeroCenter({
  headline = "Experience the Perfect Roast",
  subheadline = "Artisanal coffee sourced from the finest farms around the globe, roasted to perfection.",
  ctaText = "Shop Now",
  backgroundImageUrl = "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000",
  tenant
}: HeroCenterProps) {
  
  const displayHeadline = tenant?.heroText || headline;
  const displayBgImage = tenant?.heroImageUrl || backgroundImageUrl;
  return (
    <div className="relative w-full min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image with Parallax & Overlay */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${displayBgImage})` }}
      />
      <div className="absolute inset-0 z-1 bg-black/40 backdrop-blur-[2px]" />
      
      {/* Content */}
      <RepSection className="relative z-10 text-center max-w-4xl text-white">
        <RepHeading level="display" className="mb-6 drop-shadow-xl text-white">
          {displayHeadline}
        </RepHeading>
        <RepText size="lg" className="mb-10 opacity-90 font-light max-w-2xl mx-auto text-white">
          {subheadline}
        </RepText>
        <div className="flex justify-center gap-4">
          <RepButton size="lg" variant="primary">
            {ctaText}
          </RepButton>
          <RepButton size="lg" variant="outline" className="text-white border-white hover:bg-white hover:text-black">
            Our Story
          </RepButton>
        </div>
      </RepSection>
    </div>
  );
}
