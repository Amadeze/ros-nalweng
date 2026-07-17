"use client";

import React, { useState } from "react";
import { ThemeProps } from "../ThemeProps";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, PenTool, Globe, Award, Quote, ArrowRight, Plus, Minus } from "lucide-react";
import { TenantBrand } from "../TenantBrand";

// =============================================================================
// TEMA 5: THE ROASTER'S DIARY (EDITORIAL & STORYTELLING)
// 8-Part Killer Landing Page Anatomy with Dynamic Data
// =============================================================================

export function EditorialTheme({ 
  tenant, products, cart, setIsCartOpen, handleAddToCart, heroGreeting, aboutText: aText, 
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconStroke }: ThemeProps & { products?: any[] }) {
  
  // 1. Dynamic Data / Fallbacks
  const heroText = heroGreeting || tenant?.heroText || "Volume 01: The Search for the Perfect Bean.";
  const aboutText = aText || tenant?.aboutText || "Notes from our travels across the equator, documented in every cup we pour.";
  
  const problemStmt = tenant?.problemStatement || "The market is flooded with mass-produced, soul-less coffee that lacks transparency and narrative.";
  const solutionStmt = tenant?.solutionStatement || "We document every step of our sourcing and roasting process, bringing you coffees with a traceable story and a distinct terroir.";
  const uspStmt = tenant?.uspText || "We aren't just roasters; we are curators. We only select micro-lots that offer an extraordinary sensory experience, chronicled in our seasonal journals.";
  
  const defaultFeatures = [
    { title: "Curated Origins", desc: "Sourced from exclusive, high-altitude micro-lots.", iconName: "Globe" },
    { title: "Artisan Roasting", desc: "Hand-roasted in small batches to highlight terroir.", iconName: "PenTool" },
    { title: "Transparent Sourcing", desc: "Full traceability back to the individual farmer.", iconName: "BookOpen" },
  ];
  const features = (tenant?.features && Array.isArray(tenant.features) && tenant.features.length > 0) ? tenant.features : defaultFeatures;

  const defaultTestimonials = [
    { name: "Julian M.", role: "Coffee Critic", text: "A revelation in every sip. Their sourcing journal is as compelling as their roasting profile.", rating: 5 },
    { name: "The Daily Brew", role: "Publication", text: "Setting a new standard for specialty coffee storytelling and quality.", rating: 5 },
  ];
  const testimonials = (tenant?.testimonials && Array.isArray(tenant.testimonials) && tenant.testimonials.length > 0) ? tenant.testimonials : defaultTestimonials;

  const defaultFaqs = [
    { question: "How often do you rotate your offerings?", answer: "Our catalog updates seasonally, reflecting the harvest cycles of our partner farms." },
    { question: "Do you offer wholesale subscriptions?", answer: "Yes, we provide curated monthly deliveries for cafes seeking rotating single-origin menus." },
  ];
  const faqs = (tenant?.faqs && Array.isArray(tenant.faqs) && tenant.faqs.length > 0) ? tenant.faqs : defaultFaqs;

  const title = catalogTitle || "The Collection";
  const subtitle = catalogSubtitle || "Current Offerings";
  const footer = footerText || tenant?.footerText || "Published daily from the roastery.";
  const bgImage = tenant?.backgroundImageUrl || "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&q=80&w=2000";
  
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Helper for icons
  const renderIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "globe": return <Globe className="w-8 h-8 text-[var(--theme-primary)]" />;
      case "pentool": return <PenTool className="w-8 h-8 text-[var(--theme-primary)]" />;
      case "bookopen": return <BookOpen className="w-8 h-8 text-[var(--theme-primary)]" />;
      case "award": return <Award className="w-8 h-8 text-[var(--theme-primary)]" strokeWidth={iconStroke || 2} />;
      default: return <BookOpen className="w-8 h-8 text-[var(--theme-primary)]" />;
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[var(--theme-primary,#111111)]  selection:bg-[#E5E5E5] selection:text-black">
      
      {/* Navigation - Editorial Header */}
      <header className="fixed top-0 w-full bg-[#FAFAFA] z-50 px-4 md:px-6 md:px-12 pt-6">
        <div className="w-full flex justify-between items-end border-b-2 border-[var(--theme-primary,#111111)] pb-4 bg-[#FAFAFA]">
          <div className="flex-1 hidden md:block">
            <span className="text-xs uppercase tracking-widest  font-bold">Issue No. 1</span>
          </div>
          <div className="flex-2 text-center">
            <div className="text-2xl md:text-4xl md:text-5xl font-black tracking-tighter uppercase ">
              <TenantBrand tenant={tenant} fallback="THE DIARY" />
            </div>
          </div>
          <div className="flex-1 text-right flex justify-end items-center gap-4">
            <button onClick={() => setIsCartOpen(true)} className="text-xs uppercase tracking-widest  font-bold hover:text-gray-500 transition-colors">
              Cart ({cart.getTotalItems(tenant.subdomain || "")})
            </button>
          </div>
        </div>
      </header>

      <main className="pt-32">
        {/* 1. ABOVE THE FOLD (Hero - Magazine Cover Style) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="relative w-full flex flex-col px-4 md:px-6 md:px-12 pb-16">
          <div className="flex-1 flex flex-col md:flex-row gap-12 items-center">
            {/* Left Text Column */}
            <div className="flex-1 md:pr-12 order-2 md:order-1">
              <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-bold leading-[0.9] tracking-tight mb-8">
                {heroText}
              </motion.h1>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} className="prose prose-lg text-[#333] ">
                <p className="first-letter:text-2xl md:text-3xl md:text-5xl md:text-7xl first-letter:font-bold first-letter:mr-3 first-letter:float-left first-line:uppercase first-line:tracking-widest">
                  {aboutText}
                </p>
                <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="mt-12 flex items-center gap-3 border-b border-[var(--theme-primary)] pb-1 uppercase  text-xs font-bold tracking-widest hover:text-gray-500 hover:border-gray-500 transition-colors">
                  Browse The Collection <ArrowRight className="w-4 h-4" strokeWidth={iconStroke || 2} />
                </button>
              </motion.div>
            </div>

            {/* Right Image Column */}
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2 }} className="flex-1 w-full h-[50vh] md:h-[70vh] order-1 md:order-2">
              <div className="w-full h-full relative overflow-hidden bg-gray-200 rounded-[var(--theme-radius)]">
                <img src={bgImage} alt="Cover Story" className="w-full h-full object-cover filter grayscale-[0.5]" />
                <div className="absolute bottom-4 right-4 bg-white px-3 py-1 text-[10px]  font-bold uppercase tracking-widest">
                  Fig 1. The Origin
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Marquee Divider */}
        <div className="w-full overflow-hidden bg-[var(--theme-primary)] text-white py-4 flex whitespace-nowrap border-y-2 border-[var(--theme-primary)] rounded-[var(--theme-radius)]">
          <motion.div animate={{ x: ["0%", "-50%"] }} transition={{ ease: "linear", duration: 15, repeat: Infinity }} className="text-xl  font-bold tracking-tighter uppercase flex gap-12">
            <span>FRESHLY ROASTED</span><span>•</span><span>CURATED SELECTION</span><span>•</span><span>DIRECT TRADE</span><span>•</span>
            <span>FRESHLY ROASTED</span><span>•</span><span>CURATED SELECTION</span><span>•</span><span>DIRECT TRADE</span><span>•</span>
          </motion.div>
        </div>

        {/* 2. PROBLEM & SOLUTION (Editorial Article Format) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 md:px-12 max-w-5xl mx-auto">
          <div className="border-t-4 border-[var(--theme-primary)] pt-6 flex flex-col md:flex-row gap-12">
            <div className="md:w-1/3">
              <span className=" font-bold uppercase tracking-widest text-xs border-b border-[var(--theme-primary)] pb-1">The Dilemma</span>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-black  uppercase tracking-tighter mt-4 leading-none">The Lost Narrative</motion.h2>
            </div>
            <div className="md:w-2/3">
              <p className="text-xl leading-relaxed mb-8 italic">"{problemStmt}"</p>
              <div className="w-16 h-px bg-[var(--theme-primary)] mb-8"></div>
              <p className="text-lg leading-relaxed">{solutionStmt}</p>
            </div>
          </div>
        </motion.section>

        {/* 3. FEATURES (Multi-column Layout) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 md:px-12 bg-[#F0F0F0]">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 border-b-2 border-[var(--theme-primary)] pb-6">
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-5xl font-black  uppercase tracking-tighter">The Methodology</motion.h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {features.map((feat: any, idx: number) => (
                <motion.div key={idx} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.1 }} className="flex flex-col">
                  <div className="mb-6">{renderIcon(feat.iconName)}</div>
                  <h3 className="text-xl font-bold  uppercase tracking-tight mb-4 border-b border-[var(--theme-primary)]/30 pb-2">{feat.title}</h3>
                  <p className="text-[#555] leading-relaxed text-sm md:text-base">{feat.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF (Testimonials - Blockquotes) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 md:px-12 max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className=" font-bold uppercase tracking-widest text-xs">Reviews</span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-4xl font-black  uppercase tracking-tighter mt-2">Critical Acclaim</motion.h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {testimonials.map((testi: any, idx: number) => (
              <div key={idx} className="border-l-4 border-[var(--theme-primary)] pl-8 py-2">
                <Quote className="w-8 h-8 text-[var(--theme-primary)]/20 mb-4" strokeWidth={iconStroke || 2} />
                <p className="text-xl italic mb-6 leading-relaxed">"{testi.text}"</p>
                <div className="">
                  <p className="font-bold uppercase tracking-tight">{testi.name}</p>
                  <p className="text-xs uppercase tracking-widest text-gray-500">{testi.role}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* 5. WHY CHOOSE US */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-8 md:py-16 md:py-32 px-4 md:px-6 md:px-12 bg-[var(--theme-primary)] text-[#FAFAFA] text-center">
          <div className="max-w-4xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-4xl md:text-6xl font-black  uppercase tracking-tighter mb-8">Our Manifesto</motion.h2>
            <p className="text-2xl italic leading-relaxed font-light text-gray-300">
              {uspStmt}
            </p>
          </div>
        </motion.section>

        {/* 6. OFFER / PRICING (Catalog - Editorial Grid) */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} id="catalog" className="px-4 md:px-6 py-12 md:py-24 md:px-12 max-w-7xl mx-auto">
          <div className="flex justify-between items-end border-b-2 border-[var(--theme-primary)] pb-4 mb-16">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl font-black  uppercase tracking-tighter">{title}</motion.h2>
            <span className="text-sm  font-bold uppercase tracking-widest hidden md:block">{subtitle}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-8">
            {products?.filter(p => p.type === "FINISHED_GOODS" || p.type === "ROASTED_BEAN").map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }} className="group cursor-pointer flex flex-col hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:-translate-y-1 transition-all duration-500 ease-out">
                <div className="w-full aspect-[3/4] bg-gray-100 overflow-hidden mb-4 relative rounded-[var(--theme-radius)]">
                  <img src={item.imageUrl || "https://images.unsplash.com/photo-1497935586351-b67a49e012bf?auto=format&fit=crop&q=80"} alt={item.name} className="w-full h-full object-cover filter grayscale group-hover:grayscale-0 transition-all duration-700" />
                </div>
                <div className="border-t border-[var(--theme-primary)] pt-3 flex-1 flex flex-col">
                  <h3 className="text-sm md:text-base font-bold  uppercase tracking-tight mb-1">{item.name}</h3>
                  <p className="text-xs  text-gray-500 uppercase tracking-widest mb-4">{item.origin || "Origin"}</p>
                  <div className="flex justify-between items-center  text-sm italic mt-auto pt-4 border-t border-gray-200">
                    <span>Rp {Number(item.price).toLocaleString('id-ID')}</span>
                    <motion.button aria-label={`Add ${item.name} to cart`} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handleAddToCart(item)} className="hover:underline  not-italic text-xs font-bold uppercase tracking-widest">Add to Cart</motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 7. FAQ */}
        <motion.section initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, ease: "easeOut" }} className="py-12 md:py-24 px-4 md:px-6 md:px-12 max-w-3xl mx-auto border-t-4 border-[var(--theme-primary)]">
          <div className="mb-12">
            <span className=" font-bold uppercase tracking-widest text-xs">Appendix</span>
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl font-black  uppercase tracking-tighter mt-2">Frequently Asked Questions</motion.h2>
          </div>
          <div className="space-y-2">
            {faqs.map((faq: any, idx: number) => (
              <div key={idx} className="border-b border-[var(--theme-primary)]/20">
                <button onClick={() => setOpenFaq(openFaq === idx ? null : idx)} className="w-full py-6 flex justify-between items-center text-left hover:bg-gray-50 transition-colors">
                  <span className="font-bold  text-lg tracking-tight pr-8">{faq.question}</span>
                  {openFaq === idx ? <Minus className="w-5 h-5 flex-shrink-0" strokeWidth={iconStroke || 2} /> : <Plus className="w-5 h-5 flex-shrink-0" strokeWidth={iconStroke || 2} />}
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="pb-8 pt-2 text-[#555] leading-relaxed italic">
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
      <footer className="bg-[var(--theme-primary)] text-white py-12 md:py-24 px-4 md:px-6 md:px-12 border-t-8 border-[#FAFAFA]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24 pb-24 border-b border-gray-800">
            <div>
              <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.7, ease: "easeOut" }} className="text-2xl md:text-3xl md:text-5xl md:text-7xl font-black  uppercase tracking-tighter mb-8">Ready to Stock?</motion.h2>
              <button onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })} className="border border-white px-4 md:px-8 py-4 uppercase  font-bold tracking-widest hover:bg-white hover:text-[var(--theme-primary)] transition-colors text-sm">
                View Wholesale Catalog
              </button>
            </div>
            <div className="flex flex-col justify-end items-start md:items-end text-left md:text-right">
              <span className=" text-xs uppercase tracking-widest font-bold mb-4 text-gray-500">Subscribe to our dispatch</span>
              <div className="flex w-full max-w-sm border-b border-gray-600 pb-2">
                <input type="email" placeholder="Email Address" className="bg-transparent outline-none flex-1  italic text-sm text-white placeholder-gray-600" />
                <button className=" text-xs font-bold uppercase tracking-widest hover:text-gray-400">Join</button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-end">
            <div>
              <div className="text-2xl md:text-3xl font-black uppercase  tracking-tighter mb-4">{tenant?.name}</div>
              <p className="text-gray-400  italic text-sm max-w-xs">
                {footer}
              </p>
            </div>
            <div className="md:text-center text-gray-600  text-xs uppercase tracking-widest font-bold">
              © {new Date().getFullYear()} All Rights Reserved.
            </div>
            <div className="flex flex-col md:flex-row justify-end gap-6  text-xs uppercase tracking-widest font-bold text-gray-400">
              {igLink && <a href={igLink} target="_blank" className="hover:text-white transition-colors">Instagram</a>}
              {emailLink && <a href={emailLink} className="hover:text-white transition-colors">Email</a>}
              {waLink && <a href={waLink} target="_blank" className="hover:text-white transition-colors">WhatsApp</a>}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
