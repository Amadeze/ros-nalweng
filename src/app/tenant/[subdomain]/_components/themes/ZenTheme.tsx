"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, X, ShoppingBagOpen } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function ZenTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#121212] text-[#E0E0E0]' : 'bg-[#F9F7F1] text-[#2C2C2C]';
  const borderClass = isDark ? 'border-[#333333]' : 'border-[#E0DCD3]';
  const accentClass = isDark ? 'bg-[#E0E0E0] text-[#121212]' : 'bg-[#2C2C2C] text-[#F9F7F1]';
  
  return (
    <div className={`min-h-screen ${bgClass} font-serif selection:bg-current selection:text-${isDark ? '[#121212]' : '[#F9F7F1]'}`}>
      
      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-6 border-b ${borderClass} bg-inherit/90 backdrop-blur-md`}>
        <div className="flex items-center gap-6">
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} className="w-8 h-8 object-contain" />
          ) : (
            <Coffee size={24} weight="thin" />
          )}
          <h1 className="text-sm font-medium tracking-widest uppercase">{tenant.name}</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="flex items-center gap-2 text-xs tracking-widest uppercase hover:opacity-70 transition-opacity"
        >
          <span>Bag [{(cart.items[tenant.subdomain || ""] || []).length}]</span>
        </button>
      </header>

      {/* Hero */}
      <section className={`pt-40 pb-32 px-8 border-b ${borderClass} min-h-[70vh] flex flex-col justify-center`}>
        <div className="max-w-4xl mx-auto w-full">
          <motion.h2 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.5, ease: "easeOut" }}
            className="text-4xl md:text-6xl font-light tracking-wide mb-16 leading-[1.3] text-balance"
          >
            {heroGreeting}
          </motion.h2>
          <div className="flex flex-col md:flex-row gap-12 items-start md:items-end">
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }}
              className="text-lg md:text-xl font-light opacity-80 max-w-lg leading-relaxed flex-1"
            >
              {aboutText}
            </motion.p>
            {tenant.heroImageUrl && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 2, delay: 0.8 }}
                className={`w-48 h-64 flex-shrink-0 border ${borderClass} p-2`}
              >
                <img src={tenant.heroImageUrl} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" />
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="px-8 py-32 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-8">
          <h3 className="text-3xl font-light tracking-widest uppercase">{catalogTitle}</h3>
          <p className="opacity-60 text-sm tracking-widest uppercase">{catalogSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 1.2, delay: idx * 0.2 }}
              className="group flex flex-col"
            >
              <div className={`w-full aspect-[3/4] mb-8 border ${borderClass} relative overflow-hidden flex items-center justify-center p-6`}>
                 {product.imageUrl ? (
                   <img src={product.imageUrl} className="w-full h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-[1.5s]" />
                 ) : (
                   <Package size={48} weight="thin" className="opacity-20" />
                 )}
              </div>
              <div className="flex flex-col flex-1">
                <h4 className="text-xl font-medium tracking-wide mb-3">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                <p className="opacity-70 text-sm leading-loose mb-8 font-sans">{product.description}</p>
                <div className={`mt-auto pt-6 border-t ${borderClass} flex justify-between items-center`}>
                  <span className="text-sm tracking-widest">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className="text-xs uppercase tracking-widest hover:opacity-50 transition-opacity"
                  >
                    Add
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t ${borderClass} px-8 py-16 flex flex-col md:flex-row justify-between items-start md:items-center gap-12`}>
        <div className="flex flex-col gap-4 text-xs uppercase tracking-widest">
          <a href={waLink} className="hover:opacity-50 transition-opacity">WhatsApp</a>
          {emailLink && <a href={emailLink} className="hover:opacity-50 transition-opacity">Email</a>}
          {igLink && <a href={igLink} className="hover:opacity-50 transition-opacity">Instagram</a>}
        </div>
        <div className="text-xs tracking-widest uppercase opacity-40 text-right">
          <p>&copy; {new Date().getFullYear()} {tenant.name}.<br/>{footerText}</p>
        </div>
      </footer>
      
      {/* Zen Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className={`absolute inset-0 bg-black/20 backdrop-blur-sm`} onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className={`relative w-full max-w-md h-full ${bgClass} border-l ${borderClass} flex flex-col shadow-2xl`}
            >
              <div className={`p-8 border-b ${borderClass} flex justify-between items-center`}>
                <h2 className="text-sm font-medium tracking-widest uppercase">Cart [{(cart.items[tenant.subdomain || ""] || []).length}]</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:opacity-50 transition-opacity"><X size={20} weight="thin" /></button>
              </div>
              
              <div className="flex-1 overflow-auto p-8 space-y-10">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <div className={`w-16 h-20 border ${borderClass} p-2`}>
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover filter grayscale" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm tracking-wide mb-1">{item.name}</h4>
                      <p className="opacity-60 text-xs mb-4">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-4 text-sm font-sans">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="opacity-40 hover:opacity-100">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="opacity-40 hover:opacity-100">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className={`pt-10 border-t ${borderClass} space-y-6 font-sans`}>
                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full bg-transparent border-b ${borderClass} p-3 outline-none focus:border-current text-sm transition-colors`} />
                    <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full bg-transparent border-b ${borderClass} p-3 outline-none focus:border-current text-sm transition-colors`} />
                    <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={`w-full bg-transparent border-b ${borderClass} p-3 outline-none focus:border-current text-sm h-24 transition-colors`} />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className={`p-8 border-t ${borderClass}`}>
                  <div className="flex justify-between items-center mb-8">
                    <span className="text-xs tracking-widest uppercase opacity-60">Total</span>
                    <span className="text-xl tracking-wide">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-4 text-xs tracking-widest uppercase transition-all ${accentClass} hover:opacity-90`}>
                    Checkout
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
