"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, X, Bag } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function GlassTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#050505] text-[#FAFAFA]' : 'bg-[#FAFAFA] text-[#050505]';
  const glassClass = isDark 
    ? 'bg-white/5 border border-white/10 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5)]' 
    : 'bg-black/5 border border-black/10 backdrop-blur-3xl shadow-[0_8px_32px_rgba(0,0,0,0.05)]';
  const accentClass = isDark ? 'bg-white text-black' : 'bg-black text-white';
  const inputClass = isDark 
    ? 'bg-white/5 border border-white/10 focus:border-white/30 text-white placeholder:text-white/30' 
    : 'bg-black/5 border border-black/10 focus:border-black/30 text-black placeholder:text-black/30';

  return (
    <div className={`min-h-screen ${bgClass} font-sans overflow-x-hidden selection:bg-current selection:text-white relative`}>
      {/* Ambient Glows */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className={`absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] rounded-full blur-[100px] opacity-30 mix-blend-screen ${isDark ? 'bg-indigo-600' : 'bg-indigo-300'}`}></div>
        <div className={`absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-30 mix-blend-screen ${isDark ? 'bg-fuchsia-600' : 'bg-fuchsia-300'}`}></div>
      </div>
      
      {(tenant.backgroundImageUrl || tenant.heroImageUrl) && (
        <div className="fixed inset-0 z-0 pointer-events-none opacity-20">
           <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover filter blur-[2px]" />
        </div>
      )}

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed top-6 inset-x-0 z-50 flex justify-center px-4"
      >
        <div className={`w-full max-w-5xl rounded-[2rem] px-6 py-4 flex items-center justify-between ${glassClass}`}>
          <div className="flex items-center gap-3">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                <Coffee size={16} weight="bold" />
              </div>
            )}
            <h1 className="text-lg font-semibold tracking-tight">{tenant.name}</h1>
          </div>
          <button 
            onClick={() => setIsCartOpen(true)} 
            className={`px-5 py-2.5 rounded-full text-sm font-medium flex items-center gap-2 hover:scale-105 transition-transform ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/10 hover:bg-black/20'}`}
          >
            <Bag size={18} /> {cart.items.length > 0 ? `${cart.items.length} Items` : 'Bag'}
          </button>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative z-10 pt-48 pb-32 px-6 flex flex-col items-center text-center">
        <motion.h2 
          initial={{ y: 30, opacity: 0, filter: "blur(10px)" }} animate={{ y: 0, opacity: 1, filter: "blur(0px)" }} transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-medium tracking-tighter mb-8 max-w-5xl leading-[1.1] text-balance bg-clip-text text-transparent bg-gradient-to-b from-current to-current/40"
        >
          {heroGreeting}
        </motion.h2>
        <motion.p 
          initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.3 }}
          className="text-xl md:text-2xl font-light opacity-60 max-w-2xl text-balance mb-12"
        >
          {aboutText}
        </motion.p>
      </section>

      {/* Catalog */}
      <section id="catalog" className="relative z-10 px-6 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-medium tracking-tight mb-3">{catalogTitle}</h3>
          <p className="opacity-50">{catalogSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`rounded-[2.5rem] p-4 flex flex-col group ${glassClass} hover:bg-white/10 transition-colors`}
            >
              <div className="w-full aspect-square rounded-[2rem] overflow-hidden relative mb-6">
                 {product.imageUrl ? (
                   <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[1.5s] ease-out" />
                 ) : (
                   <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-black/5'}`}><Coffee size={64} className="opacity-10" /></div>
                 )}
                 <div className={`absolute top-4 right-4 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-xl ${isDark ? 'bg-black/30' : 'bg-white/50 border border-black/5'}`}>
                   Rp {Number(product.price).toLocaleString("id-ID")}
                 </div>
              </div>
              <div className="px-4 pb-4 flex flex-col flex-1">
                <h4 className="text-2xl font-medium mb-2">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                <p className="opacity-50 text-sm leading-relaxed line-clamp-2 mb-6 flex-1">{product.description}</p>
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className={`w-full py-4 rounded-full font-medium flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] ${accentClass}`}
                >
                  <Plus size={18} /> Add to Bag
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact / Footer */}
      <section className="relative z-10 px-6 py-24 flex flex-col items-center">
        <div className={`max-w-3xl w-full rounded-[3rem] p-12 text-center ${glassClass}`}>
          <h3 className="text-3xl font-medium tracking-tight mb-10">Connect</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <a href={waLink} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}><Phone size={20} /> WhatsApp</a>
            {emailLink && <a href={emailLink} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}><EnvelopeSimple size={20} /> Email</a>}
            {igLink && <a href={igLink} className={`px-6 py-3 rounded-full font-medium flex items-center gap-2 hover:scale-105 transition-transform ${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'}`}><At size={20} /> Instagram</a>}
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-8 text-center opacity-40 text-sm">
        <p>&copy; {new Date().getFullYear()} {tenant.name}. {footerText}</p>
      </footer>
      
      {/* Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`relative w-full max-w-md h-full flex flex-col p-2`}
            >
              <div className={`w-full h-full rounded-[2rem] flex flex-col overflow-hidden ${glassClass}`}>
                <div className="p-6 border-b border-current/10 flex justify-between items-center">
                  <h2 className="text-xl font-medium tracking-tight">Your Bag</h2>
                  <button onClick={() => setIsCartOpen(false)} className={`w-8 h-8 rounded-full flex items-center justify-center hover:scale-110 transition-transform ${isDark ? 'bg-white/10' : 'bg-black/10'}`}><X size={16} /></button>
                </div>
                
                <div className="flex-1 overflow-auto p-6 space-y-6">
                  {cart.items.map((item: any) => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className={`w-20 h-20 rounded-2xl overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium mb-1 line-clamp-1">{item.name}</h4>
                        <p className="opacity-50 text-sm mb-3">Rp {item.price.toLocaleString("id-ID")}</p>
                        <div className={`flex items-center gap-3 w-max rounded-full px-2 py-1 ${isDark ? 'bg-white/10' : 'bg-black/10'}`}>
                          <button onClick={() => cart.updateQuantity(item.id, -1)} className="w-6 h-6 flex items-center justify-center opacity-70 hover:opacity-100">-</button>
                          <span className="font-medium text-sm w-4 text-center">{item.quantity}</span>
                          <button onClick={() => cart.updateQuantity(item.id, 1)} className="w-6 h-6 flex items-center justify-center opacity-70 hover:opacity-100">+</button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {cart.items.length > 0 && (
                    <div className="pt-8 space-y-3">
                      <h3 className="font-medium mb-4">Checkout Details</h3>
                      <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full rounded-2xl p-4 outline-none transition-colors ${inputClass}`} />
                      <input type="text" placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full rounded-2xl p-4 outline-none transition-colors ${inputClass}`} />
                      <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={`w-full rounded-2xl p-4 outline-none transition-colors h-28 ${inputClass}`} />
                    </div>
                  )}
                </div>
                
                {cart.items.length > 0 && (
                  <div className={`p-6 border-t border-current/10 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                    <div className="flex justify-between items-center mb-6">
                      <span className="opacity-60">Total</span>
                      <span className="text-2xl font-medium">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                    </div>
                    <button onClick={handleCheckout} className={`w-full py-4 rounded-full font-medium text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform ${accentClass}`}>
                      Checkout
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
