"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Phone, EnvelopeSimple, At } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function MagazineTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-[#FAFAFA] text-zinc-900';
  const accentClass = isDark ? 'border-zinc-100' : 'border-zinc-900';

  return (
    <div className={`min-h-screen ${bgClass} font-serif overflow-x-hidden selection:bg-rose-500 selection:text-white`}>
      <header className={`border-b-[6px] ${accentClass} p-6 md:p-10 flex flex-col md:flex-row justify-between items-end gap-6 sticky top-0 bg-inherit z-50`}>
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 1 }}>
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black uppercase tracking-tighter leading-[0.8]">{tenant.name}</h1>
          <div className="flex items-center gap-6 mt-6">
            <span className="text-xl md:text-2xl italic opacity-70 font-sans font-light">The Coffee Issue</span>
            <div className={`h-[2px] flex-1 ${isDark ? 'bg-zinc-100' : 'bg-zinc-900'} opacity-30`}></div>
            <span className="text-sm font-sans font-bold uppercase tracking-widest">{new Date().getFullYear()}</span>
          </div>
        </motion.div>
        <motion.button 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          onClick={() => setIsCartOpen(true)} 
          className="text-2xl font-bold uppercase border-b-[3px] border-transparent hover:border-current pb-1 hover:text-rose-600 transition-colors"
        >
          Bag ({(cart.items[tenant.subdomain || ""] || []).length})
        </motion.button>
      </header>

      <main className="p-6 md:p-10 max-w-[2000px] mx-auto">
        <section className="mb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
            className="lg:col-span-8 relative"
          >
            {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
              <div className="w-full h-full min-h-[60vh] bg-zinc-200 overflow-hidden group">
                <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-[2000ms]" />
              </div>
            ) : (
              <div className="w-full h-full min-h-[60vh] bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                <Coffee size={120} className="opacity-20" weight="thin" />
              </div>
            )}
            <div className={`absolute -bottom-6 -right-6 w-48 h-48 rounded-full ${isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'} flex items-center justify-center p-8 text-center hidden md:flex`}>
              <span className="font-sans font-bold uppercase tracking-widest text-sm leading-relaxed">Featured Collection</span>
            </div>
          </motion.div>
          <div className="lg:col-span-4 flex flex-col justify-center lg:pl-10">
            <h2 className="text-4xl md:text-6xl font-bold uppercase mb-8 leading-none tracking-tight">{heroGreeting}</h2>
            <div className={`w-16 h-2 ${isDark ? 'bg-zinc-100' : 'bg-zinc-900'} mb-8`}></div>
            <p className="text-xl md:text-2xl leading-relaxed text-justify first-letter:text-8xl first-letter:float-left first-letter:mr-4 first-letter:font-black first-letter:leading-[0.8] font-sans font-light">
              {aboutText}
            </p>
          </div>
        </section>

        <section id="catalog" className="pt-20 border-t-[6px] border-current">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">{catalogTitle}</h2>
            <p className="text-2xl italic font-sans font-light max-w-md text-right opacity-80">{catalogSubtitle}</p>
          </div>
          
          <div className="columns-1 md:columns-2 xl:columns-3 gap-10 space-y-10">
            {tenant.products.map((product, i) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="break-inside-avoid group"
              >
                <div className="w-full aspect-[4/5] mb-6 bg-zinc-200 dark:bg-zinc-800 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover grayscale group-hover:scale-105 transition-transform duration-[1500ms]" />
                  ) : (
                    <Coffee className="w-full h-full p-12 opacity-10" weight="thin" />
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className="px-8 py-4 bg-white text-black font-sans font-bold uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-colors"
                    >
                      Add to Bag
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-start gap-4 mb-3 border-b-2 border-current pb-3">
                  <h3 className="text-3xl font-bold uppercase leading-tight">{product.name}</h3>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                  <p className="text-2xl italic whitespace-nowrap">Rp {Number(product.price).toLocaleString("id-ID")}</p>
                </div>
                <p className="text-lg font-sans font-light leading-relaxed opacity-80">{product.description}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <section className="mt-32 p-10 md:p-20 border-t-[6px] border-current text-center">
        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12">Connect With Us</h2>
        <div className="flex flex-wrap justify-center gap-12 font-sans">
          <a href={waLink} className="group flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-current group-hover:text-white dark:group-hover:text-black transition-colors">
              <Phone size={32} weight="light" />
            </div>
            <span className="font-bold uppercase tracking-widest text-sm">WhatsApp</span>
          </a>
          {emailLink && (
            <a href={emailLink} className="group flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-current group-hover:text-white dark:group-hover:text-black transition-colors">
                <EnvelopeSimple size={32} weight="light" />
              </div>
              <span className="font-bold uppercase tracking-widest text-sm">Email</span>
            </a>
          )}
          {igLink && (
            <a href={igLink} className="group flex flex-col items-center gap-4">
              <div className="w-20 h-20 rounded-full border-2 border-current flex items-center justify-center group-hover:bg-current group-hover:text-white dark:group-hover:text-black transition-colors">
                <At size={32} weight="light" />
              </div>
              <span className="font-bold uppercase tracking-widest text-sm">Instagram</span>
            </a>
          )}
        </div>
      </section>
      
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", ease: "circOut", duration: 0.5 }}
              className={`relative w-full max-w-lg h-full ${bgClass} p-10 flex flex-col font-sans border-l-[6px] border-current`}
            >
              <div className="flex justify-between items-center mb-10 border-b-[4px] border-current pb-6 font-serif">
                <h2 className="text-5xl font-black uppercase tracking-tighter">Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-2xl font-bold hover:text-rose-500 transition-colors">Close</button>
              </div>
              
              <div className="flex-1 overflow-auto space-y-8 pr-4">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 items-center">
                    <img src={item.imageUrl} className="w-24 h-32 object-cover grayscale" />
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-xl mb-1">{item.name}</h4>
                      <p className="opacity-60 mb-4 text-lg">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-6">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="font-bold text-xl hover:text-rose-500">-</button>
                        <span className="font-bold text-xl">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="font-bold text-xl hover:text-rose-500">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className="pt-10 border-t-2 border-current space-y-6">
                    <h3 className="font-serif font-black text-2xl uppercase mb-4">Shipping Details</h3>
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-3 outline-none font-bold uppercase text-lg placeholder-current/40 focus:border-rose-500 transition-colors" />
                    <input type="text" placeholder="WhatsApp Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-3 outline-none font-bold uppercase text-lg placeholder-current/40 focus:border-rose-500 transition-colors" />
                    <textarea placeholder="Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-3 outline-none font-bold uppercase text-lg placeholder-current/40 h-32 focus:border-rose-500 transition-colors" />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className="pt-10 border-t-[4px] border-current mt-6">
                  <div className="flex justify-between font-black text-3xl mb-8 font-serif uppercase tracking-tighter">
                    <span>Total</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-6 ${isDark ? 'bg-zinc-100 text-zinc-900' : 'bg-zinc-900 text-white'} font-black uppercase tracking-widest text-xl hover:bg-rose-500 hover:text-white transition-colors`}>
                    Complete Purchase
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
