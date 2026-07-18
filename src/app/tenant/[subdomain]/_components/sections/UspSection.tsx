"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ShieldCheck, Truck, Clock, FileCheck, Target, Users } from "lucide-react";
import { ThemeSkin } from "../themes/ThemeSkin";

interface UspSectionProps {
  uspStmt: string;
  skin: ThemeSkin;
}

function AnimatedCounter({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const duration = 1500;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [inView, target]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const stats = [
  { value: 99, suffix: "%", label: "Roast Consistency", icon: Target },
  { value: 150, suffix: "+", label: "Active Partners", icon: Users },
  { value: 24, suffix: "h", label: "Fast Fulfillment", icon: Clock },
  { value: 0, suffix: "", label: "Quality Guarantee", icon: ShieldCheck },
];

const commitments = [
  { icon: Truck, text: "Scheduled weekly delivery, straight to your cafe's door" },
  { icon: Clock, text: "Preserved freshness with one-way degassing valves" },
  { icon: FileCheck, text: "Transparent roasting date on every single bag" },
];

export function UspSection({ uspStmt, skin }: UspSectionProps) {
  return (
    <section className="w-full bg-[#2c2420]">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-20 md:py-28">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          {/* Decorative line */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-[1px] bg-[#c8956c]/40" />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#c8956c]/70"
              style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              Why Us
            </span>
            <div className="w-12 h-[1px] bg-[#c8956c]/40" />
          </div>

          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4"
            style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
          >
            A Partnership Built on Craft
          </h2>
          <p
            className="text-[#c8956c]/70 text-base leading-[1.75]"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
          >
            {uspStmt}
          </p>
        </motion.div>

        {/* Stats Bar — coffee bag label feel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16"
        >
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="text-center p-6 rounded-[20px] border border-white/10"
            >
              <div className="w-10 h-10 rounded-[12px] border border-[#c8956c]/20 flex items-center justify-center mx-auto mb-4">
                <stat.icon className="w-4 h-4 text-[#c8956c]" strokeWidth={1.5} />
              </div>
              <div
                className="text-3xl md:text-4xl font-semibold text-white mb-1"
                style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
              >
                <AnimatedCounter target={stat.value} suffix={stat.suffix} />
              </div>
              <p
                className="text-[11px] text-[#c8956c]/50 uppercase tracking-[0.15em] font-medium"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                {stat.label}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust & Commitments */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quality Guarantee Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="p-8 rounded-[20px] border border-white/10 h-full">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-[14px] border border-[#c8956c]/20 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-[#c8956c]" strokeWidth={1.5} />
                </div>
                <div>
                  <h3
                    className="text-lg font-semibold text-white"
                    style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                  >
                    Quality Guarantee
                  </h3>
                  <p
                    className="text-[11px] text-[#c8956c]/50 uppercase tracking-[0.15em] mt-0.5 font-medium"
                    style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                  >
                    Our Promise
                  </p>
                </div>
              </div>
              <p
                className="text-[#c8956c]/60 leading-[1.75] text-sm"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                Every batch that falls short of our standard is replaced, <strong className="text-white">100%, no questions asked</strong>. We stand behind our craft without conditions.
              </p>
            </div>
          </motion.div>

          {/* Commitments List */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            <div className="p-8 rounded-[20px] border border-white/10 h-full">
              <h3
                className="text-lg font-semibold text-white mb-6"
                style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
              >
                Our Commitments
              </h3>
              <div className="space-y-5">
                {commitments.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-9 h-9 rounded-[10px] border border-[#c8956c]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-[#c8956c]" strokeWidth={1.5} />
                    </div>
                    <p
                      className="text-sm text-[#c8956c]/60 leading-[1.75] pt-1"
                      style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                    >
                      {item.text}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
