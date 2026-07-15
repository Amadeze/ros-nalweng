"use client";

import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, X, ShoppingBag } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";
import { useRef } from "react";

export function CinematicTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  // Cinematic is inherently dark, we force dark styles regardless of toggle
  const bgClass = 'bg-[#000000] text-[#FFFFFF]';
  const accentClass = 'bg-white text-black hover:bg-zinc-200';
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 1.1]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, 100]);

  return (
    <div ref={containerRef} className={`min-h-screen ${bgClass} font-sans overflow-x-hidden selection:bg-white/20 selection:text-white`}>
      
      {/* Header - Disappears on scroll to maintain cinematic feel */}
      <motion.header 
        style={{ opacity: heroOpacity }}
        className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-10"
      >
        <div className="flex items-center gap-4">
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} className="w-12 h-12 object-contain filter invert opacity-90" />
          ) : (
            <Coffee size={32} weight="light" className="opacity-90" />
          )}
          <h1 className="text-xl font-light tracking-[0.2em] uppercase opacity-90">{tenant.name}</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="flex items-center gap-3 text-sm font-light tracking-[0.2em] uppercase opacity-80 hover:opacity-100 transition-opacity"
        >
          <ShoppingBag size={24} weight="light" />
          <span>Cart ({cart.items.length})</span>
        </button>
      </motion.header>

      {/* Cinematic Hero */}
      <section className="relative h-[120vh] w-full flex items-center justify-center z-10">
        <motion.div 
          style={{ scale: heroScale, y: heroY }}
          className="absolute inset-0 w-full h-full pointer-events-none"
        >
          {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
            <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover filter brightness-[0.4] contrast-125 saturate-50" />
          ) : (
            <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black"></div>
          )}
          {/* Vignette */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000000_100%)] opacity-80"></div>
          {/* Bottom Fade */}
          <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black to-transparent"></div>
        </motion.div>

        <div className="relative z-10 text-center px-6 max-w-6xl mt-[-20vh]">
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, delay: 0.5 }}
            className="text-xs uppercase tracking-[0.5em] opacity-50 mb-8"
          >
            A Cinematic Experience
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, filter: "blur(20px)" }} animate={{ opacity: 1, filter: "blur(0px)" }} transition={{ duration: 2, ease: "easeOut" }}
            className="text-6xl md:text-8xl lg:text-[7rem] font-light tracking-tighter mb-12 leading-[1]"
          >
            {heroGreeting}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2, delay: 1 }}
            className="text-lg md:text-2xl font-light opacity-50 max-w-3xl mx-auto leading-relaxed"
          >
            {aboutText}
          </motion.p>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="relative z-20 px-6 py-40 max-w-[1400px] mx-auto bg-black">
        <div className="mb-32 max-w-2xl">
          <h3 className="text-4xl md:text-6xl font-light tracking-tighter mb-6">{catalogTitle}</h3>
          <p className="opacity-40 text-xl font-light">{catalogSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-32">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 100 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col group cursor-pointer"
            >
              <div className="w-full aspect-[4/5] overflow-hidden bg-zinc-900 mb-10 relative">
                 {product.imageUrl ? (
                   <img src={product.imageUrl} className="w-full h-full object-cover filter brightness-75 group-hover:brightness-110 group-hover:scale-105 transition-all duration-[2s] ease-out" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><Package size={80} className="opacity-10" weight="light" /></div>
                 )}
                 <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-1000"></div>
                 <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
              </div>
              <div className="flex flex-col flex-1 px-2">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-3xl font-light tracking-tight">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                  <span className="text-xl font-light opacity-60">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                </div>
                <p className="opacity-40 text-base leading-relaxed mb-10 font-light max-w-md">{product.description}</p>
                <div className="mt-auto">
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="group-hover:pl-4 transition-all duration-500 flex items-center gap-4 text-sm uppercase tracking-[0.3em] font-light"
                  >
                    <div className="w-10 h-px bg-white/30 group-hover:bg-white group-hover:w-16 transition-all duration-500"></div>
                    Add to Collection
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* End Scene / Footer */}
      <section className="relative z-20 h-screen w-full flex flex-col items-center justify-center bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 2 }}
          className="text-center"
        >
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} className="w-24 h-24 mx-auto mb-12 object-contain filter invert opacity-20" />
          ) : (
            <Coffee size={64} weight="thin" className="mx-auto mb-12 opacity-20" />
          )}
          <div className="flex flex-col gap-8 mb-20 text-sm uppercase tracking-[0.3em] font-light opacity-60">
            <a href={waLink} className="hover:opacity-100 transition-opacity">WhatsApp Inquiry</a>
            {emailLink && <a href={emailLink} className="hover:opacity-100 transition-opacity">Email Us</a>}
            {igLink && <a href={igLink} className="hover:opacity-100 transition-opacity">Instagram</a>}
          </div>
          <p className="opacity-20 text-xs tracking-[0.2em]">&copy; {new Date().getFullYear()} {tenant.name}. {footerText}</p>
        </motion.div>
      </section>
      
      {/* Cinematic Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.8 }} className="absolute inset-0 bg-black/90 backdrop-blur-xl" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`relative w-full max-w-lg h-full bg-black border-l border-white/5 flex flex-col`}
            >
              <div className="p-10 border-b border-white/5 flex justify-between items-center">
                <h2 className="text-2xl font-light tracking-tighter">Your Collection</h2>
                <button onClick={() => setIsCartOpen(false)} className="opacity-50 hover:opacity-100 transition-opacity"><X size={24} weight="light" /></button>
              </div>
              
              <div className="flex-1 overflow-auto p-10 space-y-12">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-8 group">
                    <div className="w-32 h-40 bg-zinc-900 overflow-hidden">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover filter brightness-75 group-hover:brightness-100 transition-all duration-700" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="text-xl font-light tracking-tight mb-2">{item.name}</h4>
                      <p className="opacity-40 text-sm mb-8 font-light">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-6">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="opacity-40 hover:opacity-100 transition-opacity"><Minus size={16} weight="light" /></button>
                        <span className="font-light text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="opacity-40 hover:opacity-100 transition-opacity"><Plus size={16} weight="light" /></button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 0 && (
                  <div className="pt-16">
                    <h3 className="font-light tracking-[0.2em] text-xs uppercase opacity-40 mb-8">Shipping Information</h3>
                    <div className="space-y-6">
                      <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-4 outline-none transition-colors focus:border-white/40 font-light placeholder:opacity-30" />
                      <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-4 outline-none transition-colors focus:border-white/40 font-light placeholder:opacity-30" />
                      <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b border-white/10 p-4 outline-none transition-colors h-28 focus:border-white/40 font-light placeholder:opacity-30" />
                    </div>
                  </div>
                )}
              </div>
              
              {cart.items.length > 0 && (
                <div className="p-10 border-t border-white/5">
                  <div className="flex justify-between items-end mb-10">
                    <span className="font-light tracking-[0.2em] text-xs uppercase opacity-40">Subtotal</span>
                    <span className="text-3xl font-light">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-6 text-sm tracking-[0.3em] uppercase font-light transition-all ${accentClass}`}>
                    Initialize Order
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Need Minus icon for cart
function Minus(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} fill="currentColor" viewBox="0 0 256 256" {...props}><rect width="256" height="256" fill="none"></rect><line x1="40" y1="128" x2="216" y2="128" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={props.weight === 'light' ? 12 : 16}></line></svg>
  )
}
