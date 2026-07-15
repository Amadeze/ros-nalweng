"use client";

import React from "react";
import { RepSection, RepHeading, RepText, RepCard, RepButton } from "../components/PrimitiveRenderer";

// =============================================================================
// COFFEE CARDS (CATALOG)
// =============================================================================

export interface CoffeeItem {
  id: string;
  name: string;
  origin: string;
  roastLevel: "Light" | "Medium" | "Dark";
  tastingNotes: string[];
  price: string;
  imageUrl: string;
}

export interface CoffeeCardsProps {
  headline?: string;
  subheadline?: string;
  items?: CoffeeItem[];
  products?: any[]; // Products from DB
  tenant?: any;
}

const defaultItems: CoffeeItem[] = [
  {
    id: "1",
    name: "Ethiopia Yirgacheffe",
    origin: "Ethiopia",
    roastLevel: "Light",
    tastingNotes: ["Jasmine", "Bergamot", "Blueberry"],
    price: "$22.00",
    imageUrl: "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "2",
    name: "Colombia Supremo",
    origin: "Colombia",
    roastLevel: "Medium",
    tastingNotes: ["Chocolate", "Caramel", "Orange"],
    price: "$18.00",
    imageUrl: "https://images.unsplash.com/photo-1611162458324-aae1eb4129a4?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: "3",
    name: "Sumatra Mandheling",
    origin: "Indonesia",
    roastLevel: "Dark",
    tastingNotes: ["Earthy", "Spices", "Dark Cocoa"],
    price: "$20.00",
    imageUrl: "https://images.unsplash.com/photo-1587734195503-904fca47e0e9?auto=format&fit=crop&q=80&w=600"
  }
];

export function CoffeeCards({
  headline = "Featured Roasts",
  subheadline = "Discover our meticulously curated selection of single-origin beans.",
  items,
  products = []
}: CoffeeCardsProps) {
  
  // Map Prisma products if available, otherwise fallback to provided items or defaultItems
  const displayItems: CoffeeItem[] = products && products.length > 0 
    ? products.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map(p => ({
        id: p.id,
        name: p.name,
        origin: p.origin || "Blend",
        roastLevel: (p.roastLevel ? p.roastLevel.charAt(0) + p.roastLevel.slice(1).toLowerCase() : "Medium") as any,
        tastingNotes: p.description ? p.description.split(",").slice(0, 3) : ["Premium Quality"],
        price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
        imageUrl: p.imageUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=600"
      }))
    : (items || defaultItems);

  return (
    <div className="w-full bg-[var(--rep-bg)] py-12">
      <RepSection>
        {/* Header */}
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <RepHeading level={1} className="mb-4">{headline}</RepHeading>
          <RepText size="lg" muted>{subheadline}</RepText>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {displayItems.map((item) => (
            <RepCard key={item.id} padding="none" className="group flex flex-col">
              <div className="relative aspect-square overflow-hidden bg-slate-100">
                <img 
                  src={item.imageUrl} 
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 bg-[var(--rep-surface)]/90 backdrop-blur-sm px-3 py-1 rounded-full text-[length:var(--rep-fs-xs)] font-medium text-[var(--rep-text)] uppercase tracking-wider">
                  {item.origin}
                </div>
              </div>
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <RepHeading level={4} className="font-semibold">{item.name}</RepHeading>
                  <span className="font-semibold text-[length:var(--rep-fs-lg)] text-[var(--rep-text)]">{item.price}</span>
                </div>
                
                <RepText size="sm" muted className="mb-4">
                  {item.roastLevel} Roast
                </RepText>
                
                <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                  {item.tastingNotes.map((note, i) => (
                    <span key={i} className="px-2 py-1 bg-[var(--rep-border)] text-[var(--rep-text-muted)] rounded-md text-[length:var(--rep-fs-xs)] uppercase tracking-wider">
                      {note}
                    </span>
                  ))}
                </div>
                
                <RepButton variant="outline" fullWidth>
                  Add to Cart
                </RepButton>
              </div>
            </RepCard>
          ))}
        </div>
      </RepSection>
    </div>
  );
}
