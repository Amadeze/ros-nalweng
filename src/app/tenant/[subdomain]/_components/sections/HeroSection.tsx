"use client";

import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, MessageCircle } from "lucide-react";
import { ThemeSkin } from "../themes/ThemeSkin";

interface HeroSectionProps {
  heroText: string;
  aboutText: string;
  bgImage: string;
  waLink: string;
  skin: ThemeSkin;
}

export function HeroSection({ heroText, aboutText, bgImage, waLink, skin }: HeroSectionProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.section
      ref={ref}
      className="relative w-full min-h-[90vh] md:min-h-screen flex items-center overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        {/* Warm gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#faf8f5] via-[#faf8f5]/80 to-[#f5ede4]" />
        {bgImage && (
          <img
            src={bgImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-30"
            style={{ filter: "sepia(25%) saturate(85%) brightness(105%)" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
        )}
        {/* Bottom-to-top warm gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-[60vh] bg-gradient-to-t from-[#faf8f5] to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-10 w-full max-w-6xl mx-auto px-5 sm:px-8 py-28 md:py-36"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Text Column */}
          <div className="space-y-8">
            {/* Decorative thin line */}
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: 48 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="h-[1px] bg-[#c8956c]"
            />

            {skin.heroBadge && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                {skin.heroBadge}
              </motion.div>
            )}

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] text-[#2c2420]"
              style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
            >
              {heroText}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
              className="text-lg md:text-xl text-[#8b7e74] leading-[1.75] max-w-xl"
              style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              {aboutText}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-wrap gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-medium bg-[#6b4423] text-white hover:bg-[#5a3920] transition-all duration-300 shadow-[0_4px_16px_rgba(107,68,35,0.2)]"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                Explore Our Collection
                <ArrowRight size={16} strokeWidth={1.5} />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-medium border border-[#e8e0d8] text-[#6b4423] hover:border-[#6b4423] hover:bg-[#6b4423]/5 transition-all duration-300"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                <MessageCircle size={16} strokeWidth={1.5} />
                Get in Touch
              </motion.a>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <div className="relative overflow-hidden rounded-[24px] shadow-[0_16px_48px_rgba(44,36,32,0.1)]">
              {bgImage && (
                <img
                  src={bgImage}
                  alt="Premium Coffee"
                  className="w-full aspect-[4/3] object-cover"
                  style={{ filter: "sepia(15%) saturate(90%)" }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                />
              )}
              {/* Warm overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#2c2420]/10 to-transparent" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#faf8f5] to-transparent z-10" />
    </motion.section>
  );
}
