"use client";

import React from "react";
import { RepSection, RepHeading, RepText } from "../components/PrimitiveRenderer";
import { motion } from "framer-motion";
import { useRepMotion } from "../motion/MotionEngine";

// =============================================================================
// AWARDS TIMELINE
// =============================================================================

interface Award {
  year: string;
  title: string;
  description: string;
}

const defaultAwards: Award[] = [
  { year: "2026", title: "Golden Bean Gold Medal", description: "Awarded for our signature espresso blend in the milk-based category." },
  { year: "2025", title: "Cup of Excellence", description: "Top 10 placement for our directly sourced Panama Geisha." },
  { year: "2023", title: "Best New Roaster", description: "National recognition for sustainable sourcing and innovative roasting techniques." },
];

export function AwardsTimeline({ 
  headline = "Our Legacy", 
  subheadline = "A testament to our relentless pursuit of perfection.", 
  awards = defaultAwards 
}) {
  const motionContext = useRepMotion();

  return (
    <div className="w-full bg-[var(--rep-bg)] py-20">
      <RepSection>
        <div className="text-center mb-16 max-w-2xl mx-auto">
          <RepHeading level={2} className="mb-4">{headline}</RepHeading>
          <RepText size="lg" muted>{subheadline}</RepText>
        </div>

        <div className="relative max-w-3xl mx-auto">
          {/* Vertical Line */}
          <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-[2px] bg-[var(--rep-border)] -translate-x-1/2" />

          {awards.map((award, index) => (
            <motion.div 
              key={award.year}
              variants={motionContext.variants.fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              className={`relative flex flex-col md:flex-row items-start md:items-center justify-between mb-12 last:mb-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}
            >
              {/* Center Dot */}
              <div className="absolute left-[20px] md:left-1/2 w-4 h-4 rounded-full bg-[var(--rep-primary)] shadow-[var(--rep-shadow)] -translate-x-1/2 z-10 top-[24px] md:top-1/2 md:-translate-y-1/2" />
              
              {/* Content */}
              <div className="w-full pl-12 md:pl-0 md:w-[45%]">
                <div className={`p-6 bg-[var(--rep-surface)] rounded-[var(--rep-radius)] border border-[var(--rep-border)] shadow-[var(--rep-shadow)] text-left ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <span className="inline-block px-3 py-1 bg-[var(--rep-primary)] text-[var(--rep-surface)] text-[length:var(--rep-fs-xs)] font-bold rounded-md mb-3">
                    {award.year}
                  </span>
                  <RepHeading level={4} className="mb-2">{award.title}</RepHeading>
                  <RepText size="sm" muted>{award.description}</RepText>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </RepSection>
    </div>
  );
}
