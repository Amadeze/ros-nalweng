"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Gem, Award, Shield, Star, Plus, Minus, ArrowRight } from "lucide-react";

// =============================================================================
// TEMA 9: LUXURY RESERVE (ELITE & ULTRA-PREMIUM)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function LuxuryTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "The Apex of Craftsmanship.";
  const aboutText = aText || tenant?.aboutText || "Exclusive micro-lots and legendary varieties. Roasted for the discerning palate.";
  
  const problemStmt = tenant?.problemStatement || "True luxury is rare. Most coffee is mass-produced, sacrificing the nuanced symphony of flavor that only artisanal care can unlock.";
  const solutionStmt = tenant?.solutionStatement || "We source only the top 1% of global harvests. Each batch is a masterclass in precision, designed to elevate your daily ritual into an extraordinary experience.";
  const uspStmt = tenant?.uspText || "Uncompromising standards. Unparalleled taste. The pinnacle of coffee excellence.";
  
  const defaultFeatures = [
    { title: "Rare Origins", desc: "Procured from exclusive, award-winning estates.", iconName: "Gem" },
    { title: "Artisan Roasting", desc: "Hand-crafted profiles by master roasters.", iconName: "Crown" },
    { title: "Peerless Quality", desc: "Rigorous cupping standards for flawless execution.", iconName: "Award" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Alexander V.", role: "Connoisseur", text: "An absolute revelation. The complexity and elegance in the cup are unmatched.", rating: 5 },
    { name: "Eleanor S.", role: "Sommelier", text: "I approach coffee like fine wine, and this reserve collection is simply exquisite.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "How should I store these premium beans?", answer: "Keep them in an airtight container in a cool, dark place. Never freeze or refrigerate." },
    { question: "Do you offer private tastings?", answer: "Yes, we offer bespoke tasting experiences by appointment for our distinguished clientele." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "The Reserve Collection";
  const subtitle = catalogSubtitle || "Limited allocations. Exceptional quality.";
  const footer = footerText || tenant?.footerText || "© 2024 Luxury Reserve. All rights reserved.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1559525839-b184a4d698c7?auto=format&fit=crop&q=80&w=2000";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "gem": return <Gem className="w-8 h-8 text-[var(--theme-primary,#D4AF37)]" strokeWidth={iconStroke || 2} />;
      case "crown": return <Crown className="w-8 h-8 text-[var(--theme-primary,#D4AF37)]" strokeWidth={iconStroke || 2} />;
      case "award": return <Award className="w-8 h-8 text-[var(--theme-primary,#D4AF37)]" strokeWidth={iconStroke || 2} />;
      case "shield": return <Shield className="w-8 h-8 text-[var(--theme-primary,#D4AF37)]" strokeWidth={iconStroke || 2} />;
      default: return <Crown className="w-8 h-8 text-[var(--theme-primary,#D4AF37)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#F3EFE0]  selection:bg-[var(--theme-primary,#D4AF37)] selection:text-black">
      
      {/* Navigation - Classic Centered */}
      <header className="fixed top-0 w-full p-6 flex flex-col items-center gap-4 z-50 bg-[#0A0A0A]/90 backdrop-blur-sm border-b border-[var(--theme-primary,#D4AF37)]/20 transition-all rounded-[var(--theme-radius)]">
        <div className="text-xl md:text-2xl uppercase tracking-[0.3em] text-[var(--theme-primary,#D4AF37)] font-bold">
          {tenant?.name || "Luxury Reserve"}
        </div>
        <div className="flex gap-8 md:gap-12 items-center text-[10px] md:text-xs uppercase tracking-[0.2em]  text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">
          <nav className="flex gap-8 md:gap-12">
            <a href="#about" className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors">Heritage</a>
            <a href="#catalog" className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors">Collection</a>
          </nav>
          <button onClick={() => setIsCartOpen(true)} className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors border-l border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/30 pl-8 md:pl-12">
            Cart ({cart?.items?.length || 0})
          </button>
        </div>
      </header>

      <main className="pt-32">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full h-[80vh] flex flex-col items-center justify-center overflow-hidden mb-24">
          
          {/* Hero Background */}
          <div className="absolute inset-0 z-0">
            <img src={bgImage} alt="Luxury Background" className="w-full h-full object-cover opacity-30" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A]/80 via-transparent to-[#0A0A0A]" />
          </div>

          {/* Hero Content - Dramatic Centered */}
          <div className="relative z-10 text-center max-w-4xl px-4 md:px-6 mt-12">
            <motion.div initial={{ y: 30, opacity: 0, filter: "blur(10px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1.5, ease: "easeOut" }}>
              <h1 className="text-2xl md:text-3xl md:text-5xl md:text-7xl lg:text-8xl font-medium tracking-wide leading-tight mb-8 drop-shadow-2xl text-[#F3EFE0]">
                {heroText}
              </h1>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.8 }}>
              <p className="text-lg md:text-xl text-[#B0B0B0]  font-light tracking-wide max-w-2xl mx-auto leading-relaxed mb-12">
                {aboutText}
              </p>
              <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="border border-[var(--theme-primary,#D4AF37)] text-[var(--theme-primary,#D4AF37)] px-10 py-4 uppercase tracking-[0.2em] text-xs  hover:bg-[var(--theme-primary,#D4AF37)] hover:text-[#0A0A0A] transition-all duration-500">
                Explore The Collection
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="about" className="py-12 md:py-24 px-4 md:px-6 max-w-5xl mx-auto border-y border-[var(--theme-primary,#D4AF37)]/20 mb-24 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0A0A0A] px-4">
            <Crown className="w-8 h-8 text-[var(--theme-primary,#D4AF37)] opacity-50" strokeWidth={iconStroke || 2} />
          </div>
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl text-[var(--theme-primary,#D4AF37)] uppercase tracking-[0.2em]  text-sm mb-6">The Philosophy</motion.h2>
          </div>
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-xl leading-relaxed text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light italic mb-8">
                "{problemStmt}"
              </p>
            </div>
            <div>
              <p className="text-xl leading-relaxed text-[#F3EFE0] font-light">
                {solutionStmt}
              </p>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-7xl mx-auto mb-24">
          <div className="text-center mb-24">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl text-[#F3EFE0] uppercase tracking-[0.2em]  font-light">The Standard</motion.h2>
            <div className="w-px h-16 bg-[var(--theme-primary,#D4AF37)]/30 mx-auto mt-8"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.2 }} className="text-center flex flex-col items-center">
                <div className="w-16 h-16 mb-8 border border-[var(--theme-primary,#D4AF37)]/30 rounded-[var(--theme-radius)] flex items-center justify-center relative">
                  <div className="absolute inset-1 border border-[var(--theme-primary,#D4AF37)]/10 rounded-[var(--theme-radius)]"></div>
                  {renderIcon(feat.iconName)}
                </div>
                <h3 className="text-xl tracking-wider text-[var(--theme-primary,#D4AF37)] uppercase  text-sm mb-4">{feat.title}</h3>
                <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light  tracking-wide leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 bg-[#050505] mb-24 border-y border-[var(--theme-primary,#D4AF37)]/10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-[var(--theme-primary,#D4AF37)] uppercase tracking-[0.2em]  text-sm mb-16">Voices of Distinction</motion.h2>
            <div className="grid md:grid-cols-2 gap-12">
              {testimonials.map((testi: any, idx: number) => (
                <div key={idx} className="p-8">
                  <div className="flex justify-center gap-2 mb-6">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < (testi.rating || 5) ? 'fill-[var(--theme-primary,#D4AF37)] text-[var(--theme-primary,#D4AF37)]' : 'fill-[#333] text-[#333]'}`} strokeWidth={iconStroke || 2} />
                    ))}
                  </div>
                  <p className="text-lg text-[#F3EFE0] font-light italic mb-6 leading-relaxed">"{testi.text}"</p>
                  <div className="">
                    <p className="tracking-wider uppercase text-sm text-[var(--theme-primary,#D4AF37)]">{testi.name}</p>
                    <p className="text-xs tracking-widest text-[#666]">{testi.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 max-w-4xl mx-auto text-center mb-24 relative">
          <div className="absolute top-0 bottom-0 left-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>
          <div className="absolute top-0 bottom-0 right-0 w-px bg-gradient-to-b from-transparent via-[#D4AF37]/30 to-transparent"></div>
          
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-medium tracking-wide mb-8 text-[#F3EFE0]">A Legacy of Excellence</motion.h2>
          <p className="text-xl md:text-2xl text-[var(--theme-primary,#D4AF37)] font-light  tracking-wide leading-relaxed">
            {uspStmt}
          </p>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl text-[#F3EFE0] font-light uppercase tracking-[0.2em] mb-4">{title}</motion.h2>
            <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]  tracking-widest text-sm uppercase">{subtitle}</p>
            <div className="w-px h-16 bg-[var(--theme-primary,#D4AF37)]/30 mx-auto mt-12"></div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-8 gap-y-16">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div key={item.id} initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1, delay: i * 0.1 }} className="group flex flex-col items-center text-center h-full hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out">
                <div className="w-full aspect-[3/4] overflow-hidden mb-8 relative border border-[var(--theme-primary,#D4AF37)]/20 p-2 rounded-[var(--theme-radius)]">
                  <div className="w-full h-full relative overflow-hidden bg-[#111] rounded-[var(--theme-radius)]">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Gem className="w-12 h-12 text-[var(--theme-primary,#D4AF37)]/20" strokeWidth={iconStroke || 2} /></div>
                    )}
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000" />
                  </div>
                </div>
                <h3 className="text-sm md:text-sm md:text-base font-medium tracking-wide mb-3 text-[#F3EFE0]">{item.name}</h3>
                <p className="text-xs  tracking-[0.1em] text-[var(--theme-primary,#D4AF37)] uppercase mb-4">{item.origin || "Exclusive Blend"}</p>
                <p className="text-[#888]  font-light italic mb-6 max-w-sm flex-1 text-sm">
                  {item.description || "A symphony of rare flavors, carefully roasted to perfection."}
                </p>
                <span className=" tracking-widest mb-6">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="text-xs uppercase tracking-[0.2em]  text-[var(--theme-primary,#D4AF37)] border-b border-[var(--theme-primary,#D4AF37)]/50 pb-2 hover:text-[#F3EFE0] hover:border-[#F3EFE0] transition-colors flex items-center gap-2">
                  Acquire <ArrowRight className="w-4 h-4" strokeWidth={iconStroke || 2} />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-[var(--theme-primary,#D4AF37)] uppercase tracking-[0.2em]  text-sm mb-4">Inquiries</motion.h2>
            <div className="w-8 h-px bg-[var(--theme-primary,#D4AF37)]/50 mx-auto"></div>
          </div>
          <div className="space-y-1 ">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border-b border-[var(--theme-primary,#D4AF37)]/20">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full py-6 flex justify-between items-center text-left hover:text-[var(--theme-primary,#D4AF37)] transition-colors">
                  <span className="tracking-wide text-[#F3EFE0] uppercase text-sm">{faq.question}</span>
                  <span className="text-[var(--theme-primary,#D4AF37)]">
                    {openFaq === idx ? <Minus className="w-4 h-4" strokeWidth={iconStroke || 2} /> : <Plus className="w-4 h-4" strokeWidth={iconStroke || 2} />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light tracking-wide leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>

      </main>

      {/* 8. FOOTER & CTA */}
      <footer className="border-t border-[var(--theme-primary,#D4AF37)]/20 pt-24 pb-12 text-center bg-[#050505]">
        <div className="max-w-4xl mx-auto mb-24 px-4 md:px-6">
          <Crown className="w-8 h-8 text-[var(--theme-primary,#D4AF37)] mx-auto mb-8 opacity-50" strokeWidth={iconStroke || 2} />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-medium tracking-wide mb-8 text-[#F3EFE0]">Experience the Extraordinary</motion.h2>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="border border-[var(--theme-primary,#D4AF37)] text-[var(--theme-primary,#D4AF37)] px-5 md:px-12 py-4 uppercase tracking-[0.2em] text-xs  hover:bg-[var(--theme-primary,#D4AF37)] hover:text-[#0A0A0A] transition-all duration-500 mt-4">
            View Collection
          </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 md:px-6 pt-12 border-t border-[var(--theme-primary,#D4AF37)]/10 flex flex-col items-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-xl uppercase tracking-[0.3em] text-[var(--theme-primary,#D4AF37)] font-bold mb-8">{tenant?.name}</motion.h2>
          <div className="flex justify-center gap-8 text-xs uppercase tracking-[0.2em]  text-[#666] mb-12">
            {igLink && <a href={igLink} target="_blank" className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors">Instagram</a>}
            {emailLink && <a href={emailLink} className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors">Email</a>}
            {waLink && <a href={waLink} target="_blank" className="hover:text-[var(--theme-primary,#D4AF37)] transition-colors">WhatsApp</a>}
          </div>
          <p className="text-xs  text-[#444] tracking-widest">
            {footer}
          </p>
        </div>
      </footer>

    </div>
  );
}
