"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Globe, Mail, ArrowRight, Heart } from "lucide-react";
import { TenantBrand } from "../themes/TenantBrand";
import { ThemeSkin } from "../themes/ThemeSkin";
import type { Tenant } from "@prisma/client";

interface FooterSectionProps {
  tenant: Tenant;
  footerText: string;
  igLink: string | null;
  emailLink: string | null;
  skin: ThemeSkin;
}

export function FooterSection({ tenant, footerText, igLink, emailLink, skin }: FooterSectionProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <motion.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="w-full bg-[#2c2420]"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Main Footer Content */}
        <div className="py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            {/* Brand Column */}
            <div className="lg:col-span-2 space-y-5">
              <div
                className="text-xl font-semibold text-white"
                style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
              >
                <TenantBrand tenant={tenant} fallback={tenant.name || "Roastery Portal"} />
              </div>
              <p
                className="text-sm text-[#c8956c]/50 leading-[1.75] max-w-sm"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                {footerText}
              </p>

              {/* Social Links */}
              <div className="flex gap-3">
                {igLink && (
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={igLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center text-[#c8956c]/40 hover:text-[#c8956c] hover:border-[#c8956c]/30 transition-all duration-300"
                  >
                    <Globe size={16} strokeWidth={1.5} />
                  </motion.a>
                )}
                {emailLink && (
                  <motion.a
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={emailLink}
                    className="w-10 h-10 rounded-2xl border border-white/10 flex items-center justify-center text-[#c8956c]/40 hover:text-[#c8956c] hover:border-[#c8956c]/30 transition-all duration-300"
                  >
                    <Mail size={16} strokeWidth={1.5} />
                  </motion.a>
                )}
              </div>
            </div>

            {/* Quick Links */}
            <div className="space-y-5">
              <h4
                className="font-medium text-[11px] text-[#c8956c]/40 uppercase tracking-[0.2em]"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                Navigate
              </h4>
              <nav className="space-y-3">
                {[
                  { id: "catalog", label: "Our Collection" },
                  { id: "testimonials", label: "Stories" },
                  { id: "faq", label: "FAQ" },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
                    className="block text-sm text-[#c8956c]/50 hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Newsletter */}
            <div className="space-y-5">
              <h4
                className="font-medium text-[11px] text-[#c8956c]/40 uppercase tracking-[0.2em]"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                Stay in the Loop
              </h4>
              <p
                className="text-xs text-[#c8956c]/40 leading-[1.7]"
                style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
              >
                Updates on new arrivals, stories from the farm, and offers reserved for our community.
              </p>

              {subscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 p-3 rounded-2xl bg-[#4a7c59]/10 border border-[#4a7c59]/20 text-[#4a7c59] text-sm font-medium"
                  style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                >
                  <Heart size={14} className="fill-current" />
                  <span>Thank you for joining us.</span>
                </motion.div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="flex-1 px-4 py-2.5 text-sm rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-[#c8956c]/30 focus:outline-none focus:border-[#c8956c]/30 focus:ring-1 focus:ring-[#c8956c]/10 transition-all duration-300"
                    style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className="px-4 py-2.5 rounded-2xl bg-[#c8956c]/20 text-[#c8956c] hover:bg-[#c8956c]/30 transition-all duration-300"
                  >
                    <ArrowRight size={14} strokeWidth={1.5} />
                  </motion.button>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p
              className="text-xs text-[#c8956c]/30"
              style={{ fontFamily: "'Playfair Display', 'Source Serif 4', Georgia, serif" }}
            >
              &copy; {new Date().getFullYear()} {tenant.name || "Roastery Portal"}. Crafted with care.
            </p>
            <p
              className="text-xs text-[#c8956c]/30"
              style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif" }}
            >
              Powered by <span className="font-medium text-[#c8956c]/50">Roastery OS</span>
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
