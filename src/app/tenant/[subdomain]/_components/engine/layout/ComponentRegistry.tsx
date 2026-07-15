"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// =============================================================================
// COMPONENT REGISTRY
// =============================================================================
// Maps JSON component types to React Components.
// Using Next.js dynamic imports for code splitting (crucial when 150+ components exist).
// =============================================================================

export const ComponentRegistry: Record<string, ComponentType<any>> = {
  // Hero Components
  HeroCenter: dynamic(() => import("../hero/HeroCenter").then(mod => mod.HeroCenter)),
  HeroSplit: dynamic(() => import("../hero/HeroSplit").then(mod => mod.HeroSplit)),
  
  // Catalog Components
  CoffeeCards: dynamic(() => import("../catalog/CoffeeCards").then(mod => mod.CoffeeCards)),
  FlavorWheel: dynamic(() => import("../catalog/FlavorWheel").then(mod => mod.FlavorWheel)),
  
  // About & Social
  AwardsTimeline: dynamic(() => import("../about/AwardsTimeline").then(mod => mod.AwardsTimeline)),
  TestimonialSlider: dynamic(() => import("../social/TestimonialSlider").then(mod => mod.TestimonialSlider)),
  
  // Content & Marketing
  JournalGrid: dynamic(() => import("../content/JournalGrid").then(mod => mod.JournalGrid)),
  NewsletterBar: dynamic(() => import("../marketing/NewsletterBar").then(mod => mod.NewsletterBar)),
  
  // AdvancedImage Component (from earlier)
  AdvancedImage: dynamic(() => import("../../themes/AdvancedImage").then(mod => mod.PremiumImageRenderer)),
};

// Fallback component for unregistered types
export function UnknownComponent({ type }: { type: string }) {
  return (
    <div className="p-10 border border-dashed border-red-500 bg-red-50 text-red-700 rounded-md text-center">
      ⚠️ Unknown component type: <strong>{type}</strong>
    </div>
  );
}
