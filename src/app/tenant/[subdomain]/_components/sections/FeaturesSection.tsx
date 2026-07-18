"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  Coffee, Target, Zap, Fingerprint, Leaf, ShieldCheck,
  Award, Cpu, Globe,
} from "lucide-react";
import { ThemeSkin } from "../themes/ThemeSkin";

interface FeaturesSectionProps {
  features: { title: string; desc: string; iconName: string }[];
  iconStroke: number;
  skin: ThemeSkin;
}

const ICON_MAP: Record<string, React.ElementType> = {
  target: Target,
  zap: Zap,
  fingerprint: Fingerprint,
  leaf: Leaf,
  shieldcheck: ShieldCheck,
  award: Award,
  cpu: Cpu,
  globe: Globe,
};

function renderIcon(name: string, stroke: number) {
  const Icon = ICON_MAP[name.toLowerCase()] || Coffee;
  return <Icon className="w-5 h-5" strokeWidth={stroke || 1.5} />;
}

export function FeaturesSection({ features, iconStroke, skin }: FeaturesSectionProps) {
  return (
    <section className="w-full bg-white">
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
            <div className="w-12 h-[1px] bg-[#c8956c]" />
            <span
              className="text-[11px] font-medium uppercase tracking-[0.2em] text-[#8b7e74]"
              style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              What We Offer
            </span>
            <div className="w-12 h-[1px] bg-[#c8956c]" />
          </div>

          <h2
            className="text-3xl md:text-4xl font-semibold tracking-tight text-[#2c2420] mb-4"
            style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
          >
            Crafted With Intention
          </h2>
          <p
            className="text-[#8b7e74] text-base leading-[1.75]"
            style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
          >
            Every detail is considered. Every step, purposeful.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {features.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotate: -1 }}
              whileInView={{ opacity: 1, y: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -6, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }}
              className="group"
            >
              <div className="relative p-7 md:p-8 rounded-[20px] bg-white border border-[#e8e0d8] transition-all duration-500 group-hover:shadow-[0_12px_32px_rgba(107,68,35,0.06)] group-hover:border-[#c8956c]/30 h-full">
                {/* Icon */}
                <div className="w-11 h-11 rounded-[12px] bg-[#6b4423]/8 flex items-center justify-center text-[#c8956c] mb-5 group-hover:bg-[#6b4423] group-hover:text-white transition-all duration-400">
                  {renderIcon(f.iconName, iconStroke)}
                </div>

                {/* Content */}
                <div>
                  <h3
                    className="text-lg font-semibold text-[#2c2420] mb-2"
                    style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
                  >
                    {f.title}
                  </h3>
                  <p
                    className="text-sm text-[#8b7e74] leading-[1.75]"
                    style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                  >
                    {f.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
