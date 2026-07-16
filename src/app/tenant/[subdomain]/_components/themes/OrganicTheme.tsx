"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, Leaf } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function OrganicTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#2a3026] text-[#e8e6e1]' : 'bg-[#F9F7F1] text-[#3A4035]';
  const cardClass = isDark ? 'bg-[#3A4035]' : 'bg-white';
  const primaryColor = '#8A9A5B'; // Moss Green

  return (
    <div className={`min-h-screen ${bgClass} font-sans overflow-x-hidden selection:bg-[#8A9A5B] selection:text-white`}>
      <header className="px-6 md:px-12 py-8 flex flex-col md:flex-row items-center justify-between z-50 relative gap-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className={`flex items-center gap-4 ${cardClass} px-8 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)]`}>
          {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-10 h-10 rounded-full object-cover" /> : <Leaf size={28} color={primaryColor} weight="fill" />}
          <h1 className="text-2xl font-bold tracking-tight">{tenant.name}</h1>
        </motion.div>
        
        <motion.button 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
          onClick={() => setIsCartOpen(true)} 
          className={`${cardClass} px-8 py-4 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.04)] font-bold flex items-center gap-3 hover:scale-105 transition-transform duration-300 text-lg`}
        >
          Basket 
          <span className="bg-[#8A9A5B] text-white w-8 h-8 rounded-full flex items-center justify-center text-sm shadow-inner">{(cart.items[tenant.subdomain || ""] || []).length}</span>
        </motion.button>
      </header>

      <section className="px-6 md:px-12 pt-12 pb-24 max-w-6xl mx-auto text-center flex flex-col items-center">
        <motion.h2 
          initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}
          className="text-5xl md:text-7xl lg:text-[5.5rem] font-medium mb-8 tracking-tight text-balance leading-[1.1]"
        >
          {heroGreeting}
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }}
          className="text-xl md:text-2xl opacity-70 max-w-3xl text-balance mb-16 leading-relaxed"
        >
          {aboutText}
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}
          className="w-full aspect-[21/9] rounded-[3rem] md:rounded-[5rem] overflow-hidden shadow-2xl mb-16 relative group"
        >
          {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
            <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[3000ms]" />
          ) : (
            <div className={`w-full h-full ${cardClass} flex items-center justify-center`}><Leaf size={100} className="opacity-10" /></div>
          )}
          <div className="absolute inset-0 bg-[#8A9A5B] mix-blend-overlay opacity-20 group-hover:opacity-10 transition-opacity duration-1000"></div>
        </motion.div>
      </section>

      <section id="catalog" className="px-6 md:px-12 pb-32 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h3 className="text-4xl md:text-6xl font-medium tracking-tight mb-4">{catalogTitle}</h3>
          <p className="text-xl opacity-60 italic">{catalogSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8, delay: idx * 0.1 }}
              className={`${cardClass} p-6 rounded-[3rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl transition-shadow duration-500 flex flex-col group`}
            >
              <div className={`w-full aspect-square rounded-[2rem] overflow-hidden ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'} mb-8 relative`}>
                 {product.imageUrl ? (
                   <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><Coffee size={64} className="opacity-10" /></div>
                 )}
                 <div className="absolute top-4 right-4 bg-white/90 text-black px-5 py-2 rounded-full font-bold shadow-sm backdrop-blur-md text-sm">
                   Rp {Number(product.price).toLocaleString("id-ID")}
                 </div>
              </div>
              <div className="px-2 pb-2 flex flex-col flex-1 text-center">
                <h4 className="text-2xl font-bold mb-3">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                <p className="opacity-60 mb-8 flex-1 text-base leading-relaxed line-clamp-3">{product.description}</p>
                <button 
                  onClick={() => handleAddToCart(product)} 
                  className={`w-full py-4 rounded-full font-bold text-lg ${isDark ? 'bg-[#e8e6e1] text-[#2a3026]' : 'bg-[#3A4035] text-white'} hover:bg-[#8A9A5B] hover:text-white transition-colors duration-300 flex items-center justify-center gap-2`}
                >
                  <Plus size={20} weight="bold" /> Add to Order
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="px-6 md:px-12 py-24 text-center">
        <Leaf size={48} color={primaryColor} weight="fill" className="mx-auto mb-8 opacity-50" />
        <h3 className="text-3xl font-medium mb-12">Get in Touch</h3>
        <div className="flex flex-wrap justify-center gap-6">
          <a href={waLink} className={`${cardClass} px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-3 font-medium`}><Phone size={24} color={primaryColor} /> WhatsApp</a>
          {emailLink && <a href={emailLink} className={`${cardClass} px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-3 font-medium`}><EnvelopeSimple size={24} color={primaryColor} /> Email</a>}
          {igLink && <a href={igLink} className={`${cardClass} px-8 py-4 rounded-full shadow-sm hover:shadow-md transition-all flex items-center gap-3 font-medium`}><At size={24} color={primaryColor} /> Instagram</a>}
        </div>
      </section>
      
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end p-4 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%", opacity: 0, scale: 0.95 }} animate={{ x: 0, opacity: 1, scale: 1 }} exit={{ x: "100%", opacity: 0, scale: 0.95 }} transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className={`relative w-full max-w-md h-full ${bgClass} rounded-[3rem] shadow-2xl flex flex-col p-8 overflow-hidden border border-white/20`}
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-3xl font-bold tracking-tight">Your Basket</h2>
                <button onClick={() => setIsCartOpen(false)} className={`w-12 h-12 rounded-full ${cardClass} flex items-center justify-center hover:scale-110 transition-transform shadow-sm`}>X</button>
              </div>
              
              <div className="flex-1 overflow-auto space-y-4 pr-2">
                {cart.items.map((item: any) => (
                  <div key={item.id} className={`flex gap-4 p-4 rounded-[2rem] ${cardClass} shadow-sm items-center`}>
                    <img src={item.imageUrl} className={`w-20 h-20 rounded-[1.5rem] object-cover ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'}`} />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg leading-tight mb-1">{item.name}</h4>
                      <p className="opacity-60 text-sm mb-3">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className={`flex items-center gap-4 ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'} w-max rounded-full px-2 py-1`}>
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={`w-7 h-7 rounded-full ${cardClass} font-bold shadow-sm hover:text-[#8A9A5B] transition-colors`}>-</button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={`w-7 h-7 rounded-full ${cardClass} font-bold shadow-sm hover:text-[#8A9A5B] transition-colors`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className={`mt-8 p-6 rounded-[2rem] ${cardClass} shadow-sm space-y-5`}>
                    <h3 className="font-bold text-xl mb-2">Details</h3>
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'} rounded-2xl p-4 outline-none focus:ring-2 ring-[#8A9A5B] transition-shadow text-lg`} />
                    <input type="text" placeholder="WhatsApp Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'} rounded-2xl p-4 outline-none focus:ring-2 ring-[#8A9A5B] transition-shadow text-lg`} />
                    <textarea placeholder="Delivery Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={`w-full ${isDark ? 'bg-[#2a3026]' : 'bg-[#F9F7F1]'} rounded-2xl p-4 outline-none focus:ring-2 ring-[#8A9A5B] transition-shadow text-lg h-32`} />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className="pt-8 mt-4 border-t border-current/10">
                  <div className="flex justify-between items-center mb-6 px-2">
                    <span className="opacity-60 font-medium text-lg">Total</span>
                    <span className="text-3xl font-bold">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-5 rounded-full bg-[#8A9A5B] text-white font-bold text-xl hover:bg-opacity-90 hover:scale-[1.02] transition-all shadow-lg">
                    Confirm Order
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
