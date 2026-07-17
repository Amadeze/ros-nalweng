"use client";

import React, { useEffect, useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, Droplets, Sun, Wind, Sprout, Plus, Minus } from "lucide-react";
import { TenantBrand } from "../TenantBrand";

// =============================================================================
// TEMA 4: BOTANICAL LABORATORY (ORGANIC & ECO-FRIENDLY)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function BotanicalTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Rooted in Nature.";
  const aboutText = aText || tenant?.aboutText || "Organic, fair-trade, and grown with respect for the earth. Taste the origin in every cup.";
  
  const problemStmt = tenant?.problemStatement || "Tired of artificial flavors and unsustainable practices harming our planet?";
  const solutionStmt = tenant?.solutionStatement || "We source exclusively from regenerative farms, roasting with zero emissions to bring you coffee that heals the earth.";
  const uspStmt = tenant?.uspText || "Every bean we roast contributes to reforestation. Pure, organic, and meticulously crafted by nature.";
  
  const defaultFeatures = [
    { title: "Regenerative Farming", desc: "Sourced from farms that prioritize soil health.", iconName: "Leaf" },
    { title: "Washed with Care", desc: "Using recycled rainwater for processing.", iconName: "Droplets" },
    { title: "Solar Roasted", desc: "100% renewable energy used in our roastery.", iconName: "Sun" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Sarah J.", role: "Eco-Cafe Owner", text: "The cleanest tasting coffee we've ever served. Our customers love the mission.", rating: 5 },
    { name: "Green Earth Co.", role: "Corporate Partner", text: "Finally a wholesale partner that aligns with our sustainability goals.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "Is your packaging compostable?", answer: "Yes, our wholesale bags are made from 100% plant-based compostable materials." },
    { question: "Do you offer organic certification?", answer: "All our beans are certified organic by global environmental standards." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "Earth's Bounty";
  const subtitle = catalogSubtitle || "Our Offerings";
  const footer = footerText || tenant?.footerText || "100% Compostable packaging. Solar-powered roasting.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&q=80&w=2000";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Mouse trail effect state
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "leaf": return <Leaf className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      case "droplets": return <Droplets className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      case "sun": return <Sun className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />;
      case "wind": return <Wind className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" />;
      default: return <Sprout className="w-8 h-8 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F1] text-[var(--theme-primary,#2C4A3B)]  selection:bg-[#7FA388] selection:text-white relative overflow-hidden">
      
      {/* Organic Mouse Follower */}
      <motion.div 
        animate={{ x: mousePos.x - 150, y: mousePos.y - 150 }}
        transition={{ type: "spring", stiffness: 50, damping: 20, mass: 0.5 }}
        className="fixed w-[300px] h-[300px] bg-[#7FA388]/20 rounded-[var(--theme-radius)] blur-3xl pointer-events-none z-0"
      />

      {/* Navigation - Floating Glass */}
      <header className="fixed top-8 left-8 right-8 bg-white/40 backdrop-blur-md rounded-[var(--theme-radius)] px-4 md:px-8 py-4 flex justify-between items-center shadow-sm border border-white/50 z-50">
        <div className="text-xl font-medium tracking-tight text-[var(--theme-primary,#2C4A3B)] flex items-center gap-2">
          <Leaf className="w-5 h-5 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]" strokeWidth={iconStroke || 2} />
          <TenantBrand tenant={tenant} fallback="Botanical Brews" />
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsCartOpen(true)} className="flex items-center gap-2 px-4 md:px-6 py-2 bg-[var(--theme-primary,#2C4A3B)] text-white rounded-[var(--theme-radius)] text-xs font-bold hover:bg-[var(--theme-primary)] transition-colors shadow-md hover:shadow-xl">
            Cart ({cart.getTotalItems(tenant.subdomain || "")})
          </button>
        </div>
      </header>

      <main className="relative z-10 pt-32 pb-20">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="min-h-[80vh] flex flex-col md:flex-row items-center gap-16 px-4 md:px-8 md:px-16 max-w-7xl mx-auto">
          <div className="flex-1">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1, ease: "easeOut" }}>
              <span className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-medium tracking-widest uppercase text-sm mb-4 block flex items-center gap-2">
                <Sprout className="w-4 h-4" /> Freshly Harvested
              </span>
              <h1 className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] mb-8 text-[var(--theme-primary)]">
                {heroText}
              </h1>
            </motion.div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}>
              <p className="text-lg md:text-xl text-[#4A6B58] font-light max-w-md leading-relaxed mb-10">
                {aboutText}
              </p>
              <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#2C4A3B)] text-white px-4 md:px-8 py-4 rounded-[var(--theme-radius)] font-medium hover:bg-[var(--theme-primary)] hover:shadow-[0_10px_30px_color-mix(in_srgb,var(--theme-primary)_30%,transparent)] transition-all duration-300 flex items-center gap-3">
                <span>Explore Nature's Selection</span>
                <Leaf className="w-4 h-4" strokeWidth={iconStroke || 2} />
              </button>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, delay: 0.2 }} className="flex-1 relative flex justify-center items-center w-full">
            <div className="relative w-full max-w-md aspect-square">
              <div 
                className="absolute inset-0 bg-cover bg-center shadow-[0_20px_50px_color-mix(in_srgb,var(--theme-primary)_20%,transparent)]"
                style={{ 
                  backgroundImage: `url(${bgImage})`,
                  borderRadius: "60% 40% 30% 70% / 60% 30% 70% 40%", 
                  animation: "morph 8s ease-in-out infinite"
                }}
              />
              <style jsx>{`
                @keyframes morph {
                  0% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                  50% { border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%; }
                  100% { border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%; }
                }
              `}</style>
            </div>
          </motion.div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-8 md:px-16 mt-20 bg-white/40 backdrop-blur-sm border-y border-white">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-bold text-[var(--theme-primary)] mb-12">Healing the Earth, One Cup at a Time</motion.h2>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex-1 text-center md:text-right">
                <p className="text-lg text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-medium leading-relaxed italic">"{problemStmt}"</p>
              </motion.div>
              <div className="w-px h-24 bg-[#7FA388]/30 hidden md:block"></div>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="flex-1 text-center md:text-left">
                <p className="text-lg text-[var(--theme-primary,#2C4A3B)] leading-relaxed">{solutionStmt}</p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-8 md:px-16 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white/60 backdrop-blur-md rounded-[var(--theme-radius)] p-10 border border-white hover:shadow-xl hover:bg-white transition-all text-center group">
                <div className="w-16 h-16 bg-[#F0F4F1] rounded-[var(--theme-radius)] flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                  {renderIcon(feat.iconName)}
                </div>
                <h3 className="text-xl font-bold text-[var(--theme-primary)] mb-4">{feat.title}</h3>
                <p className="text-[#4A6B58] leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-8 md:px-16 bg-[var(--theme-primary,#2C4A3B)] text-white">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-[#A3BDB0] font-medium tracking-widest uppercase text-sm mb-2 block">Community Voices</span>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-bold text-white">Words from our Partners</motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testi: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-[var(--theme-primary)] rounded-[var(--theme-radius)] p-10">
                  <div className="flex gap-1 mb-6">
                    {Array.from({length: 5}).map((_, i) => (
                      <Leaf key={i} className={`w-5 h-5 ${i < (testi.rating || 5) ? 'text-[#7FA388] fill-[#7FA388]' : 'text-white/20'}`} strokeWidth={iconStroke || 2} />
                    ))}
                  </div>
                  <p className="text-lg md:text-xl text-[#E2EBE5] mb-8 italic font-light">"{testi.text}"</p>
                  <div>
                    <p className="font-bold text-white">{testi.name}</p>
                    <p className="text-[#7FA388] text-sm">{testi.role}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-8 md:px-16 max-w-4xl mx-auto text-center">
          <Sprout className="w-16 h-16 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mx-auto mb-8" />
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-bold text-[var(--theme-primary)] mb-8">Harmony with Nature</motion.h2>
          <p className="text-xl text-[#4A6B58] leading-relaxed font-light">
            {uspStmt}
          </p>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="py-12 md:py-24 px-4 md:px-8 md:px-16 max-w-7xl mx-auto relative z-10 bg-white/30 backdrop-blur-xl rounded-[3rem] border border-white">
          <div className="mb-16 text-center">
            <span className="text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-medium tracking-widest uppercase text-sm mb-2 block">{subtitle}</span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-bold text-[var(--theme-primary)]">{title}</motion.h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-10">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-2xl transition-all duration-500 group"
              >
                <div className="w-full aspect-[4/5] rounded-[1.5rem] overflow-hidden mb-6 relative bg-[#F0F4F1]">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Leaf className="w-16 h-16 text-[#7FA388]/30" strokeWidth={iconStroke || 2} />
                    </div>
                  )}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-[var(--theme-radius)] text-xs font-bold text-[var(--theme-primary,#2C4A3B)] shadow-sm">
                    {item.origin || "Direct Trade"}
                  </div>
                </div>
                <div className="px-3 pb-2">
                  <h3 className="text-sm md:text-sm md:text-base font-bold text-[var(--theme-primary)] mb-2">{item.name}</h3>
                  <p className="text-sm text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6 line-clamp-2">
                    {item.description || "Cultivated under the canopy of native shade trees."}
                  </p>
                  <div className="flex justify-between items-center pt-4 border-t border-[#F0F4F1]">
                    <span className="font-bold text-xl text-[var(--theme-primary,#2C4A3B)]">Rp{Number(item.price).toLocaleString('id-ID')}</span>
                    <motion.button aria-label={`Add ${item.name} to cart`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="bg-[#E2EBE5] text-[var(--theme-primary,#2C4A3B)] px-5 py-2 rounded-[var(--theme-radius)] font-bold text-sm hover:bg-[var(--theme-primary,#2C4A3B)] hover:text-white transition-colors">
                      Add to Cart
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-8 md:px-16 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)]">Common Inquiries</motion.h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-white rounded-[var(--theme-radius)] shadow-sm border border-[#E2EBE5] overflow-hidden">
                <button 
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-4 md:px-8 py-6 flex justify-between items-center text-left hover:bg-[#F0F4F1] transition-colors"
                >
                  <span className="font-bold text-[var(--theme-primary,#2C4A3B)] text-lg">{faq.question}</span>
                  {openFaq === idx ? <Minus className="w-5 h-5 text-[#7FA388]" strokeWidth={iconStroke || 2} /> : <Plus className="w-5 h-5 text-[#7FA388]" strokeWidth={iconStroke || 2} />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-4 md:px-8 pb-6 text-[#4A6B58] leading-relaxed border-t border-[#E2EBE5] pt-4">
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
      <footer className="bg-[var(--theme-primary,#2C4A3B)] text-[#E2EBE5] py-10 md:py-20 px-4 md:px-8 rounded-t-[3rem] relative z-10">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-bold text-white mb-6">Grow With Us</motion.h2>
          <p className="text-lg text-[#A3BDB0] mb-10 max-w-xl mx-auto">Join a network of sustainable cafes and restaurants serving coffee that makes a difference.</p>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white text-[var(--theme-primary,#2C4A3B)] px-10 py-4 rounded-[var(--theme-radius)] font-bold hover:bg-[#F0F4F1] hover:scale-105 transition-all shadow-lg">
            Partner With Us
          </button>
        </div>

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 pt-10 border-t border-[#4A6B58]">
          <div className="text-center md:text-left flex items-center gap-3">
            <Leaf className="w-6 h-6 text-[#7FA388]" strokeWidth={iconStroke || 2} />
            <h3 className="text-xl font-bold text-white">{tenant?.name}</h3>
          </div>
          <div className="text-[#A3BDB0] text-sm text-center max-w-sm">
            {footer}
          </div>
          <div className="flex gap-6 text-sm font-medium">
            {igLink && <a href={igLink} target="_blank" className="hover:text-white transition-colors">Instagram</a>}
            {emailLink && <a href={emailLink} className="hover:text-white transition-colors">Email</a>}
            {waLink && <a href={waLink} target="_blank" className="hover:text-white transition-colors">WhatsApp</a>}
          </div>
        </div>
      </footer>

    </div>
  );
}
