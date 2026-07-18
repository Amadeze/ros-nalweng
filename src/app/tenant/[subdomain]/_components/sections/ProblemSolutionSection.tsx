"use client";

import React from "react";
import { motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { ThemeSkin } from "../themes/ThemeSkin";

interface ProblemSolutionSectionProps {
  problemStmt: string;
  solutionStmt: string;
  skin: ThemeSkin;
}

export function ProblemSolutionSection({ problemStmt, solutionStmt, skin }: ProblemSolutionSectionProps) {
  return (
    <section className="w-full bg-[#faf8f5]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        {/* Section Label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-16"
        >
          <span
            className="inline-flex items-center gap-2 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-[#8b7e74] border border-[#e8e0d8] rounded-full"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
          >
            The Challenge &amp; Our Answer
          </span>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-stretch relative">
          {/* Problem Card */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
          >
            <div className="relative p-8 md:p-10 rounded-[20px] bg-[#f0ebe5] h-full">
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] border border-[#e8e0d8] flex items-center justify-center bg-white/60">
                    <AlertCircle className="w-5 h-5 text-[#8b7e74]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-semibold text-[#2c2420]"
                      style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                    >
                      The Challenge
                    </h3>
                    <p
                      className="text-xs text-[#8b7e74] uppercase tracking-[0.15em] mt-1 font-medium"
                      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                    >
                      What You Face
                    </p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[#e8e0d8]" />

                <p
                  className="text-[#8b7e74] leading-[1.8] text-base italic"
                  style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                >
                  &ldquo;{problemStmt}&rdquo;
                </p>
              </div>
            </div>
          </motion.div>

          {/* Arrow divider (desktop) */}
          <div className="hidden lg:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <motion.div
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="w-12 h-12 rounded-full bg-[#faf8f5] border border-[#e8e0d8] flex items-center justify-center shadow-sm"
            >
              <span className="text-[#c8956c] text-lg" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>&rarr;</span>
            </motion.div>
          </div>

          {/* Solution Card */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
            className="relative"
          >
            <div className="relative p-8 md:p-10 rounded-[20px] bg-white border-l-[3px] border-l-[#6b4423] h-full shadow-[0_4px_24px_rgba(44,36,32,0.04)]">
              <div className="relative space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-[14px] border border-[#4a7c59]/20 flex items-center justify-center bg-[#4a7c59]/5">
                    <CheckCircle2 className="w-5 h-5 text-[#4a7c59]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3
                      className="text-xl font-semibold text-[#2c2420]"
                      style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                    >
                      Our Answer
                    </h3>
                    <p
                      className="text-xs text-[#8b7e74] uppercase tracking-[0.15em] mt-1 font-medium"
                      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                    >
                      The Solution
                    </p>
                  </div>
                </div>

                <div className="w-full h-[1px] bg-[#e8e0d8]" />

                <p
                  className="text-[#8b7e74] leading-[1.8]"
                  style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                >
                  {solutionStmt}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
