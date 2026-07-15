"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { Smile, Zap, Sparkles, Heart, Star, Plus, Minus, ArrowRight } from "lucide-react";

// =============================================================================
// TEMA 10: PLAYFUL BREW (VIBRANT & POP ART)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function PlayfulTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Wake Up & Smell the Magic!";
  const aboutText = aText || tenant?.aboutText || "Bright, bold, and bursting with flavor. We don't do boring coffee here.";
  
  const problemStmt = tenant?.problemStatement || "Tired of the same old, bitter, boring brown liquid every morning? Yawn.";
  const solutionStmt = tenant?.solutionStatement || "Say hello to coffee that actually tastes like a party! We roast fun, vibrant beans that make your tastebuds do a happy dance.";
  const uspStmt = tenant?.uspText || "100% Fun. 0% Snobbery. Coffee should make you smile, not stress.";
  
  const defaultFeatures = [
    { title: "Crazy Flavors", desc: "Notes of berries, candy, and pure joy.", iconName: "Sparkles" },
    { title: "Super Fresh", desc: "Roasted literally yesterday. Maybe today.", iconName: "Zap" },
    { title: "Good Vibes", desc: "Ethically sourced because we care.", iconName: "Heart" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Jess K.", role: "Coffee Lover", text: "Literally the most fun I've ever had drinking coffee. The packaging alone is a mood.", rating: 5 },
    { name: "Tom B.", role: "Morning Person", text: "This coffee turned me into a morning person. I didn't even know that was possible.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "Are these flavors artificial?", answer: "Heck no! All those crazy flavors are 100% natural tasting notes from the bean itself." },
    { question: "How do I brew this?", answer: "Any way you want! But it shines brightest as a pour-over or cold brew." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "The Good Stuff";
  const subtitle = catalogSubtitle || "Pick your poison (the good kind)!";
  const footer = footerText || tenant?.footerText || "Drink Coffee. Be Awesome.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&q=80&w=2000";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "sparkles": return <Sparkles className="w-10 h-10 text-black" strokeWidth={iconStroke || 2} />;
      case "zap": return <Zap className="w-10 h-10 text-black" strokeWidth={iconStroke || 2} />;
      case "heart": return <Heart className="w-10 h-10 text-black" strokeWidth={iconStroke || 2} />;
      case "smile": return <Smile className="w-10 h-10 text-black" strokeWidth={iconStroke || 2} />;
      default: return <Sparkles className="w-10 h-10 text-black" strokeWidth={iconStroke || 2} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF0F5] text-[#111111]  overflow-x-hidden selection:bg-[var(--theme-primary,#FF3366)] selection:text-white">
      
      {/* Navigation - Chunky & Playful */}
      <header className="fixed top-6 left-6 right-6 bg-white border-4 border-black rounded-[var(--theme-radius)] p-4 flex justify-between items-center z-50 shadow-[8px_8px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)]">
        <div className="text-xl md:text-2xl font-black tracking-tighter uppercase transform -rotate-2 text-[var(--theme-primary,#FF3366)]">
          {tenant?.name || "POP ROAST"}
        </div>
        <nav className="hidden md:flex gap-6 font-bold text-black uppercase">
          <a href="#about" className="hover:text-[var(--theme-primary,#FF3366)] hover:-translate-y-1 transition-all">Vibes</a>
          <a href="#catalog" className="hover:text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] hover:-translate-y-1 transition-all">Shop</a>
        </nav>
        <button onClick={() => setIsCartOpen(true)} className="bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] border-4 border-black text-black px-4 md:px-6 py-2 rounded-[var(--theme-radius)] font-black uppercase shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all text-sm md:text-base">
          Cart ({cart?.items?.length || 0})
        </button>
      </header>

      <main className="pt-32 pb-12">
        
        {/* 1. ABOVE THE FOLD (Hero) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full min-h-[85vh] flex flex-col items-center justify-center p-6 md:p-12 z-10 mb-20">
          
          <div className="w-full max-w-6xl flex flex-col md:flex-row items-center justify-center gap-12 relative z-10">
            
            <div className="flex-1 text-center md:text-left relative z-20">
              <motion.div initial={{ scale: 0.8, opacity: 0, rotate: -10 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: "spring", bounce: 0.6, duration: 0.8 }}>
                <h1 className="text-2xl md:text-4xl md:text-6xl md:text-8xl lg:text-[7rem] font-black uppercase leading-[0.9] tracking-tighter mb-6 text-black drop-shadow-[6px_6px_0px_#FFCC00]">
                  {heroText}
                </h1>
              </motion.div>
              
              <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2, type: "spring", stiffness: 100 }}>
                <p className="text-xl md:text-2xl font-bold mb-10 max-w-lg bg-white inline-block border-4 border-black p-4 rounded-[var(--theme-radius)] shadow-[6px_6px_0px_0px_#FF3366] transform rotate-1">
                  {aboutText}
                </p>
                <br/>
                <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-[var(--theme-primary,#FF3366)] text-white border-4 border-black px-10 py-5 rounded-[var(--theme-radius)] font-black uppercase text-xl shadow-[8px_8px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all inline-flex items-center gap-2">
                  Gimme Coffee! <ArrowRight className="w-6 h-6" strokeWidth={iconStroke || 2} />
                </button>
              </motion.div>
            </div>

            {/* Abstract Pop Art Blob / Image */}
            <motion.div initial={{ scale: 0, rotate: 90 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: "spring", bounce: 0.5, duration: 1.2, delay: 0.3 }} className="flex-1 w-full max-w-md aspect-square relative z-10 mt-12 md:mt-0">
              <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] rounded-[3rem] translate-x-6 translate-y-6 border-4 border-black"></div>
              <div className="absolute inset-0 bg-[#FFCC00] rounded-[var(--theme-radius)] -translate-x-4 -translate-y-4 border-4 border-black"></div>
              <div className="absolute inset-0 rounded-[2rem] border-4 border-black overflow-hidden bg-white z-10 p-2 transform rotate-3">
                <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-gray-100">
                  <img src={bgImage} alt="Vibrant Coffee" className="w-full h-full object-cover filter contrast-125 saturate-150" />
                </div>
              </div>
              
              {/* Floating Stickers */}
              <motion.div animate={{ y: [0, -20, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-10 -right-10 bg-white border-4 border-black p-4 rounded-[var(--theme-radius)] font-black text-2xl md:text-3xl z-20 shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] rotate-12">
                💥
              </motion.div>
              <motion.div animate={{ y: [0, 20, 0] }} transition={{ repeat: Infinity, duration: 2.5 }} className="absolute -bottom-6 -left-6 bg-white border-4 border-black p-4 rounded-[var(--theme-radius)] font-black text-2xl md:text-3xl z-20 shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] -rotate-12">
                ✨
              </motion.div>
            </motion.div>
          </div>

          {/* Background Patterns */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            <div className="absolute top-1/4 left-10 w-32 h-32 rounded-[var(--theme-radius)] border-[8px] border-black opacity-10"></div>
            <div className="absolute bottom-1/4 right-20 w-48 h-48 bg-black opacity-5 rotate-45"></div>
          </div>
        </motion.section>

        {/* 2. PROBLEM & SOLUTION */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="about" className="py-12 md:py-24 px-4 md:px-6 relative overflow-hidden">
          {/* Funky wavy border top */}
          <div className="absolute top-0 left-0 right-0 h-4 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxwYXRoIGQ9Ik0wIDEwIEMgMjAgMCwgMzAgMCwgNTAgMTAgQyA3MCAyMCwgODAgMjAsIDEwMCAxMCBMIDEwMCAwIEwgMCAwIFoiIGZpbGw9IiMwMDAiLz48L3N2Zz4=')] bg-repeat-x bg-[length:100px_4px]"></div>
          
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8 items-stretch">
            <div className="flex-1 bg-white border-4 border-black rounded-[var(--theme-radius)] p-10 shadow-[8px_8px_0px_0px_#33CCFF] transform -rotate-1">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
                <span className="text-2xl md:text-3xl md:text-5xl">🥱</span> The Boring
              </motion.h2>
              <p className="text-2xl font-bold leading-relaxed">"{problemStmt}"</p>
            </div>
            <div className="flex-1 bg-[#FFCC00] border-4 border-black rounded-[var(--theme-radius)] p-10 shadow-[8px_8px_0px_0px_#FF3366] transform rotate-2">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-4 flex items-center gap-4">
                <span className="text-2xl md:text-3xl md:text-5xl">🤩</span> The Awesome
              </motion.h2>
              <p className="text-2xl font-bold leading-relaxed">{solutionStmt}</p>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-7xl mx-auto">
          <div className="text-center mb-16 relative inline-block mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black uppercase tracking-tighter text-black drop-shadow-[4px_4px_0px_#FFCC00] relative z-10">Why We Rule</motion.h2>
            <div className="absolute -bottom-4 -right-8 text-2xl md:text-4xl transform rotate-12 z-0">👑</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feat: any, idx: number) => (
              <motion.div key={idx} initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5, delay: idx * 0.1 }} className="bg-white border-4 border-black rounded-[var(--theme-radius)] p-8 text-center shadow-[6px_6px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:-translate-y-2 hover:shadow-[10px_10px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] transition-all">
                <div className={`w-24 h-24 mx-auto rounded-[var(--theme-radius)] border-4 border-black flex items-center justify-center mb-6 shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] ${idx % 3 === 0 ? 'bg-[var(--theme-primary,#FF3366)]' : idx % 3 === 1 ? 'bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]' : 'bg-[#FFCC00]'}`}>
                  {renderIcon(feat.iconName)}
                </div>
                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4">{feat.title}</h3>
                <p className="text-xl font-bold text-gray-700">{feat.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-6xl mx-auto">
          <div className="bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] border-4 border-black rounded-[3rem] p-8 md:p-16 shadow-[12px_12px_0px_0px_#FF3366] relative">
            <div className="absolute -top-10 -left-10 bg-white border-4 border-black rounded-[var(--theme-radius)] p-6 text-2xl md:text-4xl md:text-6xl shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] transform -rotate-12">
              💌
            </div>
            
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-black uppercase tracking-tighter mb-12 text-center text-white drop-shadow-[4px_4px_0px_#000]">Fan Mail</motion.h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {testimonials.map((testi: any, idx: number) => (
                <div key={idx} className="bg-white border-4 border-black rounded-[var(--theme-radius)] p-6 shadow-[6px_6px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] transform hover:rotate-1 transition-transform">
                  <div className="flex gap-1 mb-4">
                    {Array.from({length: 5}).map((_, i) => (
                      <Star key={i} className={`w-6 h-6 ${i < (testi.rating || 5) ? 'fill-[#FFCC00] text-black' : 'fill-white text-gray-300'} stroke-[2px]`} strokeWidth={iconStroke || 2} />
                    ))}
                  </div>
                  <p className="text-xl font-bold mb-6">"{testi.text}"</p>
                  <div className="flex items-center gap-4 border-t-4 border-dashed border-gray-200 pt-4">
                    <div className="w-12 h-12 bg-[var(--theme-primary,#FF3366)] border-2 border-black rounded-[var(--theme-radius)] flex items-center justify-center font-black text-white text-xl">
                      {testi.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-lg uppercase">{testi.name}</p>
                      <p className="font-bold text-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">{testi.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 text-center">
          <motion.div initial={{ scale: 0.9 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ type: "spring", bounce: 0.5 }} className="inline-block relative">
            <div className="bg-[#FFCC00] border-8 border-black rounded-[var(--theme-radius)] px-5 md:px-12 py-8 md:py-16 md:px-24 md:py-24 shadow-[16px_16px_0px_0px_#FF3366] transform rotate-2">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-black uppercase tracking-tighter mb-6">No Fake Stuff.</motion.h2>
              <p className="text-2xl md:text-3xl font-bold max-w-2xl mx-auto">
                {uspStmt}
              </p>
            </div>
            {/* Sparkles */}
            <div className="absolute top-0 right-0 text-2xl md:text-3xl md:text-5xl transform translate-x-1/2 -translate-y-1/2 animate-spin-slow">✨</div>
            <div className="absolute bottom-0 left-0 text-2xl md:text-3xl md:text-5xl transform -translate-x-1/2 translate-y-1/2 animate-bounce">☕</div>
          </motion.div>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 md:px-12 relative z-10 bg-[var(--theme-primary,#FF3366)] border-y-8 border-black mt-20">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-20 relative">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black uppercase tracking-tighter text-white drop-shadow-[6px_6px_0px_#000]">
                {title}
              </motion.h2>
              <p className="text-2xl font-black mt-4 bg-white text-black inline-block px-4 md:px-6 py-2 border-4 border-black transform -rotate-2 shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)]">{subtitle}</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
              {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.5, rotate: i % 2 === 0 ? -5 : 5 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -1 : 1 }}
                  viewport={{ once: true }}
                  transition={{ type: "spring", bounce: 0.6 }}
                  className="bg-white border-4 border-black rounded-[2rem] p-3 md:p-5 shadow-[8px_8px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] group hover:-translate-y-4 hover:shadow-[12px_12px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] transition-all flex flex-col"
                >
                  <div className="w-full aspect-square bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] rounded-[var(--theme-radius)] border-4 border-black overflow-hidden mb-6 relative">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl md:text-4xl md:text-6xl">🍭</div>
                    )}
                    <div className="absolute top-2 right-2 bg-[#FFCC00] border-2 border-black px-3 py-1 font-black text-xs uppercase transform rotate-3 shadow-[2px_2px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)]">
                      {item.origin || "YUM"}
                    </div>
                  </div>
                  <h3 className="text-base md:text-sm md:text-sm md:text-base font-black uppercase tracking-tight mb-2 leading-none">{item.name}</h3>
                  <p className="font-bold text-gray-600 text-sm mb-6 flex-1">
                    {item.description || "Tastes like a party in your mouth."}
                  </p>
                  <div className="flex justify-between items-center mt-auto border-t-4 border-dashed border-gray-200 pt-4">
                    <span className="font-black text-2xl">Rp {Number(item.price).toLocaleString('id-ID')}</span>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="bg-[#FFCC00] text-black border-4 border-black w-12 h-12 rounded-[var(--theme-radius)] font-black text-2xl shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all flex items-center justify-center">
                      <Plus strokeWidth={4} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_#33CCFF]">Brain Juice (FAQ)</motion.h2>
          </div>
          <div className="space-y-6">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="bg-white border-4 border-black rounded-[var(--theme-radius)] shadow-[6px_6px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full p-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
                  <span className="font-black text-xl uppercase pr-4">{faq.question}</span>
                  <div className={`flex-shrink-0 w-10 h-10 border-4 border-black rounded-[var(--theme-radius)] flex items-center justify-center transition-colors ${openFaq === idx ? 'bg-[var(--theme-primary,#FF3366)] text-white' : 'bg-[#FFCC00] text-black'}`}>
                    {openFaq === idx ? <Minus strokeWidth={4} /> : <Plus strokeWidth={4} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-6 pt-0 border-t-4 border-dashed border-gray-200 mt-2">
                        <p className="font-bold text-lg text-gray-700 leading-relaxed">
                          {faq.answer}
                        </p>
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
      <footer className="bg-[#FFCC00] py-10 md:py-20 px-4 md:px-6 border-t-[16px] border-black text-center relative z-10 overflow-hidden">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 20, ease: "linear" }} className="absolute -top-32 -right-32 w-64 h-64 bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)] rounded-[var(--theme-radius)] border-8 border-black z-0"></motion.div>
        
        <div className="relative z-10 max-w-4xl mx-auto mb-20">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl md:text-8xl font-black uppercase tracking-tighter mb-8 text-black drop-shadow-[6px_6px_0px_#FF3366]">
            Let's Gooooo!
          </motion.h2>
          <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white border-4 border-black px-5 md:px-12 py-6 rounded-[var(--theme-radius)] font-black uppercase text-2xl shadow-[8px_8px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all inline-block transform -rotate-1">
            Shop Now!
          </button>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto border-t-8 border-black pt-12">
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl font-black uppercase tracking-tighter mb-8">{tenant?.name}</motion.h2>
          
          <div className="flex flex-wrap justify-center gap-6 font-black text-xl uppercase mb-10">
            {igLink && <a href={igLink} target="_blank" className="bg-white border-4 border-black px-4 md:px-6 py-3 rounded-[var(--theme-radius)] shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all hover:bg-[var(--theme-primary,#FF3366)] hover:text-white">Instagram</a>}
            {emailLink && <a href={emailLink} className="bg-white border-4 border-black px-4 md:px-6 py-3 rounded-[var(--theme-radius)] shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all hover:bg-[color-mix(in_srgb,var(--theme-primary)_80%,transparent)]">Email</a>}
            {waLink && <a href={waLink} target="_blank" className="bg-white border-4 border-black px-4 md:px-6 py-3 rounded-[var(--theme-radius)] shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all hover:bg-[#58CC02] hover:text-white">WhatsApp</a>}
          </div>
          
          <p className="font-bold text-black border-4 border-black inline-block px-4 md:px-6 py-3 bg-white rounded-[var(--theme-radius)] shadow-[4px_4px_0px_0px_color-mix(in_srgb,var(--theme-primary)_100%,transparent)]">
            {footer}
          </p>
        </div>
      </footer>

    </div>
  );
}
