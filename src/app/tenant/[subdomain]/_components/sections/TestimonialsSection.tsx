"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";
import { ThemeSkin } from "../themes/ThemeSkin";

interface TestimonialsSectionProps {
  testimonials: { name: string; role: string; text: string; rating: number }[];
  skin: ThemeSkin;
}

export function TestimonialsSection({ testimonials, skin }: TestimonialsSectionProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = () => {
    intervalRef.current = setInterval(() => {
      setDirection(1);
      setCurrent(prev => (prev + 1) % testimonials.length);
    }, 6000);
  };

  useEffect(() => {
    if (testimonials.length > 1) startAutoplay();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [testimonials.length]);

  const goTo = (idx: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(idx > current ? 1 : -1);
    setCurrent(idx);
    startAutoplay();
  };

  const goNext = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(1);
    setCurrent(prev => (prev + 1) % testimonials.length);
    startAutoplay();
  };

  const goPrev = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    setDirection(-1);
    setCurrent(prev => (prev - 1 + testimonials.length) % testimonials.length);
    startAutoplay();
  };

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 200 : -200, opacity: 0, rotate: dir > 0 ? -1 : 1 }),
    center: { x: 0, opacity: 1, rotate: 0 },
    exit: (dir: number) => ({ x: dir > 0 ? -200 : 200, opacity: 0, rotate: dir > 0 ? 1 : -1 }),
  };

  const t = testimonials[current];

  return (
    <section id="testimonials" className="w-full bg-[#faf8f5]">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#c8956c]" />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8b7e74]"
              style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              Stories From Our Community
            </span>
            <div className="w-12 h-[1px] bg-[#c8956c]" />
          </div>
          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-[#2c2420]"
            style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
          >
            Every Cup, a Conversation
          </h2>
        </motion.div>

        {/* Carousel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative"
        >
          {/* Main Testimonial Card */}
          <div className="relative overflow-hidden rounded-[24px] bg-white border border-[#e8e0d8] p-8 md:p-12 min-h-[300px] shadow-[0_4px_24px_rgba(44,36,32,0.03)]">
            {/* Large decorative quote mark */}
            <div
              className="absolute top-6 right-8 md:top-8 md:right-12 text-[120px] md:text-[160px] leading-none text-[#c8956c]/10 select-none pointer-events-none"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              &ldquo;
            </div>

            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-8 relative z-10"
              >
                {/* Stars */}
                <div className="flex gap-1">
                  {[...Array(t.rating || 5)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-[#c8956c] text-[#c8956c]" strokeWidth={1} />
                  ))}
                </div>

                {/* Quote */}
                <p
                  className="text-xl md:text-2xl text-[#2c2420] italic leading-[1.6] max-w-2xl"
                  style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                >
                  &ldquo;{t.text}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center gap-4 pt-2">
                  {/* Avatar */}
                  <div className="w-12 h-12 rounded-full bg-[#f0ebe5] border-2 border-[#e8e0d8] flex items-center justify-center">
                    <span
                      className="text-sm font-semibold text-[#6b4423]"
                      style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                    >
                      {t.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h4
                      className="font-semibold text-sm text-[#2c2420]"
                      style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                    >
                      {t.name}
                    </h4>
                    <p
                      className="text-xs text-[#8b7e74]"
                      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                    >
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {testimonials.length > 1 && (
            <div className="flex items-center justify-between mt-8">
              {/* Dots */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="group"
                    aria-label={`Go to testimonial ${i + 1}`}
                  >
                    <div className={`h-[3px] rounded-full transition-all duration-500 ${
                      i === current
                        ? "w-10 bg-[#6b4423]"
                        : "w-3 bg-[#e8e0d8] group-hover:bg-[#c8956c]/50"
                    }`} />
                  </button>
                ))}
              </div>

              {/* Arrows */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goPrev}
                  className="w-10 h-10 rounded-2xl border border-[#e8e0d8] flex items-center justify-center text-[#8b7e74] hover:text-[#2c2420] hover:border-[#c8956c]/40 transition-all duration-300 bg-white"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={goNext}
                  className="w-10 h-10 rounded-2xl border border-[#e8e0d8] flex items-center justify-center text-[#8b7e74] hover:text-[#2c2420] hover:border-[#c8956c]/40 transition-all duration-300 bg-white"
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </motion.button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
