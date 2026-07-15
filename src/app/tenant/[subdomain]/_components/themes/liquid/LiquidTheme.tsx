"use client";

import React, { useEffect, useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Droplet, Activity, FlaskConical, Beaker, Fingerprint, Star, Plus, Minus, CheckCircle2 } from "lucide-react";

// =============================================================================
// TEMA 6: LIQUID SYMPHONY (INTERACTIVE & SENSORY-FOCUSED)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function LiquidTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "A Symphony of Flavors.";
  const aboutText = aText || tenant?.aboutText || "Immerse yourself in a sensory journey. Discover the distinct notes of our signature roasts.";
  
  const problemStmt = tenant?.problemStatement || "Are your customers experiencing flat, one-dimensional coffee that leaves no lasting impression?";
  const solutionStmt = tenant?.solutionStatement || "We map the entire sensory profile of our beans, unlocking complex flavor symphonies through precise fluid-bed roasting.";
  const uspStmt = tenant?.uspText || "Coffee is a liquid art form. We are the composers. We guarantee a multi-sensory experience in every extraction.";
  
  const defaultFeatures = [
    { title: "Fluid Bed Roasting", desc: "Suspended in hot air for unparalleled evenness.", iconName: "Droplet" },
    { title: "Sensory Mapping", desc: "Every batch is scientifically cupped and scored.", iconName: "Activity" },
    { title: "Precision Chemistry", desc: "Optimized for solubility and high extraction yields.", iconName: "FlaskConical" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Alex R.", role: "Sensory Judge", text: "The complexity and clarity in the cup are unmatched. A true symphony.", rating: 5 },
    { name: "Cafe Vertex", role: "Specialty Partner", text: "Our guests constantly ask what beans we are using. The flavor notes jump out of the cup.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "What is your recommended rest period?", answer: "We recommend resting our light roasts for 10-14 days for optimal flavor expression." },
    { question: "Do you provide water recipes?", answer: "Yes, we provide specific water mineralization recipes to match our roasting style." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "Tasting Menu";
  const subtitle = catalogSubtitle || "Hover over our selections to reveal their unique sensory profiles.";
  const footer = footerText || tenant?.footerText || "Crafted for the senses. © 2024 Liquid Symphony.";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Fake WebGL fluid interaction effect mapped to mouse
  const [fluidPos, setFluidPos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setFluidPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "droplet": return <Droplet className="w-8 h-8 text-[var(--theme-primary,#FF3B7C)]" />;
      case "activity": return <Activity className="w-8 h-8 text-[#FF9A44]" strokeWidth={iconStroke || 2} />;
      case "flaskconical": return <FlaskConical className="w-8 h-8 text-[var(--theme-primary)]" />;
      case "beaker": return <Beaker className="w-8 h-8 text-[var(--theme-primary,#FF3B7C)]" />;
      default: return <Fingerprint className="w-8 h-8 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0714] text-[#E8DDF4]  overflow-hidden selection:bg-[var(--theme-primary)] selection:text-white">
      
      {/* Interactive Liquid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <motion.div 
          animate={{ x: fluidPos.x - 400, y: fluidPos.y - 400 }}
          transition={{ type: "spring", stiffness: 20, damping: 30 }}
          className="absolute w-[800px] h-[800px] bg-gradient-to-r from-[#FF3B7C]/30 to-[#722F9E]/40 rounded-[var(--theme-radius)] blur-[120px]"
        />
        <motion.div 
          animate={{ x: fluidPos.x * -0.5, y: fluidPos.y * -0.5 }}
          transition={{ type: "spring", stiffness: 10, damping: 40 }}
          className="absolute right-0 bottom-0 w-[600px] h-[600px] bg-gradient-to-l from-[#FF9A44]/20 to-[#FF3B7C]/30 rounded-[var(--theme-radius)] blur-[150px]"
        />
      </div>

      {/* Navigation */}
      <header className="fixed top-0 w-full px-4 md:px-6 py-6 flex justify-between items-center bg-[#0d0714]/50 backdrop-blur-md z-50 border-b border-white/5">
        <div className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF9A44] via-[#FF3B7C] to-[#722F9E]">
          {tenant?.name || "Liquid Symphony"}
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsCartOpen(true)} className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] hover:text-white transition-colors text-xs font-bold tracking-widest uppercase bg-white/5 px-4 py-2 rounded-[var(--theme-radius)] border border-white/10">
            Cart ({cart?.items?.length || 0})
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-20">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="min-h-screen flex flex-col items-center justify-center px-4 md:px-6 -mt-20">
          <div className="text-center max-w-4xl relative">
            <motion.div initial={{ opacity: 0, y: 50, filter: "blur(20px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 1.5, ease: "easeOut" }}>
              <h1 className="text-2xl md:text-3xl md:text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 bg-clip-text text-transparent bg-gradient-to-br from-white via-[#FFD3E8] to-[#FF3B7C]">
                {heroText}
              </h1>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.8 }}>
              <p className="text-lg md:text-2xl text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light max-w-2xl mx-auto leading-relaxed mb-12">
                {aboutText}
              </p>
              <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="relative overflow-hidden group rounded-[var(--theme-radius)] bg-white/10 backdrop-blur-md border border-white/20 text-white px-10 py-5 uppercase font-bold tracking-widest text-sm hover:border-white/50 transition-all duration-300">
                <span className="relative z-10">Experience The Roast</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#FF3B7C] to-[#722F9E] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
              </button>
            </motion.div>
          </div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-6xl mx-auto border-t border-white/10">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-16 flex flex-col md:flex-row gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold mb-4 text-[var(--theme-primary,#FF3B7C)]">The Flat Flavor Dilemma</motion.h2>
              <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed text-lg font-light">"{problemStmt}"</p>
            </motion.div>
            <div className="w-full md:w-px h-px md:h-32 bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex-1">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold mb-4 text-[#FF9A44]">The Sensory Awakening</motion.h2>
              <p className="text-white leading-relaxed text-lg font-light">{solutionStmt}</p>
            </motion.div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-black tracking-tighter mb-4">Our Elements</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white/5 border border-white/10 backdrop-blur-md rounded-[var(--theme-radius)] p-8 hover:bg-white/10 transition-colors group">
                <div className="w-16 h-16 rounded-[var(--theme-radius)] bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_20px_color-mix(in_srgb,var(--theme-primary)_10%,transparent)]">
                  {renderIcon(feat.iconName)}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feat.title}</h3>
                <p className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-y border-white/5 bg-[#0d0714]/80">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-black tracking-tighter mb-16">Tasting Notes</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {testimonials.map((testi: any, idx: number) => (
                <div key={idx} className="flex flex-col items-center">
                  <div className="flex gap-1 mb-6 text-[#FF9A44]">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < (testi.rating || 5) ? 'fill-[#FF9A44]' : 'text-white/20'}`} strokeWidth={iconStroke || 2} />
                    ))}
                  </div>
                  <p className="text-xl md:text-2xl font-light italic text-[#E8DDF4] mb-8 leading-relaxed text-center">"{testi.text}"</p>
                  <div>
                    <p className="font-bold text-white text-sm uppercase tracking-widest">{testi.name}</p>
                    <p className="text-xs text-[var(--theme-primary)] uppercase tracking-widest mt-1">{testi.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 max-w-4xl mx-auto text-center relative">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-white/5 rounded-[var(--theme-radius)] pointer-events-none" />
          <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white/5 rounded-[var(--theme-radius)] pointer-events-none" />
          
          <Fingerprint className="w-16 h-16 text-[var(--theme-primary,#FF3B7C)] mx-auto mb-8 opacity-80" strokeWidth={iconStroke || 2} />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black tracking-tighter mb-8">The Liquid Art Form</motion.h2>
          <p className="text-xl text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-light leading-relaxed">
            {uspStmt}
          </p>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black tracking-tighter mb-4 text-white">{title}</motion.h2>
            <p className="text-[#A595B8] max-w-lg mx-auto">{subtitle}</p>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 50 }}
                className="w-[calc(50%-1rem)] sm:w-[calc(33.33%-1rem)] lg:w-[calc(25%-1.5rem)] max-w-sm hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out"
              >
                <div className="group relative w-full aspect-square rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-sm overflow-hidden p-3 md:p-6 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors duration-500 cursor-pointer shadow-[0_0_30px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]">
                  
                  {/* Glow behind image on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#722F9E]/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  
                  <div className="w-32 h-32 rounded-[var(--theme-radius)] overflow-hidden mb-6 border-4 border-white/10 group-hover:border-white/30 transition-colors relative z-10">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-white/5 flex items-center justify-center"><Droplet className="w-8 h-8 text-white/20" /></div>
                    )}
                  </div>
                  
                  <div className="relative z-10">
                    <h3 className="text-base md:text-sm md:text-sm md:text-base font-black text-white mb-2">{item.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-4">{item.origin || "Origin"}</p>
                    <span className="font-bold text-xl text-white">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  </div>
                  
                  {/* Hidden Add button that slides up */}
                  <div className="absolute bottom-0 left-0 w-full p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="w-full py-3 bg-gradient-to-r from-[#FF3B7C] to-[#722F9E] text-white font-black uppercase tracking-widest rounded-[var(--theme-radius)] text-xs hover:shadow-[0_0_20px_color-mix(in_srgb,var(--theme-primary)_40%,transparent)] transition-all">
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-black tracking-tighter">Curiosity</motion.h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-[var(--theme-radius)] overflow-hidden backdrop-blur-sm">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-4 md:px-6 py-5 flex justify-between items-center text-left hover:bg-white/5 transition-colors"
                >
                  <span className="font-bold text-white text-sm">{faq.question}</span>
                  {openFaq === idx ? <Minus className="w-4 h-4 text-[var(--theme-primary,#FF3B7C)]" strokeWidth={iconStroke || 2} /> : <Plus className="w-4 h-4 text-[var(--theme-primary,#FF3B7C)]" strokeWidth={iconStroke || 2} />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-4 md:px-6 pb-5 text-sm text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] leading-relaxed border-t border-white/5 pt-4">
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
      <footer className="relative z-10 border-t border-white/10 pt-24 pb-12 px-4 md:px-6 mt-12 bg-black/40 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-r from-white to-[#B4A2C7]">Ready to compose?</motion.h2>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="px-10 py-4 rounded-[var(--theme-radius)] bg-white text-black font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-[0_0_30px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]">
            Explore Wholesale
          </button>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-12">
          <div className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[#FF9A44] via-[#FF3B7C] to-[#722F9E]">
            {tenant?.name}
          </div>
          <p className="text-[#6D5A85] text-xs max-w-xs text-center">
            {footer}
          </p>
          <div className="flex justify-center gap-6 text-xs font-bold tracking-widest uppercase text-[#A595B8]">
            {igLink && <a href={igLink} target="_blank" className="hover:text-white transition-colors">IG</a>}
            {emailLink && <a href={emailLink} className="hover:text-white transition-colors">MAIL</a>}
            {waLink && <a href={waLink} target="_blank" className="hover:text-white transition-colors">WA</a>}
          </div>
        </div>
      </footer>

    </div>
  );
}
