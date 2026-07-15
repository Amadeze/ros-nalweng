"use client";

import React from "react";
import { RepSection, RepHeading, RepText } from "../components/PrimitiveRenderer";
import { motion } from "framer-motion";

// =============================================================================
// FLAVOR WHEEL
// =============================================================================

export function FlavorWheel({ headline = "Tasting Notes & Aromas", subheadline = "Explore the complex flavor profiles of our signature roasts." }) {
  // A simple SVG approximation of a flavor wheel
  const wheelSegments = [
    { color: "#E74C3C", label: "Fruity", angle: 0 },
    { color: "#F39C12", label: "Citrus", angle: 60 },
    { color: "#F1C40F", label: "Floral", angle: 120 },
    { color: "#27AE60", label: "Earthy", angle: 180 },
    { color: "#8E44AD", label: "Nutty", angle: 240 },
    { color: "#2C3E50", label: "Cocoa", angle: 300 },
  ];

  return (
    <div className="w-full bg-[var(--rep-surface)] py-20 overflow-hidden">
      <RepSection className="flex flex-col md:flex-row items-center gap-12 lg:gap-20">
        
        {/* Text Content */}
        <div className="flex-1 text-center md:text-left">
          <RepHeading level={2} className="mb-4">{headline}</RepHeading>
          <RepText size="lg" muted className="mb-8">{subheadline}</RepText>
          <div className="grid grid-cols-2 gap-4">
            {wheelSegments.map(seg => (
              <div key={seg.label} className="flex items-center gap-3">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="font-semibold text-[length:var(--rep-fs-sm)] uppercase tracking-wider">{seg.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Wheel Visual */}
        <div className="flex-1 w-full max-w-[400px] aspect-square relative">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
            className="w-full h-full rounded-full relative"
          >
            <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-2xl">
              {wheelSegments.map((seg, i) => {
                const startAngle = (i * 60) * (Math.PI / 180);
                const endAngle = ((i + 1) * 60) * (Math.PI / 180);
                const x1 = 100 + 100 * Math.cos(startAngle);
                const y1 = 100 + 100 * Math.sin(startAngle);
                const x2 = 100 + 100 * Math.cos(endAngle);
                const y2 = 100 + 100 * Math.sin(endAngle);
                
                return (
                  <path
                    key={seg.label}
                    d={`M 100 100 L ${x1} ${y1} A 100 100 0 0 1 ${x2} ${y2} Z`}
                    fill={seg.color}
                    className="opacity-80 hover:opacity-100 transition-opacity cursor-pointer stroke-white stroke-[2px]"
                  />
                );
              })}
              {/* Center hole */}
              <circle cx="100" cy="100" r="30" fill="var(--rep-surface)" />
            </svg>
          </motion.div>
          {/* Center text */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="font-bold text-[length:var(--rep-fs-xs)] tracking-widest text-[var(--rep-text)] uppercase text-center leading-tight">
              Flavor<br/>Profile
            </span>
          </div>
        </div>

      </RepSection>
    </div>
  );
}
