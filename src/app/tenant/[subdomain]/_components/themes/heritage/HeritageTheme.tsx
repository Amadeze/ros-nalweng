"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Coffee, Leaf, Award, Star, Quote, Handshake, Plus, Minus, ArrowRight } from "lucide-react";

// =============================================================================
// TEMA 1: THE HERITAGE CRAFT (CLASSIC & ARTISANAL)
// 8-Section High-Converting Anatomy
// =============================================================================

export function HeritageTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "The Artisanal Roasting Tradition";
  const aboutText = aText || tenant?.aboutText || "Honoring the history of coffee through time-tested roasting techniques.";
  
  const problemStmt = tenant?.problemStatement || "In an era of mass production, the authentic soul of coffee is often lost to automated efficiency. Finding a roaster that respects the unique terroir of each bean—delivering consistency without sacrificing character—has become a rare privilege.";
  const solutionStmt = tenant?.solutionStatement || "We return to the roots of the craft. Using vintage roasting equipment and generations of sensory expertise, we unlock the profound, time-honored flavors your customers long for.";
  const uspStmt = tenant?.uspText || "Choosing us is a declaration of quality. We do not rush. We do not compromise. We roast purely to elevate the sensory experience of your guests.";
  
  const defaultFeatures = [
    { title: "Time-Tested Consistency", desc: "Every batch is roasted to exacting historical standards, ensuring your café serves the perfect cup, every time.", iconName: "ShieldCheck" },
    { title: "Direct Estate Sourcing", desc: "We shake hands with the farmers. Ethical, transparent sourcing that honors the hands that grew the cherry.", iconName: "Leaf" },
    { title: "Master Roaster's Touch", desc: "No automated curves. Our master roasters rely on sight, sound, and smell to drop the beans at the absolute perfect second.", iconName: "Award" }
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Eleanor V.", role: "Head Barista", text: "The depth of flavor in their Heritage Blend brought our patrons to tears. It's a return to the golden age of coffee.", rating: 5 },
    { name: "Arthur P.", role: "Cafe Owner", text: "Finally, a wholesale partner that treats coffee as an art form rather than a mere commodity. Exceptional service.", rating: 5 }
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "What is your minimum order quantity for wholesale?", answer: "To ensure absolute freshness, we require a minimum order of 5kg per batch." },
    { question: "How frequently do you roast?", answer: "We fire up the roasters every Tuesday and Thursday. Orders placed prior to roasting days are shipped the following morning." },
    { question: "Do you offer equipment calibration?", answer: "Yes, for our dedicated partners, our master barista will visit your establishment to calibrate your vintage or modern espresso machines." }
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "The Harvest";
  const subtitle = catalogSubtitle || "Finest Selection";
  const footer = footerText || tenant?.footerText || "Preserving the craft of traditional coffee roasting for generations to come.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1514432324607-a2ce7beea265?auto=format&fit=crop&q=80&w=2000";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "shieldcheck": return <ShieldCheck className="w-10 h-10 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      case "leaf": return <Leaf className="w-10 h-10 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      case "award": return <Award className="w-10 h-10 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      default: return <Coffee className="w-10 h-10 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F1EA] text-[var(--theme-primary,#3E2723)]  overflow-hidden relative selection:bg-[var(--theme-primary,#3E2723)] selection:text-[#F4F1EA]">
      
      {/* Subtle Texture Overlay */}
      <div 
        className="pointer-events-none fixed inset-0 z-50 opacity-[0.03]" 
        style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/old-wall.png")' }} 
      />

      {/* 1. ABOVE THE FOLD (HERO) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full min-h-screen flex flex-col items-center justify-center border-[12px] border-double border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20 m-4 rounded-[var(--theme-radius)] box-border" style={{ height: 'calc(100vh - 32px)' }}>
        <header className="absolute top-0 w-full px-4 md:px-6 py-8 flex justify-between items-center z-20 md:px-12">
          <div className="text-xl md:text-2xl font-bold tracking-widest uppercase border-b-2 border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] pb-1">
            {tenant?.name || "Heritage Roasters"}
          </div>
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] px-4 py-2 text-xs uppercase tracking-widest font-bold hover:bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] hover:text-[#F4F1EA] transition-colors bg-[#F4F1EA]">
            Cart ({cart?.items?.length || 0})
          </button>
        </header>

        <div className="relative z-10 text-center max-w-4xl px-4 md:px-6 flex flex-col items-center pt-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, ease: "easeOut" }} className="mb-8">
            <div className="w-20 h-20 border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] rounded-[var(--theme-radius)] flex items-center justify-center mx-auto mb-6 bg-[#EFEBE1]">
              <Coffee strokeWidth={1.5} className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" />
            </div>
            <h1 className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-6 text-[var(--theme-primary,#3E2723)]">
              {heroText}
            </h1>
          </motion.div>
          
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.4 }}>
            <p className="text-lg md:text-xl text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light max-w-2xl mx-auto leading-relaxed mb-10 italic">
              "{aboutText}"
            </p>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-block bg-[var(--theme-primary,#3E2723)] text-[#F4F1EA] px-10 py-5 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] transition-all duration-300 rounded-[var(--theme-radius)] cursor-pointer">
              Explore The Harvest
            </button>
          </motion.div>
        </div>
      </motion.section>

      {/* 2. THE PROBLEM & SOLUTION */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-12 md:py-24 max-w-4xl mx-auto text-center border-b border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold mb-8 text-[var(--theme-primary,#3E2723)]">The Pursuit of True Character</motion.h2>
        <p className="text-lg text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed mb-8">
          {problemStmt}
        </p>
        <p className="text-xl font-bold text-[var(--theme-primary,#3E2723)] italic border-l-4 border-[var(--theme-primary,#3E2723)] pl-6 text-left max-w-2xl mx-auto">
          {solutionStmt}
        </p>
      </motion.section>

      {/* 3. FEATURES & BENEFITS */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-12 md:py-24 bg-[#EFEBE1] border-y border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-[#8D6E63] mb-4 block">The Guild's Standards</span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold text-[var(--theme-primary,#3E2723)]">Our Artisanal Commitments</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((f: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center text-center">
                <div className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6 bg-[#F4F1EA] p-4 rounded-[var(--theme-radius)] border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20">
                  {renderIcon(f.iconName)}
                </div>
                <h3 className="text-xl font-bold mb-4 text-[var(--theme-primary,#3E2723)]">{f.title}</h3>
                <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed italic">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. SOCIAL PROOF (TESTIMONIALS) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-12 md:py-24 max-w-5xl mx-auto text-center">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold mb-16 text-[var(--theme-primary,#3E2723)]">Words from Our Patrons</motion.h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {testimonials.map((t: any, i: number) => (
            <div key={i} className="border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/30 p-8 bg-[#F4F1EA] relative text-left rounded-[var(--theme-radius)]">
              <Quote className="w-12 h-12 text-[#8D6E63]/20 absolute top-4 left-4" fill="currentColor" strokeWidth={iconStroke || 2} />
              <div className="flex gap-1 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-4 justify-end relative z-10">
                {[...Array(5)].map((_, j) => <Star key={j} className={`w-4 h-4 ${j < (t.rating || 5) ? 'fill-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]' : 'text-gray-300'}`} strokeWidth={iconStroke || 2} />)}
              </div>
              <p className="text-[var(--theme-primary,#3E2723)] italic leading-relaxed mb-6 relative z-10">"{t.text}"</p>
              <div className="border-t border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20 pt-4">
                <p className="font-bold text-[var(--theme-primary,#3E2723)] uppercase tracking-widest text-xs">{t.name}</p>
                <p className="text-[#8D6E63] text-xs">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 5. WHY CHOOSE US (USP) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-12 md:py-24 bg-[var(--theme-primary,#3E2723)] text-[#F4F1EA]">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-bold mb-6">The Legacy Difference</motion.h2>
            <p className="text-[#D7CCC8] text-lg leading-relaxed mb-8 italic">
              {uspStmt}
            </p>
            <div className="flex items-center gap-4 text-[#EFEBE1] font-bold uppercase tracking-widest text-sm border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] p-4 inline-flex rounded-[var(--theme-radius)]">
              <Handshake className="w-8 h-8" strokeWidth={iconStroke || 2} />
              <span>Partnership Rooted in Trust</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="w-full aspect-[3/4] border-[8px] border-double border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] p-2">
              <img src={bgImage} alt="Heritage Roasting" className="w-full h-full object-cover filter sepia-[0.4] contrast-125" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 6. THE OFFER & PRICING (CATALOG) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <span className="text-sm font-bold tracking-[0.2em] uppercase text-[#8D6E63] mb-4">{subtitle}</span>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-bold tracking-tight text-[var(--theme-primary,#3E2723)]">{title}</motion.h2>
          <p className="mt-4 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] italic">Allocations are limited. Order now to secure this month's roast batch.</p>
          <div className="w-24 h-1 bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mt-8"></div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-12">
          {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
            <div 
              key={item.id}
              className="bg-[#EFEBE1] p-3 md:p-6 shadow-xl border border-[#D7CCC8] relative flex flex-col group hover:-translate-y-2 transition-transform duration-500 rounded-[var(--theme-radius)]"
            >
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-2 border-l-2 border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-2 border-r-2 border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]"></div>
              
              <div className="w-full aspect-[4/3] bg-[#D7CCC8] overflow-hidden mb-6 filter sepia-[0.3] contrast-[1.1] relative border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/10 rounded-[var(--theme-radius)]">
                {item.imageUrl ? (
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center"><Coffee className="w-12 h-12 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20" strokeWidth={iconStroke || 2} /></div>
                )}
              </div>
              <div className="text-center flex-1 flex flex-col">
                <p className="text-xs font-bold tracking-[0.2em] text-[#8D6E63] uppercase mb-2">{item.origin || "Estate Blend"}</p>
                <h3 className="text-base md:text-sm md:text-sm md:text-base font-bold text-[var(--theme-primary,#3E2723)] mb-4">{item.name}</h3>
                <p className="text-sm text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6 italic leading-relaxed flex-1">
                  {item.description || "Hand-picked and roasted in small batches using our vintage Probat."}
                </p>
                <div className="mt-auto border-t border-[#D7CCC8] pt-4 flex justify-between items-center">
                  <span className="font-bold text-lg text-[var(--theme-primary,#3E2723)]">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] text-[#F4F1EA] px-4 py-2 text-xs uppercase tracking-widest hover:bg-[var(--theme-primary,#3E2723)] font-bold flex items-center gap-2 transition-colors">
                    Add to Cart <ArrowRight className="w-4 h-4" strokeWidth={iconStroke || 2} />
                  </motion.button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 7. FAQ */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-12 md:py-24 max-w-3xl mx-auto border-t border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/20">
        <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-bold text-center mb-12 text-[var(--theme-primary,#3E2723)]">Common Inquiries</motion.h2>
        <div className="space-y-4">
          {faqs.map((faq: any, idx: number) => (
            <div key={idx} className="border border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/30 bg-[#EFEBE1]">
              <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-6 flex justify-between items-center text-left hover:bg-[#D7CCC8] transition-colors">
                <span className="font-bold text-[var(--theme-primary,#3E2723)] text-lg">{faq.question}</span>
                <span className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">
                  {openFaq === idx ? <Minus className="w-5 h-5" strokeWidth={iconStroke || 2} /> : <Plus className="w-5 h-5" strokeWidth={iconStroke || 2} />}
                </span>
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="px-4 md:px-6 pb-6 pt-2 border-t border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]/10">
                      <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] italic leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 8. FOOTER & SECONDARY CTA */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-10 md:py-20 bg-[#2D1A11] text-center border-t-[8px] border-[var(--theme-primary,#3E2723)]">
        <div className="max-w-2xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold text-[#F4F1EA] mb-6">Ready to Serve Excellence?</motion.h2>
          <p className="text-[#D7CCC8] mb-10 italic">Join the guild of premier cafés pouring our heritage roasts.</p>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-block bg-[#F4F1EA] text-[var(--theme-primary,#3E2723)] px-5 md:px-12 py-5 uppercase tracking-[0.2em] text-sm font-bold hover:bg-[#EFEBE1] transition-colors mb-16 cursor-pointer">
            Explore The Harvest
          </button>
        </div>
        
        <div className="max-w-4xl mx-auto border-t border-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] pt-12">
          <h3 className="text-2xl font-bold tracking-widest uppercase mb-4 text-[#F4F1EA]">{tenant?.name}</h3>
          <p className="text-sm max-w-md mx-auto italic mb-10 text-[#D7CCC8]">
            {footer}
          </p>
          <div className="flex justify-center gap-10 text-xs uppercase tracking-[0.2em] font-bold text-[#D7CCC8]">
            {igLink && <a href={igLink} target="_blank" rel="noreferrer" className="hover:text-[#F4F1EA] transition-colors">Instagram</a>}
            {emailLink && <a href={emailLink} className="hover:text-[#F4F1EA] transition-colors">Email</a>}
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="hover:text-[#F4F1EA] transition-colors">WhatsApp</a>}
          </div>
          <p className="mt-12 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] text-xs">© {new Date().getFullYear()} {tenant?.name}. All rights reserved.</p>
        </div>
      </motion.section>

    </div>
  );
}
