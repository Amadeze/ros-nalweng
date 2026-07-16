"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, X, Phone, EnvelopeSimple, At } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";
import { useState, useEffect } from "react";

export function CyberpunkTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps
}: ThemeProps) {
  
  const [glitchText, setGlitchText] = useState(tenant.name);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        setGlitchText(tenant.name.split('').map(char => Math.random() > 0.8 ? String.fromCharCode(33 + Math.floor(Math.random() * 94)) : char).join(''));
        setTimeout(() => setGlitchText(tenant.name), 100);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [tenant.name]);

  return (
    <div className="min-h-screen bg-[#050510] text-[#00ffcc] font-mono overflow-x-hidden selection:bg-[#ff00ff] selection:text-white relative">
      <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(0,255,204,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.2)_1px,transparent_1px)] bg-[size:40px_40px] z-0"></div>
      
      <motion.header 
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ type: "spring", stiffness: 100 }}
        className="border-b border-[#00ffcc] bg-[#050510]/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_0_15px_rgba(0,255,204,0.3)]"
      >
        <div className="flex items-center gap-4">
          <motion.div 
            whileHover={{ rotate: 180 }} transition={{ duration: 0.3 }}
            className="w-12 h-12 border border-[#ff00ff] flex items-center justify-center shadow-[0_0_10px_rgba(255,0,255,0.5)] bg-[#050510]"
          >
            {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-10 h-10 object-contain filter hue-rotate-90 saturate-200 contrast-150" /> : <Coffee size={24} color="#ff00ff" />}
          </motion.div>
          <h1 className="text-2xl font-bold uppercase tracking-widest drop-shadow-[0_0_5px_#00ffcc]">SYS.{glitchText.replace(/\s+/g, "_")}</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="border border-[#00ffcc] px-6 py-2 hover:bg-[#00ffcc] hover:text-black transition-colors shadow-[0_0_8px_#00ffcc] uppercase text-sm font-bold relative overflow-hidden group"
        >
          <span className="relative z-10">CART_[{(cart.items[tenant.subdomain || ""] || []).length}]</span>
          <div className="absolute inset-0 bg-[#00ffcc] transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 z-0"></div>
        </button>
      </motion.header>

      <section className="py-24 px-8 max-w-6xl mx-auto flex flex-col md:flex-row gap-16 items-center relative z-10">
        <motion.div initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="flex-1">
          <div className="inline-block px-2 py-1 bg-[#ff00ff]/20 border border-[#ff00ff] text-[#ff00ff] text-xs font-bold uppercase mb-6 tracking-widest">Initialization Protocol</div>
          <h2 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6 text-[#ff00ff] drop-shadow-[0_0_15px_#ff00ff] leading-tight">&gt; {heroGreeting}</h2>
          <p className="text-xl opacity-80 leading-relaxed uppercase border-l-2 border-[#00ffcc] pl-4">{aboutText}</p>
        </motion.div>
        
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 1 }}
          className="w-full md:w-5/12 aspect-[4/5] border-2 border-[#00ffcc] p-2 shadow-[0_0_30px_rgba(0,255,204,0.3)] relative group"
        >
          <div className="absolute inset-0 bg-[#00ffcc]/10 animate-pulse z-20 pointer-events-none"></div>
          <div className="w-full h-full relative overflow-hidden bg-[#0a0a20]">
            {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
              <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover filter contrast-150 saturate-200 hue-rotate-[160deg] opacity-80 group-hover:opacity-100 transition-opacity duration-500 group-hover:scale-110 transform" />
            ) : (
              <div className="w-full h-full flex items-center justify-center"><Package size={64} className="animate-spin-slow opacity-50" /></div>
            )}
            <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#00ffcc_3px,#00ffcc_3px)] opacity-10 mix-blend-overlay z-10 pointer-events-none"></div>
          </div>
          <div className="absolute -bottom-4 -right-4 w-12 h-12 border-b-2 border-r-2 border-[#ff00ff]"></div>
          <div className="absolute -top-4 -left-4 w-12 h-12 border-t-2 border-l-2 border-[#ff00ff]"></div>
        </motion.div>
      </section>

      <section id="catalog" className="py-20 px-8 max-w-7xl mx-auto relative z-10 border-t border-[#00ffcc]/30 bg-[#050510]/80">
        <div className="flex items-center gap-6 mb-16">
          <h3 className="text-3xl font-bold uppercase tracking-widest drop-shadow-[0_0_8px_rgba(0,255,204,0.5)] whitespace-nowrap">
            &gt; MODULE: {catalogTitle}
          </h3>
          <div className="h-px bg-[#00ffcc] flex-1 shadow-[0_0_10px_#00ffcc]"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tenant.products.map((product, i) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="border border-[#00ffcc]/50 bg-[#0a0a1a]/80 backdrop-blur-sm p-6 relative group hover:border-[#00ffcc] hover:shadow-[0_0_25px_rgba(0,255,204,0.3)] transition-all"
            >
              <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#00ffcc]"></div>
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#00ffcc]"></div>
              
              <div className="h-56 border border-[#ff00ff]/30 mb-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff]/50 animate-[scanline_3s_linear_infinite] z-20 pointer-events-none"></div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover opacity-70 group-hover:opacity-100 filter grayscale group-hover:grayscale-0 group-hover:hue-rotate-90 transition-all duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-black"><Coffee size={48} className="opacity-20" color="#ff00ff" /></div>
                )}
              </div>
              <h4 className="font-bold text-xl uppercase mb-2 text-white group-hover:text-[#00ffcc] transition-colors">&gt; {product.name}</h4>
              {product.category && (
                <span className="inline-block mb-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[#00ffcc] text-[#00ffcc] bg-[#00ffcc]/10">
                  {product.category}
                </span>
              )}
              <p className="opacity-70 text-sm mb-6 flex-1 line-clamp-3">DESC_SYS: {product.description}</p>
              <div className="flex justify-between items-center border-t border-[#00ffcc]/30 pt-4">
                <span className="font-bold text-lg text-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff]">CR {Number(product.price).toLocaleString("id-ID")}</span>
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className="bg-[#ff00ff]/10 text-[#ff00ff] border border-[#ff00ff] px-6 py-2 uppercase text-xs font-bold hover:bg-[#ff00ff] hover:text-black transition-colors shadow-[0_0_10px_rgba(255,0,255,0.3)]"
                >
                  EXECUTE
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-16 border-t-2 border-[#ff00ff]/50 text-center relative z-10 bg-[#050510]">
        <h3 className="text-xl font-bold uppercase mb-8 text-[#ff00ff] drop-shadow-[0_0_8px_#ff00ff]">COMM_LINK ACTIVE</h3>
        <div className="flex flex-wrap justify-center gap-8">
          <a href={waLink} className="flex items-center gap-2 hover:text-white transition-colors border border-[#00ffcc] px-4 py-2"><Phone size={20} /> NODE_WA</a>
          {emailLink && <a href={emailLink} className="flex items-center gap-2 hover:text-white transition-colors border border-[#00ffcc] px-4 py-2"><EnvelopeSimple size={20} /> NODE_EMAIL</a>}
          {igLink && <a href={igLink} className="flex items-center gap-2 hover:text-white transition-colors border border-[#00ffcc] px-4 py-2"><At size={20} /> NODE_SOCIAL</a>}
        </div>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-[#050510] border-l-2 border-[#ff00ff] p-8 flex flex-col shadow-[-10px_0_30px_rgba(255,0,255,0.2)]"
            >
              <div className="flex justify-between items-center mb-8 border-b border-[#00ffcc] pb-4">
                <h2 className="text-2xl font-bold uppercase text-[#00ffcc] drop-shadow-[0_0_5px_#00ffcc]">&gt; MEMORY_BUFFER</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:text-[#ff00ff] border border-current px-2 text-xs py-1">TERMINATE [X]</button>
              </div>
              <div className="flex-1 overflow-auto space-y-6 pr-2">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-4 bg-[#0a0a20] p-4 border border-[#00ffcc]/30 hover:border-[#00ffcc] transition-colors">
                    <img src={item.imageUrl} className="w-20 h-20 object-cover border border-[#ff00ff]/50 grayscale contrast-150" />
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-sm mb-1 text-white">{item.name}</h4>
                      <p className="opacity-80 text-xs mb-3 text-[#ff00ff]">CR {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="border border-[#00ffcc] w-6 h-6 flex items-center justify-center hover:bg-[#00ffcc] hover:text-black font-bold">-</button>
                        <span className="font-bold w-6 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="border border-[#00ffcc] w-6 h-6 flex items-center justify-center hover:bg-[#00ffcc] hover:text-black font-bold">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className="pt-6 space-y-4">
                    <div className="text-xs font-bold uppercase text-[#ff00ff] mb-2 border-b border-[#ff00ff]/30 pb-2">User Parameters</div>
                    <input type="text" placeholder="ID_NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-[#0a0a20] border border-[#00ffcc]/50 p-4 outline-none focus:border-[#00ffcc] focus:shadow-[0_0_10px_#00ffcc] uppercase text-sm font-bold" />
                    <input type="text" placeholder="COMMLINK_WA" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-[#0a0a20] border border-[#00ffcc]/50 p-4 outline-none focus:border-[#00ffcc] focus:shadow-[0_0_10px_#00ffcc] uppercase text-sm font-bold" />
                    <textarea placeholder="COORDINATES" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-[#0a0a20] border border-[#00ffcc]/50 p-4 outline-none focus:border-[#00ffcc] focus:shadow-[0_0_10px_#00ffcc] uppercase text-sm font-bold h-24" />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className="pt-8 border-t border-[#00ffcc]/50 mt-4">
                  <div className="flex justify-between font-bold text-xl mb-6 text-[#ff00ff] drop-shadow-[0_0_5px_#ff00ff]">
                    <span>TOTAL_SYS</span>
                    <span>CR {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-5 bg-[#00ffcc] text-black font-bold uppercase tracking-widest hover:bg-[#00ffcc]/80 shadow-[0_0_20px_rgba(0,255,204,0.6)] transition-all active:scale-95">
                    PROCESS_TRANSACTION
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
