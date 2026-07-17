"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Target, Fingerprint, Star, Clock, Zap, Plus, Minus } from "lucide-react";
import { TenantBrand } from "../TenantBrand";

// =============================================================================
// TEMA 2: NEO-MODERNIST (SLEEK & MINIMALIST)
// 8-Section High-Converting Anatomy
// =============================================================================

export function NeoModernTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Precision in Every Pour.";
  const aboutText = aText || tenant?.aboutText || "We treat coffee as a science. Minimalist approach, maximum flavor extraction.";
  
  const problemStmt = tenant?.problemStatement || "Inconsistent extractions are ruining your margins. Running a modern café means dealing with fluctuating bean densities, unpredictable roasting profiles, and baristas struggling to dial in the perfect shot. You lose time, coffee, and customers.";
  const solutionStmt = tenant?.solutionStatement || "We eliminate variables. Our roasting process is digitally profiled and strictly monitored to ensure 99.9% consistency batch over batch. You get beans that extract beautifully, every single time, maximizing your workflow and profit.";
  const uspStmt = tenant?.uspText || "We don't rely on gut feelings. We use advanced telemetry to track bean temperature, environmental heat, and rate of rise down to the decimal. Choosing us means choosing a partner who values precision as much as you do.";
  
  const defaultFeatures = [
    { title: "Precision Profiling", desc: "Every roast curve is logged and replicated perfectly. Zero guesswork for your baristas.", iconName: "Target" },
    { title: "Rapid Fulfillment", desc: "Order today, roasted tomorrow, delivered instantly. Freshness optimized for degassing.", iconName: "Zap" },
    { title: "Unique Identity", desc: "Custom blend development available to give your brand a signature taste profile.", iconName: "Fingerprint" }
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Sarah K.", role: "Minimalist Brews", text: "Switching to their scientifically profiled roasts dropped our dialing-in waste by 40%. The consistency is unmatched.", rating: 5 },
    { name: "James L.", role: "The Corner Study", text: "Their transparent communication and exact delivery schedules make them the best wholesale partner we've ever had.", rating: 5 }
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "What is your MOQ?", answer: "We require a minimum order of 3kg per profile to ensure consistent roasting parameters." },
    { question: "Do you provide equipment?", answer: "We partner with leading espresso machine manufacturers and can facilitate equipment financing for our long-term wholesale clients." },
    { question: "How do you handle shipping?", answer: "Orders are shipped within 12 hours of roasting via express courier to guarantee maximum freshness." }
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "The Collection";
  const subtitle = catalogSubtitle || "Curated Single Origins";
  const footer = footerText || tenant?.footerText || "Pushing the boundaries of coffee science and extraction.";
  
  // Use a more robust reliable image fallback, or just rely on CSS
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80&w=2000";

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "target": return <Target className="w-6 h-6 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
      case "zap": return <Zap className="w-6 h-6 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
      case "fingerprint": return <Fingerprint className="w-6 h-6 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
      default: return <CheckCircle className="w-6 h-6 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-white text-[var(--theme-primary)]  selection:bg-[var(--theme-primary)] selection:text-white">
      
      {/* 1. ABOVE THE FOLD (HERO) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full min-h-screen flex flex-col justify-between px-4 md:px-6 py-8 md:px-16 md:py-12">
        <header className="flex justify-between items-center w-full relative z-20">
          <div className="text-xl font-bold tracking-tighter"><TenantBrand tenant={tenant} fallback="Neo Roastery" /></div>
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 px-5 py-2.5 bg-zinc-100 rounded-[var(--theme-radius)] text-sm font-bold hover:bg-zinc-200 transition-colors">
            Cart ({cart.getTotalItems(tenant.subdomain || "")})
          </button>
        </header>

        <div className="flex-1 flex flex-col justify-center max-w-5xl z-20 mt-10">
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
            <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl lg:text-[7rem] font-black tracking-tighter leading-[0.9] mb-6 text-[var(--theme-primary)]">
              {heroText}
            </h1>
          </motion.div>
          
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }} className="flex flex-col md:flex-row gap-6 md:items-center mt-8">
            <p className="text-lg md:text-xl text-zinc-500 max-w-lg font-light leading-relaxed">
              {aboutText}
            </p>
            <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-flex items-center gap-2 rounded-[var(--theme-radius)] px-4 md:px-8 py-4 bg-[var(--theme-primary)] text-white font-medium hover:bg-[color-mix(in_srgb,var(--theme-primary)_80%,black)] transition-colors w-fit">
              Shop Collection <ArrowRight className="w-5 h-5" strokeWidth={iconStroke || 2} />
            </button>
          </motion.div>
        </div>

        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1.2, delay: 0.4 }} className="absolute right-0 top-0 w-2/5 h-full hidden lg:block overflow-hidden bg-zinc-100 rounded-[var(--theme-radius)]">
          <img src={bgImage} alt="Brewing" className="w-full h-full object-cover object-center grayscale opacity-80 mix-blend-multiply" onError={(e) => e.currentTarget.style.display = 'none'} />
        </motion.div>
      </motion.section>

      {/* 2. THE PROBLEM & SOLUTION */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16 bg-zinc-50">
        <div className="max-w-4xl">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-bold tracking-tight mb-8">The Problem with Craft.</motion.h2>
          <p className="text-xl text-zinc-500 font-light leading-relaxed mb-12">
            {problemStmt}
          </p>
          <div className="p-8 md:p-12 bg-white rounded-[var(--theme-radius)] border border-zinc-100 shadow-sm">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-green-500" strokeWidth={iconStroke || 2} /> The Scientific Solution
            </h3>
            <p className="text-zinc-600 text-lg leading-relaxed">
              {solutionStmt}
            </p>
          </div>
        </div>
      </motion.section>

      {/* 3. FEATURES & BENEFITS */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold tracking-tight mb-4">Engineered for Excellence</motion.h2>
            <p className="text-zinc-500 max-w-xl text-lg">We focus on the metrics that matter to your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((f: any, i: number) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="p-8 rounded-[var(--theme-radius)] bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div className="w-12 h-12 bg-white rounded-[var(--theme-radius)] flex items-center justify-center mb-6 shadow-sm">
                  {renderIcon(f.iconName)}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 4. SOCIAL PROOF */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16 bg-[var(--theme-primary)] text-white">
        <div className="max-w-6xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold tracking-tight mb-16">Trusted by High-Volume Cafés</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t: any, i: number) => (
              <div key={i} className="p-8 rounded-[var(--theme-radius)] bg-[color-mix(in_srgb,var(--theme-primary)_80%,black)] border border-zinc-700 flex flex-col justify-between">
                <div>
                  <div className="flex text-yellow-400 mb-6 gap-1">
                    {[...Array(5)].map((_, j) => <Star key={j} className={`w-5 h-5 ${j < (t.rating || 5) ? 'fill-yellow-400 text-yellow-400' : 'fill-zinc-600 text-zinc-600'}`} strokeWidth={iconStroke || 2} />)}
                  </div>
                  <p className="text-lg font-light leading-relaxed mb-8">"{t.text}"</p>
                </div>
                <div>
                  <p className="font-bold">{t.name}</p>
                  <p className="text-zinc-400 text-sm">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 5. WHY CHOOSE US (USP) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-bold tracking-tight mb-8">Data-Driven Roasting.</motion.h2>
          <p className="text-xl text-zinc-500 font-light leading-relaxed mb-12">
            {uspStmt}
          </p>
          <div className="inline-flex items-center gap-3 bg-zinc-100 px-4 md:px-6 py-3 rounded-[var(--theme-radius)] text-sm font-bold">
            <Clock className="w-5 h-5" strokeWidth={iconStroke || 2} /> 24/7 B2B Support Portal
          </div>
        </div>
      </motion.section>

      {/* 6. THE OFFER & PRICING (CATALOG) */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16 bg-zinc-50 rounded-[3rem]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-bold tracking-tight mb-2">{title}</motion.h2>
              <span className="text-zinc-500">{subtitle}</span>
            </div>
            <div className="bg-amber-100 text-amber-800 px-4 py-2 rounded-[var(--theme-radius)] text-sm font-bold animate-pulse">
              Only 2 wholesale slots remaining this month
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group bg-white rounded-[var(--theme-radius)] p-3 md:p-6 shadow-sm border border-zinc-100 hover:shadow-xl hover:border-zinc-300 transition-all duration-300 flex flex-col h-full"
              >
                <div className="w-full aspect-square bg-zinc-100 rounded-[var(--theme-radius)] overflow-hidden mb-6 relative">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" onError={(e) => e.currentTarget.style.display = 'none'} />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><Target className="w-12 h-12 text-zinc-300" strokeWidth={iconStroke || 2} /></div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-[var(--theme-radius)] text-[10px] font-bold uppercase tracking-widest text-[color-mix(in_srgb,var(--theme-primary)_80%,black)]">
                    {item.origin || "Blend"}
                  </div>
                </div>
                <div className="flex-1 flex flex-col">
                  <h3 className="text-sm md:text-sm md:text-base font-bold text-[var(--theme-primary)] mb-2">{item.name}</h3>
                  <p className="text-sm text-zinc-500 mb-6 leading-relaxed flex-1">{item.description || "Precisely profiled for optimal extraction."}</p>
                  <div className="mt-auto flex justify-between items-center pt-4 border-t border-zinc-100">
                    <span className="font-bold text-lg">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                    <motion.button aria-label={`Add ${item.name} to cart`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="px-4 py-2 rounded-[var(--theme-radius)] bg-[var(--theme-primary)] text-white text-sm font-bold hover:bg-zinc-700 transition-colors">
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 7. FAQ */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16 bg-white">
        <div className="max-w-3xl mx-auto">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-bold tracking-tight mb-12 text-center">Frequently Asked Questions</motion.h2>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-zinc-50 rounded-[var(--theme-radius)] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-6 flex justify-between items-center text-left hover:bg-zinc-100 transition-colors">
                  <span className="font-bold text-lg">{faq.question}</span>
                  <span className="text-zinc-500">
                    {openFaq === idx ? <Minus className="w-5 h-5" strokeWidth={iconStroke || 2} /> : <Plus className="w-5 h-5" strokeWidth={iconStroke || 2} />}
                  </span>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-4 md:px-6 pb-6 pt-2">
                        <p className="text-zinc-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 8. FOOTER & SECONDARY CTA */}
      <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="px-4 md:px-6 py-8 md:py-16 md:py-32 md:px-16 bg-[var(--theme-primary)] text-white text-center rounded-[3rem] mx-4 md:mx-8 mb-4">
        <div className="max-w-2xl mx-auto mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-bold tracking-tight mb-6">Upgrade Your Coffee Program</motion.h2>
          <p className="text-zinc-400 mb-10 text-lg">Stop guessing. Start extracting perfectly.</p>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="inline-block bg-white text-[var(--theme-primary)] px-10 py-4 rounded-[var(--theme-radius)] font-bold hover:bg-zinc-200 transition-colors">
            Contact Wholesale Team
          </button>
        </div>
        
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10 border-t border-[color-mix(in_srgb,var(--theme-primary)_80%,black)] pt-16 text-left">
          <div>
            <h3 className="text-2xl font-bold tracking-tight mb-4">{tenant?.name}</h3>
            <p className="text-zinc-400 max-w-sm text-sm leading-relaxed">
              {footer}
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-zinc-400">
            <span className="text-white font-bold uppercase tracking-wider text-xs mb-2">Connect</span>
            {igLink && <a href={igLink} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">Instagram</a>}
            {emailLink && <a href={emailLink} className="hover:text-white transition-colors">Email</a>}
            {waLink && <a href={waLink} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">WhatsApp</a>}
          </div>
        </div>
        <div className="mt-16 text-zinc-600 text-sm">
          © {new Date().getFullYear()} {tenant?.name}. Precision Roasters.
        </div>
      </motion.section>

    </div>
  );
}
