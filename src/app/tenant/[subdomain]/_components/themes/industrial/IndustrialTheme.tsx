"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Flame, Zap, Package, Shield, Settings, ChevronDown, Check, ArrowRight, Plus, Minus } from "lucide-react";

// =============================================================================
// TEMA 7: INDUSTRIAL ALCHEMY (GRITTY & BOLD)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function IndustrialTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Forged in Fire.";
  const aboutText = aText || tenant?.aboutText || "Raw. Authentic. Uncompromising. We roast coffee for those who grind harder.";
  
  const problemStmt = tenant?.problemStatement || "Most commercial coffee is weak, over-processed, and lacks the punch you need to fuel your grind.";
  const solutionStmt = tenant?.solutionStatement || "We engineer high-octane roasts using heavy-duty machinery. Maximum extraction, zero compromise.";
  const uspStmt = tenant?.uspText || "Built for performance. Our beans are rigorously tested for consistency and strength.";
  
  const defaultFeatures = [
    { title: "Iron Clad Roasting", desc: "Heavy cast-iron drums for intense heat retention.", iconName: "Flame" },
    { title: "Precision Tuning", desc: "Engineered roast profiles for maximum yield.", iconName: "Wrench" },
    { title: "High Octane", desc: "Sourced specifically for body and caffeine density.", iconName: "Zap" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Marcus T.", role: "Head Roaster", text: "Built like a tank. The flavor hits you straight away.", rating: 5 },
    { name: "Iron & Steel Co.", role: "Partner Cafe", text: "Our customers demand strong coffee. This delivers every single time.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "Do you supply industrial volumes?", answer: "Yes. We handle large-scale wholesale for heavy-traffic operations." },
    { question: "What espresso machine pairs best?", answer: "Any commercial-grade multi-boiler system that can maintain 9 bars of pressure." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "THE GOODS";
  const subtitle = catalogSubtitle || "INVENTORY";
  const footer = footerText || tenant?.footerText || "EST. 2024. ROASTED WITH IRON AND GRIT.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1524350876685-274059332603?auto=format&fit=crop&q=80&w=2000"; // Machine / Steel
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "flame": return <Flame className="w-10 h-10 text-[var(--theme-primary,#F5B041)]" />;
      case "wrench": return <Wrench className="w-10 h-10 text-[var(--theme-primary,#F5B041)]" />;
      case "zap": return <Zap className="w-10 h-10 text-[var(--theme-primary,#F5B041)]" strokeWidth={iconStroke || 2} />;
      case "settings": return <Settings className="w-10 h-10 text-[var(--theme-primary,#F5B041)]" />;
      default: return <Package className="w-10 h-10 text-[var(--theme-primary,#F5B041)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]  selection:bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] selection:text-[#1F1F1F]">
      
      {/* Gritty Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.06] mix-blend-overlay" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/concrete-wall.png")' }} 
      />

      {/* Navigation - Stencil/Industrial */}
      <header className="fixed top-0 w-full bg-[#1F1F1F] flex justify-between items-center border-b-4 border-[#333] z-40 px-4 md:px-6 py-4">
        <div className="text-2xl md:text-3xl font-black tracking-tighter uppercase  text-[var(--theme-primary,#F5B041)]">
          {tenant?.name || "STEEL ROASTERS"}
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsCartOpen(true)} className="text-sm uppercase font-black tracking-widest text-[var(--theme-primary,#F5B041)] border-2 border-[var(--theme-primary,#F5B041)] px-4 py-2 hover:bg-[var(--theme-primary,#F5B041)] hover:text-[#1F1F1F] transition-colors">
            CART ({cart?.items?.length || 0})
          </button>
        </div>
      </header>

      <main className="pt-24">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full h-[calc(100vh-6rem)] flex flex-col px-4 md:px-6">
          <div className="flex-1 flex flex-col md:flex-row relative z-10 h-full">
            
            <div className="flex-1 flex flex-col justify-center pr-8 py-12 order-2 md:order-1 h-full">
              <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
                <div className="inline-block bg-[var(--theme-primary,#F5B041)] text-[#1F1F1F] font-black uppercase text-xs tracking-widest px-3 py-1 mb-6">
                  HEAVY DUTY ROASTING
                </div>
                <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl lg:text-[7rem] font-black uppercase tracking-tighter leading-[0.85] mb-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" style={{ textShadow: '4px 4px 0px #333' }}>
                  {heroText}
                </h1>
                <p className="text-xl font-bold text-[#888] max-w-md mb-10 border-l-4 border-[var(--theme-primary,#F5B041)] pl-4">
                  {aboutText}
                </p>
                
                <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-transparent border-4 border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-black uppercase tracking-widest px-4 md:px-8 py-4 hover:bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] hover:text-[#1F1F1F] transition-all transform hover:translate-x-2 hover:-translate-y-2 hover:shadow-[-8px_8px_0_#F5B041]">
                  ACQUIRE BEANS
                </button>
              </motion.div>
            </div>

            <div className="flex-1 relative hidden md:block border-l-4 border-[#333] h-full order-1 md:order-2">
              <img src={bgImage} alt="Industrial Roaster" className="w-full h-full object-cover filter grayscale contrast-125 brightness-75" />
              
              {/* Caution tape decoration */}
              <div className="absolute top-10 -left-16 w-64 h-8 bg-[var(--theme-primary,#F5B041)] -rotate-45 flex items-center justify-center overflow-hidden border-y-4 border-black rounded-[var(--theme-radius)]">
                <div className="text-black font-black text-xs tracking-widest whitespace-nowrap">
                  CAUTION • HOT • CAUTION • HOT • CAUTION
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t-4 border-[#333] bg-[#161616]">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-12">
            <div className="flex-1 bg-[#1F1F1F] border-2 border-[#333] p-8 relative rounded-[var(--theme-radius)]">
              <div className="absolute top-0 right-0 bg-[#333] text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]  text-xs px-2 py-1">ERROR_LOG</div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-black uppercase tracking-tighter text-[#888] mb-4">THE DEFECT</motion.h2>
              <p className="text-xl font-bold text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed">"{problemStmt}"</p>
            </div>
            <div className="flex-1 bg-[var(--theme-primary,#F5B041)] border-2 border-[var(--theme-primary,#F5B041)] p-8 relative text-[#1F1F1F] rounded-[var(--theme-radius)]">
              <div className="absolute top-0 right-0 bg-[#1F1F1F] text-[var(--theme-primary,#F5B041)]  text-xs px-2 py-1">SYS_UPDATE</div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-black uppercase tracking-tighter mb-4">THE FIX</motion.h2>
              <p className="text-xl font-bold leading-relaxed">{solutionStmt}</p>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t-4 border-[#333] bg-[#1F1F1F]">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-6xl font-black uppercase tracking-tighter text-[#333] mb-2">SYSTEM SPECS</motion.h2>
              <div className="w-24 h-2 bg-[var(--theme-primary,#F5B041)]"></div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feat: any, idx: number) => (
                <div key={idx} className="border-2 border-[#333] p-8 hover:border-[var(--theme-primary,#F5B041)] transition-colors group">
                  <div className="mb-6">{renderIcon(feat.iconName)}</div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-4">{feat.title}</h3>
                  <p className="text-[#888] font-bold">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t-4 border-[#333] bg-[#161616]">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[var(--theme-primary,#F5B041)] mb-12 text-center">FIELD REPORTS</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testi: any, idx: number) => (
                <div key={idx} className="bg-[#1F1F1F] border-l-4 border-[var(--theme-primary,#F5B041)] p-6">
                  <div className="flex gap-1 mb-4">
                    {Array.from({length: 5}).map((_, i) => (
                      <div key={i} className={`w-3 h-3 bg-[var(--theme-primary,#F5B041)] ${i >= (testi.rating || 5) ? 'opacity-20' : ''}`} />
                    ))}
                  </div>
                  <p className="text-lg font-bold text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6 uppercase">"{testi.text}"</p>
                  <div className=" text-sm">
                    <span className="text-[var(--theme-primary,#F5B041)] font-bold">{testi.name}</span> <span className="text-[#888]">/ {testi.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 border-y-4 border-[var(--theme-primary,#F5B041)] bg-[var(--theme-primary,#F5B041)] text-[#1F1F1F] text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-8">IRON & GRIT</motion.h2>
            <p className="text-2xl font-bold leading-relaxed max-w-2xl mx-auto">
              {uspStmt}
            </p>
          </div>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 border-b-4 border-[#333] bg-[#161616]">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row justify-between items-end mb-16">
              <div>
                <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-black uppercase tracking-tighter text-[#333]">{title}</motion.h2>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-[var(--theme-primary,#F5B041)] -mt-6 ml-4">{subtitle}</h3>
              </div>
              <div className=" text-[#888] font-bold text-sm hidden md:block border-2 border-[#333] px-4 py-2">
                STOCK_COUNT: {products?.length || 0}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
                <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-[#1F1F1F] border-2 border-[#333] p-4 group hover:border-[var(--theme-primary,#F5B041)] transition-colors flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out">
                  <div className="w-full aspect-square bg-[#111] mb-4 relative overflow-hidden rounded-[var(--theme-radius)]">
                    <img src={item.imageUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute top-2 left-2 bg-[#1F1F1F] text-[var(--theme-primary,#F5B041)]  text-[10px] font-bold px-2 py-1 border border-[var(--theme-primary,#F5B041)]">
                      {item.origin || "UNKNOWN"}
                    </div>
                  </div>
                  <h3 className="text-sm md:text-sm md:text-base font-black uppercase tracking-tighter mb-2 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">{item.name}</h3>
                  <div className="flex justify-between items-end mt-auto pt-6">
                    <span className=" text-lg font-bold text-[#888]">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="bg-[#333] text-white w-10 h-10 flex items-center justify-center font-black text-xl hover:bg-[var(--theme-primary,#F5B041)] hover:text-[#1F1F1F] transition-colors">
                      <Plus className="w-6 h-6" strokeWidth={iconStroke || 2} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 bg-[#1F1F1F]">
          <div className="max-w-3xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-12">TECHNICAL DOCS / FAQ</motion.h2>
            <div className="space-y-4">
              {faqs.map((faq: any, idx: number) => (
                <div key={idx} className="border-2 border-[#333] bg-[#161616]">
                  <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-3 md:p-6 flex justify-between items-center text-left hover:bg-[#222] transition-colors">
                    <span className="font-black uppercase tracking-tighter text-[var(--theme-primary,#F5B041)] text-lg">{faq.question}</span>
                    <div className="bg-[#333] p-1 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">
                      {openFaq === idx ? <Minus className="w-5 h-5" strokeWidth={iconStroke || 2} /> : <Plus className="w-5 h-5" strokeWidth={iconStroke || 2} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {openFaq === idx && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                        <div className="p-6 pt-0 text-[#888] font-bold border-t-2 border-[#333] bg-[#1F1F1F]">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </main>

      {/* 8. FOOTER & CTA */}
      <footer className="bg-[#111] border-t-8 border-[var(--theme-primary,#F5B041)] py-12 md:py-24 px-4 md:px-6">
        <div className="max-w-7xl mx-auto mb-24 text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-black uppercase tracking-tighter text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-8">INITIATE PARTNERSHIP</motion.h2>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#F5B041)] text-[#1F1F1F] font-black uppercase tracking-widest px-10 py-5 hover:bg-white transition-colors">
            OPEN WHOLESALE ACCOUNT
          </button>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-12 border-t-2 border-[#333] pt-12">
          <div>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter text-[#333] mb-2">{tenant?.name}</motion.h2>
            <p className="text-[#888] font-bold text-sm max-w-sm uppercase">
              {footer}
            </p>
          </div>
          
          <div className="flex gap-8  font-bold text-sm text-[#888]">
            {igLink && <a href={igLink} target="_blank" className="hover:text-[var(--theme-primary,#F5B041)] transition-colors">INSTAGRAM</a>}
            {emailLink && <a href={emailLink} className="hover:text-[var(--theme-primary,#F5B041)] transition-colors">EMAIL</a>}
            {waLink && <a href={waLink} target="_blank" className="hover:text-[var(--theme-primary,#F5B041)] transition-colors">WHATSAPP</a>}
          </div>
        </div>
      </footer>

    </div>
  );
}
