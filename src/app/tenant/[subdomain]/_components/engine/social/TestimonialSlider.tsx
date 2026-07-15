"use client";

import React, { useState } from "react";
import { RepSection, RepHeading, RepText, RepCard } from "../components/PrimitiveRenderer";
import { motion, AnimatePresence } from "framer-motion";

// =============================================================================
// TESTIMONIAL SLIDER
// =============================================================================

interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
}

const defaultTestimonials: Testimonial[] = [
  { id: "1", quote: "The most consistent and flavorful beans we've ever pulled. It completely transformed our espresso program.", author: "Sarah Jenkins", role: "Head Barista, The Daily Grind" },
  { id: "2", quote: "An absolute masterclass in roasting. The attention to detail in their single-origins is unparalleled in the industry.", author: "Marcus Thorne", role: "Coffee Review Magazine" },
  { id: "3", quote: "Partnering with them was the best business decision we made. The quality speaks for itself every single morning.", author: "Elena Rostova", role: "Owner, Morning Culture Cafe" },
];

export function TestimonialSlider({ 
  headline = "What They Say", 
  testimonials = defaultTestimonials 
}) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  const prev = () => setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  return (
    <div className="w-full bg-[var(--rep-bg)] py-20">
      <RepSection className="max-w-4xl">
        <div className="text-center mb-12">
          <RepHeading level={3}>{headline}</RepHeading>
        </div>

        <div className="relative">
          <RepCard padding="lg" className="text-center relative min-h-[250px] flex flex-col justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <span className="text-[length:var(--rep-fs-4xl)] text-[var(--rep-primary)] opacity-20 absolute top-4 left-6">"</span>
                <RepText size="lg" className="italic mb-8 relative z-10 font-medium">
                  "{testimonials[currentIndex].quote}"
                </RepText>
                <div>
                  <RepHeading level={5}>{testimonials[currentIndex].author}</RepHeading>
                  <RepText size="sm" muted>{testimonials[currentIndex].role}</RepText>
                </div>
              </motion.div>
            </AnimatePresence>
          </RepCard>

          {/* Controls */}
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={prev}
              className="w-10 h-10 rounded-full border border-[var(--rep-border)] flex items-center justify-center text-[var(--rep-text)] hover:bg-[var(--rep-surface)] hover:shadow-sm transition-all"
            >
              ←
            </button>
            <div className="flex items-center gap-2">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${idx === currentIndex ? 'bg-[var(--rep-primary)] w-6' : 'bg-[var(--rep-border)]'}`}
                />
              ))}
            </div>
            <button 
              onClick={next}
              className="w-10 h-10 rounded-full border border-[var(--rep-border)] flex items-center justify-center text-[var(--rep-text)] hover:bg-[var(--rep-surface)] hover:shadow-sm transition-all"
            >
              →
            </button>
          </div>
        </div>
      </RepSection>
    </div>
  );
}
