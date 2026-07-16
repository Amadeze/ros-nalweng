"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, X, Plus, Minus, Phone, EnvelopeSimple, At } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function VintageTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#2C2621] text-[#D8C3A5]' : 'bg-[#F4EBD0] text-[#4A3B32]';
  const accentClass = isDark ? 'border-[#D8C3A5]' : 'border-[#4A3B32]';
  
  return (
    <div className={`min-h-screen ${bgClass} font-serif overflow-x-hidden selection:bg-[#E98074] selection:text-white`}>
      <div className={`fixed inset-0 pointer-events-none opacity-20 ${isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'}`} style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
      
      <motion.header 
        initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1 }}
        className={`border-b-2 border-dashed ${accentClass}/30 p-6 flex flex-col items-center justify-center relative z-10 bg-inherit`}
      >
        <div className="absolute left-6 top-6 hidden md:block">
          <span className="text-xs tracking-[0.3em] uppercase opacity-60">Purveyors of Fine Coffee</span>
        </div>
        {tenant.logoUrl ? (
          <img src={tenant.logoUrl} className="w-20 h-20 object-contain sepia contrast-125 mb-4" />
        ) : (
          <Coffee className="w-14 h-14 mb-4 opacity-80" weight="light" />
        )}
        <h1 className="text-3xl md:text-5xl font-bold tracking-[0.2em] uppercase">{tenant.name}</h1>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className="absolute right-6 top-6 flex items-center gap-2 uppercase tracking-widest text-sm hover:opacity-70 transition-opacity"
        >
          <Package size={18} /> [<span className="w-4 text-center">{(cart.items[tenant.subdomain || ""] || []).length}</span>]
        </button>
      </motion.header>

      <section className="py-24 px-6 max-w-4xl mx-auto text-center relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 1.2 }}
          className="text-4xl md:text-6xl font-normal leading-tight italic mb-10"
        >
          "{heroGreeting}"
        </motion.h2>
        <motion.div initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1 }} className="w-32 h-[1px] bg-current opacity-40 mx-auto mb-10"></motion.div>
        <motion.p 
          initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.3, duration: 1 }}
          className="text-lg md:text-xl leading-relaxed tracking-wide opacity-80"
        >
          {aboutText}
        </motion.p>
      </section>

      <section id="catalog" className="py-16 px-6 max-w-6xl mx-auto relative z-10">
        <h3 className="text-2xl font-bold tracking-[0.3em] uppercase text-center mb-16 border-b-2 border-current pb-4">Our Provisions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.8, delay: idx * 0.1 }}
              className="flex flex-col group cursor-pointer"
            >
              <div className={`aspect-[3/4] p-4 border-2 ${accentClass}/20 ${isDark ? 'bg-[#36302B]' : 'bg-[#E8DCB8]'} mb-6 relative overflow-hidden shadow-lg`}>
                <div className={`absolute inset-2 border border-dashed ${accentClass}/30 z-10 pointer-events-none`}></div>
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover sepia contrast-125 group-hover:scale-110 transition-transform duration-[2000ms]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center opacity-10"><Coffee size={64} weight="light" /></div>
                )}
                <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                  <span className={`px-4 py-1 text-xs uppercase tracking-widest font-bold ${isDark ? 'bg-[#D8C3A5] text-[#2C2621]' : 'bg-[#4A3B32] text-[#F4EBD0]'}`}>{product.origin || 'Blend'}</span>
                </div>
              </div>
              <h4 className="text-2xl font-bold uppercase tracking-wider mb-3 text-center">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
              <p className="opacity-70 text-center mb-6 italic flex-1 leading-relaxed">{product.description}</p>
              <div className="flex flex-col items-center gap-4">
                <span className="font-bold tracking-widest text-lg">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className={`px-10 py-3 border border-current uppercase tracking-[0.2em] text-xs font-bold ${isDark ? 'hover:bg-[#D8C3A5] hover:text-[#2C2621]' : 'hover:bg-[#4A3B32] hover:text-[#F4EBD0]'} transition-all hover:scale-105`}
                >
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="py-24 px-6 text-center border-t-2 border-dashed border-current/30 relative z-10 mt-20">
        <h3 className="text-xl font-bold tracking-[0.3em] uppercase mb-8">Directives & Inquiries</h3>
        <div className="flex flex-wrap justify-center gap-8">
          <a href={waLink} className="flex items-center gap-3 uppercase tracking-widest text-sm hover:italic transition-all"><Phone size={20} /> Telegram (WA)</a>
          {emailLink && <a href={emailLink} className="flex items-center gap-3 uppercase tracking-widest text-sm hover:italic transition-all"><EnvelopeSimple size={20} /> Post (Email)</a>}
          {igLink && <a href={igLink} className="flex items-center gap-3 uppercase tracking-widest text-sm hover:italic transition-all"><At size={20} /> Society (IG)</a>}
        </div>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`relative w-full max-w-md h-full ${bgClass} border-l-4 border-double border-current flex flex-col p-8 shadow-2xl`}
            >
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-current">
                <h2 className="text-2xl font-bold tracking-[0.2em] uppercase">Shopping Receptacle</h2>
                <button onClick={() => setIsCartOpen(false)} className="uppercase tracking-widest text-sm hover:opacity-50">Close [X]</button>
              </div>
              <div className="flex-1 overflow-auto space-y-8 pr-2">
                {cart.items.map((item: any) => (
                  <div key={item.id} className="flex gap-6 pb-6 border-b border-dashed border-current/30">
                    <div className="w-24 h-32 border border-current p-1 bg-black/5">
                      {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover sepia contrast-125 mix-blend-multiply" /> : <Coffee size={40} className="opacity-20 m-auto h-full" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-bold tracking-wider uppercase mb-1">{item.name}</h4>
                      <p className="opacity-70 text-sm mb-4">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex gap-4 items-center">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="border border-current w-8 h-8 flex items-center justify-center hover:bg-current hover:text-white transition-colors">-</button>
                        <span className="font-bold text-lg w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="border border-current w-8 h-8 flex items-center justify-center hover:bg-current hover:text-white transition-colors">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className="pt-6 space-y-6">
                    <p className="text-sm tracking-widest uppercase opacity-60 border-b border-current pb-2">Consignee Particulars</p>
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/40" />
                    <input type="text" placeholder="Telephone (WhatsApp)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/40" />
                    <textarea placeholder="Postal Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/40 h-24" />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className="pt-8 border-t-2 border-dashed border-current mt-4">
                  <div className="flex justify-between font-bold text-xl mb-8 tracking-widest uppercase">
                    <span>Total Sum</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-5 border-2 border-current font-bold uppercase tracking-[0.2em] ${isDark ? 'bg-[#D8C3A5] text-[#2C2621]' : 'bg-[#4A3B32] text-[#F4EBD0]'} hover:opacity-90 transition-all shadow-lg`}>
                    Proceed to Dispatch
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
