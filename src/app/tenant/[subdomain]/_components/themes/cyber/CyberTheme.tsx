"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Terminal, Shield, Zap, Cpu, Code, Database, ChevronDown, CheckSquare, PlusSquare, MinusSquare } from "lucide-react";

// =============================================================================
// TEMA 3: CYBER-BARISTA (HIGH-TECH & FUTURISTIC)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function CyberTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke
}: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Hacking the Perfect Roast.";
  const aboutText = aText || tenant?.aboutText || "Data-driven extraction. Algorithmic flavor profiles. Welcome to the future of coffee.";
  
  const problemStmt = tenant?.problemStatement || "> SYSTEM_ERROR: INCONSISTENT_BEANS_DETECTED. Are you losing customers due to fluctuating roast profiles and unreliable supply chains?";
  const solutionStmt = tenant?.solutionStatement || "> INITIATING_FIX: Our AI-assisted roasting telemetry ensures 99.9% consistency across all batches. Guaranteed precision.";
  const uspStmt = tenant?.uspText || "We treat coffee roasting as computer science. Every temperature curve is logged, analyzed, and optimized to perfection.";
  
  const defaultFeatures = [
    { title: "Algorithmic Precision", desc: "Computer-controlled airflow and drum speed.", iconName: "Cpu" },
    { title: "Encrypted Logistics", desc: "Traceable supply chain from farm to cup.", iconName: "Database" },
    { title: "Quantum Freshness", desc: "Roasted on demand, shipped immediately.", iconName: "Zap" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Unit_734", role: "Cafe Operator", text: "Consistency improved by 400%. Customer satisfaction at maximum threshold.", rating: 5 },
    { name: "Node_B", role: "Tech Hub Cafe", text: "The only roastery that speaks our language. Flawless execution.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "What is the minimum order protocol?", answer: "MOQ is strictly 5kg per transaction to optimize bandwidth." },
    { question: "How do I integrate your beans into my workflow?", answer: "We provide complete brewing parameters and extraction yield targets." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "DATABASE.query(\"products\")";
  const footer = footerText || tenant?.footerText || "SYSTEM LOG: End of transmission.";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "cpu": return <Cpu className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
      case "database": return <Database className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
      case "zap": return <Zap className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
      case "shield": return <Shield className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
      case "code": return <Code className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
      default: return <Terminal className="w-8 h-8 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#050510] text-[var(--theme-primary,#00FF41)]  selection:bg-[var(--theme-primary,#00FF41)] selection:text-black">
      
      {/* Grid Overlay */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-50"
           style={{
             backgroundImage: `linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px)`,
             backgroundSize: '40px 40px'
           }}
      />

      {/* Navigation */}
      <header className="fixed top-0 w-full px-4 md:px-8 py-6 flex justify-between items-center z-50 bg-[#050510]/90 backdrop-blur-md border-b border-[var(--theme-primary,#00FF41)]/30">
        <div className="text-xl font-bold tracking-widest uppercase flex items-center gap-3">
          <div className="w-3 h-3 bg-[var(--theme-primary,#00FF41)] animate-pulse"></div>
          {tenant?.name || "SYS.ROAST"}
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 border border-[var(--theme-primary,#00FF41)] px-4 py-2 text-xs uppercase font-bold hover:bg-[var(--theme-primary,#00FF41)] hover:text-black transition-colors">
            [ CART: {cart?.items?.length || 0} ]
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-24 pb-20">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="min-h-[85vh] flex flex-col items-center justify-center px-4 md:px-6 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="border border-[var(--theme-primary,#00FF41)]/50 bg-[var(--theme-primary,#00FF41)]/5 p-8 md:p-16 backdrop-blur-sm relative w-full"
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[var(--theme-primary,#00FF41)]"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[var(--theme-primary,#00FF41)]"></div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#050510] px-4 text-xs tracking-widest text-white/70">STATUS: ONLINE</div>

            <h1 className="text-2xl md:text-4xl md:text-6xl font-black tracking-tight leading-tight mb-6 drop-shadow-[0_0_10px_color-mix(in_srgb,var(--theme-primary)_80%,transparent)] text-white">
              {heroText}
            </h1>
            <p className="text-lg text-[var(--theme-primary,#00FF41)] mb-10 font-normal max-w-2xl mx-auto">
              &gt; {aboutText}
            </p>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-transparent border-2 border-[var(--theme-primary,#00FF41)] text-[var(--theme-primary,#00FF41)] px-4 md:px-8 py-4 uppercase font-bold tracking-wider hover:bg-[var(--theme-primary,#00FF41)] hover:text-black transition-all duration-200 drop-shadow-[0_0_5px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)] rounded-[var(--theme-radius)]">
              EXECUTE: SHOP
            </button>
          </motion.div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 bg-black/40">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 border border-red-500/30 bg-red-500/5 p-8 relative rounded-[var(--theme-radius)] overflow-hidden">
                <div className="absolute top-0 left-0 bg-red-500 text-black text-xs font-bold px-2 py-1">ERROR_LOG</div>
                <p className="text-red-400 mt-4 leading-relaxed  text-sm">{problemStmt}</p>
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 border border-[var(--theme-primary,#00FF41)]/30 bg-[color-mix(in_srgb,var(--theme-primary,#00FF41)_5%,transparent)] p-8 relative rounded-[var(--theme-radius)] overflow-hidden">
                <div className="absolute top-0 left-0 bg-[var(--theme-primary,#00FF41)] text-black text-xs font-bold px-2 py-1">SYS_UPDATE</div>
                <p className="text-[var(--theme-primary,#00FF41)] mt-4 leading-relaxed  text-sm">{solutionStmt}</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold text-white tracking-widest uppercase">&gt; SYSTEM_CAPABILITIES</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="border border-[var(--theme-primary,#00FF41)]/30 p-8 hover:bg-[color-mix(in_srgb,var(--theme-primary,#00FF41)_10%,transparent)] transition-colors group rounded-[var(--theme-radius)]">
                <div className="mb-6 opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all">{renderIcon(feat.iconName)}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-[var(--theme-primary,#00FF41)]/70">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 bg-black/40">
          <div className="max-w-6xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold text-white tracking-widest uppercase text-center mb-16">&gt; USER_FEEDBACK_LOGS</motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {testimonials.map((testi: any, idx: number) => (
                <div key={idx} className="border-l-2 border-[var(--theme-primary,#00FF41)] pl-6 py-2">
                  <div className="flex text-[var(--theme-primary,#00FF41)] mb-4 text-xs">
                    {Array.from({length: 5}).map((_, i) => (
                      <span key={i}>{i < (testi.rating || 5) ? "[*]" : "[ ]"}</span>
                    ))}
                  </div>
                  <p className="text-white/90 text-sm mb-6  leading-relaxed">"{testi.text}"</p>
                  <div className="uppercase text-xs tracking-widest text-[var(--theme-primary,#00FF41)]">
                    <span className="font-bold text-white">{testi.name}</span> // {testi.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 max-w-4xl mx-auto text-center">
          <Terminal className="w-12 h-12 text-[var(--theme-primary,#00FF41)] mx-auto mb-6 opacity-50" strokeWidth={iconStroke || 2} />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold text-white tracking-widest uppercase mb-8">&gt; CORE_ARCHITECTURE</motion.h2>
          <p className="text-lg text-[var(--theme-primary,#00FF41)]/80 leading-relaxed max-w-2xl mx-auto">
            {uspStmt}
          </p>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 bg-black/60 relative">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16 flex items-center gap-4">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-bold text-white tracking-wider uppercase">{title}</motion.h2>
              <div className="h-px bg-[var(--theme-primary,#00FF41)]/30 flex-1"></div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="border border-[var(--theme-primary,#00FF41)]/30 bg-[#050510] flex flex-col hover:border-[var(--theme-primary,#00FF41)] hover:shadow-[0_0_15px_color-mix(in_srgb,var(--theme-primary,#00FF41)_20%,transparent)] transition-all group rounded-[var(--theme-radius)] overflow-hidden"
                >
                  <div className="relative aspect-square border-b border-[var(--theme-primary,#00FF41)]/20 bg-black overflow-hidden p-4 flex items-center justify-center">
                    <div className="absolute top-2 right-2 text-[9px] text-[color-mix(in_srgb,var(--theme-primary,#00FF41)_50%,transparent)] z-10">ID:{item.id.substring(0,6)}</div>
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-500 opacity-60 group-hover:opacity-100" />
                    ) : (
                      <Database className="w-16 h-16 text-[var(--theme-primary,#00FF41)]/20" strokeWidth={iconStroke || 2} />
                    )}
                  </div>
                  <div className="p-3 md:p-5 flex flex-col flex-1">
                    <h3 className="text-sm md:text-base font-bold text-white mb-1 uppercase tracking-wider">{item.name}</h3>
                    <p className="text-xs text-[var(--theme-primary,#00FF41)]/60 mb-4 uppercase">{item.origin || "SRC_UNKNOWN"}</p>
                    <div className="mt-auto pt-4 border-t border-[var(--theme-primary,#00FF41)]/20 flex justify-between items-center">
                      <span className="font-bold text-white tracking-widest">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="bg-[color-mix(in_srgb,var(--theme-primary,#00FF41)_10%,transparent)] text-[var(--theme-primary,#00FF41)] px-3 py-1.5 text-xs font-bold hover:bg-[var(--theme-primary,#00FF41)] hover:text-black transition-colors rounded-[calc(var(--theme-radius)*0.5)]">
                        + ADD
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 border-t border-[var(--theme-primary,#00FF41)]/20 max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl font-bold text-white tracking-widest uppercase text-center mb-12">&gt; QUERY_KNOWLEDGEBASE</motion.h2>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border border-[var(--theme-primary,#00FF41)]/30 bg-[#050510] rounded-[var(--theme-radius)] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-4 md:px-6 py-4 flex justify-between items-center text-left hover:bg-[color-mix(in_srgb,var(--theme-primary,#00FF41)_5%,transparent)] transition-colors"
                >
                  <span className="font-bold text-white text-sm tracking-wide">{faq.question}</span>
                  {openFaq === idx ? <MinusSquare className="w-4 h-4 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} /> : <PlusSquare className="w-4 h-4 text-[var(--theme-primary,#00FF41)]" strokeWidth={iconStroke || 2} />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="px-4 md:px-6 pb-4 pt-2 text-sm text-[var(--theme-primary,#00FF41)]/70 leading-relaxed border-t border-[var(--theme-primary,#00FF41)]/10">
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
      <footer className="border-t-2 border-[var(--theme-primary,#00FF41)] bg-black py-8 md:py-16 px-4 md:px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-black text-white mb-6 uppercase tracking-widest drop-shadow-[0_0_8px_color-mix(in_srgb,var(--theme-primary)_50%,transparent)]">INITIATE_PARTNERSHIP</motion.h2>
          <p className="text-[var(--theme-primary,#00FF41)] mb-10 max-w-lg mx-auto">Ready to upgrade your coffee program? Access our wholesale database now.</p>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#00FF41)] text-black px-10 py-4 uppercase font-black tracking-widest hover:bg-white hover:text-black transition-colors mb-16 shadow-[0_0_20px_color-mix(in_srgb,var(--theme-primary)_40%,transparent)] rounded-[var(--theme-radius)]">
            BROWSE CATALOG
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-10 border-t border-[var(--theme-primary,#00FF41)]/20">
            <div className="text-sm font-bold text-white tracking-widest">
              {tenant?.name} <span className="text-[var(--theme-primary,#00FF41)]">v2.0</span>
            </div>
            <div className="text-xs text-[var(--theme-primary,#00FF41)]/50 text-center uppercase tracking-widest">
              {footer}
            </div>
            <div className="flex gap-6 text-xs font-bold tracking-widest">
              {igLink && <a href={igLink} target="_blank" className="hover:text-white transition-colors">INSTAGRAM</a>}
              {emailLink && <a href={emailLink} className="hover:text-white transition-colors">EMAIL</a>}
              {waLink && <a href={waLink} target="_blank" className="hover:text-white transition-colors">WHATSAPP</a>}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
