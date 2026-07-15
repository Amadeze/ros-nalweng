"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Heart, Coffee, Shield, Star, Plus, Minus, Check, ArrowRight } from "lucide-react";

// =============================================================================
// TEMA 8: COFFEE CLUB (SUBSCRIPTION & COMMUNITY)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function ClubTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Join the Daily Grind.";
  const aboutText = aText || tenant?.aboutText || "More than just coffee. It's a community of early risers, dreamers, and doers.";
  
  const problemStmt = tenant?.problemStatement || "Are you constantly running out of fresh coffee just when you need it most?";
  const solutionStmt = tenant?.solutionStatement || "Join our community and get freshly roasted, expertly curated beans delivered straight to your door, exactly when you need them.";
  const uspStmt = tenant?.uspText || "We believe in better mornings. Better coffee, better community, better days.";
  
  const defaultFeatures = [
    { title: "Fresh Delivery", desc: "Roasted to order and shipped immediately.", iconName: "Coffee" },
    { title: "Curated Selection", desc: "Discover new origins and blends every month.", iconName: "Heart" },
    { title: "Member Perks", desc: "Exclusive access to limited releases and merch.", iconName: "Users" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Sarah J.", role: "Daily Brewer", text: "The subscription is a lifesaver. It feels like getting a gift from a friend every month.", rating: 5 },
    { name: "Mike D.", role: "Home Barista", text: "Best club I've ever joined. The community aspect really sets it apart.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "Can I pause my subscription?", answer: "Absolutely. You can pause, skip a delivery, or cancel anytime from your account dashboard." },
    { question: "Do I get to pick my coffee?", answer: "You can choose a specific blend, or opt for the 'Roaster's Choice' for a monthly surprise." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "Pick Your Plan";
  const subtitle = catalogSubtitle || "Freshly roasted beans delivered right to your door. Never run out of good coffee again.";
  const footer = footerText || tenant?.footerText || "Brewing community since 2024. Join the club.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1521017432531-fbd92d768814?auto=format&fit=crop&q=80&w=2000";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "coffee": return <Coffee className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" strokeWidth={iconStroke || 2} />;
      case "heart": return <Heart className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" strokeWidth={iconStroke || 2} />;
      case "users": return <Users className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" />;
      case "shield": return <Shield className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" strokeWidth={iconStroke || 2} />;
      default: return <Coffee className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF8] text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]  selection:bg-[var(--theme-primary,#E67E22)] selection:text-white pb-6">
      
      {/* Navigation - Friendly & Rounded */}
      <header className="fixed top-4 left-4 right-4 bg-white/90 backdrop-blur-md rounded-[var(--theme-radius)] shadow-sm px-4 md:px-6 py-4 flex justify-between items-center z-50">
        <div className="text-xl md:text-2xl font-black tracking-tight text-[var(--theme-primary,#E67E22)]">
          {tenant?.name || "The Coffee Club"}
        </div>
        <div className="flex gap-4 items-center">
          <button onClick={() => setIsCartOpen(true)} className="bg-[var(--theme-primary,#E67E22)] text-white px-4 md:px-6 py-2 rounded-[var(--theme-radius)] font-bold hover:bg-[#D35400] transition-colors shadow-md hover:shadow-lg text-sm">
            Cart ({cart?.items?.length || 0})
          </button>
        </div>
      </header>

      <main className="pt-24 px-4 md:px-8">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full min-h-[85vh] flex flex-col mb-24">
          <div className="flex-1 relative rounded-[3rem] overflow-hidden bg-[#34495E] flex items-center justify-center shadow-xl">
            
            <div className="absolute inset-0 z-0">
              <img src={bgImage} alt="Community" className="w-full h-full object-cover opacity-40 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C3E50] via-[#2C3E50]/50 to-transparent" />
            </div>

            <div className="relative z-10 text-center max-w-4xl px-4 md:px-6 py-10 md:py-20">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 60, damping: 20 }}>
                <div className="inline-block bg-[#F1C40F] text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] font-black uppercase text-xs tracking-widest px-4 py-2 rounded-[var(--theme-radius)] mb-8 shadow-lg transform -rotate-2">
                  ☕ MEMBER'S ONLY BENEFITS
                </div>
                <h1 className="text-2xl md:text-3xl md:text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[1.1] mb-6 text-white">
                  {heroText}
                </h1>
                <p className="text-lg md:text-2xl text-[#BDC3C7] font-medium max-w-2xl mx-auto mb-10">
                  {aboutText}
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#E67E22)] text-white px-4 md:px-8 py-4 rounded-[var(--theme-radius)] font-black hover:bg-[#D35400] hover:-translate-y-1 transition-all shadow-xl flex items-center justify-center gap-2">
                    Join The Club <ArrowRight className="w-5 h-5" strokeWidth={iconStroke || 2} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 max-w-6xl mx-auto">
          <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-12 items-center">
            <div className="flex-1 text-center md:text-left">
              <span className="text-[var(--theme-primary,#E67E22)] font-black uppercase tracking-widest text-sm mb-4 block">The Struggle</span>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6">Running Empty?</motion.h2>
              <p className="text-xl text-[#7F8C8D] font-medium leading-relaxed">"{problemStmt}"</p>
            </div>
            <div className="w-full md:w-px h-px md:h-32 bg-gray-200"></div>
            <div className="flex-1 text-center md:text-left">
              <span className="text-[#27AE60] font-black uppercase tracking-widest text-sm mb-4 block">The Solution</span>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-6">Never Settle.</motion.h2>
              <p className="text-xl text-[#34495E] font-medium leading-relaxed">{solutionStmt}</p>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">Why Join Us?</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="bg-white rounded-[2rem] p-8 text-center shadow-lg hover:-translate-y-2 transition-transform border border-gray-50">
                <div className="w-20 h-20 mx-auto bg-orange-50 rounded-[var(--theme-radius)] flex items-center justify-center mb-6">
                  {renderIcon(feat.iconName)}
                </div>
                <h3 className="text-2xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-4">{feat.title}</h3>
                <p className="text-[#7F8C8D] font-medium leading-relaxed">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">Club Love</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testi: any, idx: number) => (
              <div key={idx} className="bg-white rounded-[2rem] p-8 shadow-md border border-gray-100">
                <div className="flex gap-1 mb-6">
                  {Array.from({length: 5}).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < (testi.rating || 5) ? 'fill-[#F1C40F] text-[#F1C40F]' : 'fill-gray-200 text-gray-200'}`} strokeWidth={iconStroke || 2} />
                  ))}
                </div>
                <p className="text-lg font-medium text-[#34495E] mb-6 italic">"{testi.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-[var(--theme-radius)] flex items-center justify-center text-gray-500 font-bold">
                    {testi.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">{testi.name}</p>
                    <p className="text-sm font-bold text-[var(--theme-primary,#E67E22)]">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 mb-24 max-w-7xl mx-auto">
          <div className="bg-[var(--theme-primary,#E67E22)] rounded-[3rem] p-12 md:p-20 text-center text-white shadow-2xl relative overflow-hidden">
            {/* Background blobs */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-[var(--theme-radius)] mix-blend-overlay filter blur-3xl -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#D35400] rounded-[var(--theme-radius)] mix-blend-multiply filter blur-3xl translate-x-1/3 translate-y-1/3" />
            
            <div className="relative z-10 max-w-3xl mx-auto">
              <Heart className="w-16 h-16 mx-auto mb-8 text-white" strokeWidth={iconStroke || 2} />
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black mb-6">Community First.</motion.h2>
              <p className="text-xl md:text-2xl font-medium text-orange-100 leading-relaxed">
                {uspStmt}
              </p>
            </div>
          </div>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="py-12 md:py-24 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-4">{title}</motion.h2>
            <p className="text-[#7F8C8D] font-medium max-w-md mx-auto">{subtitle}</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8 items-center">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: "spring", stiffness: 50 }}
                className={`bg-white rounded-[2rem] p-4 md:p-8 border-2 ${i === 1 ? 'border-[var(--theme-primary,#E67E22)] shadow-2xl relative transform md:-translate-y-4 py-12' : 'border-gray-100 shadow-lg'} flex flex-col text-center hover:-translate-y-2 transition-transform duration-300 h-full`}
              >
                {i === 1 && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--theme-primary,#E67E22)] text-white font-black text-xs uppercase px-4 py-1 rounded-[var(--theme-radius)] shadow-md">
                    Most Popular
                  </div>
                )}
                
                <div className="w-28 h-28 mx-auto bg-gray-50 rounded-[var(--theme-radius)] overflow-hidden mb-6 border-4 border-white shadow-sm">
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-orange-50"><Coffee className="w-8 h-8 text-[var(--theme-primary,#E67E22)]" strokeWidth={iconStroke || 2} /></div>
                  )}
                </div>
                
                <h3 className="text-base md:text-sm md:text-sm md:text-base font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] mb-2">{item.name}</h3>
                <p className="text-sm font-bold text-[var(--theme-primary,#E67E22)] uppercase mb-4">{item.origin || "Curated Blend"}</p>
                <p className="text-[#7F8C8D] text-sm mb-8 flex-1">
                  {item.description || "Perfect for daily drinkers who want consistency and quality."}
                </p>
                
                <div className="mb-8">
                  <span className="text-2xl md:text-3xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                  <span className="text-[#7F8C8D] font-medium">/mo</span>
                </div>
                
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className={`w-full py-4 rounded-[var(--theme-radius)] font-black text-sm transition-all ${i === 1 ? 'bg-[var(--theme-primary,#E67E22)] text-white hover:bg-[#D35400] shadow-lg' : 'bg-gray-100 text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] hover:bg-gray-200'}`}>
                  Select Plan
                </motion.button>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">Got Questions?</motion.h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-white rounded-[var(--theme-radius)] border border-gray-100 shadow-sm overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] text-lg">{faq.question}</span>
                  <div className={`w-8 h-8 rounded-[var(--theme-radius)] flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-[var(--theme-primary,#E67E22)] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {openFaq === idx ? <Minus className="w-4 h-4" strokeWidth={iconStroke || 2} /> : <Plus className="w-4 h-4" strokeWidth={iconStroke || 2} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                      <div className="px-4 md:px-6 pb-6 text-[#7F8C8D] font-medium leading-relaxed">
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
      <footer className="bg-[#34495E] text-white pt-24 pb-12 px-4 md:px-8 mt-12 rounded-[3rem] mx-4 md:mx-8 shadow-2xl relative overflow-hidden">
        {/* Background graphic */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-[var(--theme-radius)] filter blur-3xl translate-x-1/2 -translate-y-1/2" />

        <div className="max-w-4xl mx-auto text-center mb-24 relative z-10">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black mb-8">Ready for Better Mornings?</motion.h2>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#E67E22)] text-white px-10 py-5 rounded-[var(--theme-radius)] font-black hover:bg-[#D35400] transition-colors shadow-xl text-lg inline-flex items-center gap-3">
            Join The Club <ArrowRight className="w-5 h-5" strokeWidth={iconStroke || 2} />
          </button>
        </div>

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-12 relative z-10">
          <div className="text-center md:text-left">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-black text-white mb-2">{tenant?.name}</motion.h2>
            <p className="text-[#BDC3C7] font-medium text-sm">
              {footer}
            </p>
          </div>
          
          <div className="flex justify-center gap-4 font-bold text-sm text-white">
            {igLink && <a href={igLink} target="_blank" className="hover:text-[var(--theme-primary,#E67E22)] bg-white/10 hover:bg-white/20 px-4 md:px-6 py-3 rounded-[var(--theme-radius)] transition-all">Instagram</a>}
            {emailLink && <a href={emailLink} className="hover:text-[var(--theme-primary,#E67E22)] bg-white/10 hover:bg-white/20 px-4 md:px-6 py-3 rounded-[var(--theme-radius)] transition-all">Email</a>}
            {waLink && <a href={waLink} target="_blank" className="hover:text-[var(--theme-primary,#E67E22)] bg-white/10 hover:bg-white/20 px-4 md:px-6 py-3 rounded-[var(--theme-radius)] transition-all">WhatsApp</a>}
          </div>
        </div>
      </footer>

    </div>
  );
}
