"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, X, ShoppingCart } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function NeoBrutalismTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#222222] text-[#F3F4F6]' : 'bg-[#FFE873] text-[#111111]';
  const borderClass = isDark ? 'border-[#F3F4F6]' : 'border-[#111111]';
  const accentClass = isDark ? 'bg-[#F3F4F6] text-[#222222]' : 'bg-[#FF5C5C] text-[#111111]';
  const shadowClass = isDark ? 'shadow-[8px_8px_0px_0px_#F3F4F6]' : 'shadow-[8px_8px_0px_0px_#111111]';
  
  return (
    <div className={`min-h-screen ${bgClass} font-mono selection:bg-black selection:text-white`}>
      
      {/* Header */}
      <header className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 md:px-12 py-6 border-b-4 ${borderClass} bg-inherit`}>
        <div className="flex items-center gap-4">
          {tenant.logoUrl ? (
            <div className={`w-12 h-12 border-4 ${borderClass} overflow-hidden ${shadowClass} bg-white`}>
              <img src={tenant.logoUrl} className="w-full h-full object-cover" />
            </div>
          ) : (
            <div className={`w-12 h-12 border-4 ${borderClass} flex items-center justify-center ${shadowClass} bg-white text-black`}>
              <Coffee size={24} weight="bold" />
            </div>
          )}
          <h1 className="text-2xl font-black uppercase tracking-tighter hidden md:block">{tenant.name}</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className={`flex items-center gap-3 px-6 py-3 border-4 ${borderClass} ${shadowClass} bg-white text-black font-black uppercase hover:-translate-y-1 hover:-translate-x-1 hover:shadow-[12px_12px_0px_0px_rgba(17,17,17,1)] transition-all active:translate-y-2 active:translate-x-2 active:shadow-none`}
        >
          <ShoppingCart size={24} weight="bold" />
          <span>CART ({cart.items.length})</span>
        </button>
      </header>

      {/* Hero */}
      <section className={`pt-48 pb-32 px-6 md:px-12 border-b-4 ${borderClass} min-h-screen flex flex-col justify-center`}>
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="flex-1 w-full">
            <motion.h2 
              initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10 }}
              className="text-6xl md:text-[8rem] font-black uppercase leading-[0.9] tracking-tighter mb-12"
              style={{ textShadow: isDark ? '4px 4px 0px #000' : '4px 4px 0px #FFF' }}
            >
              {heroGreeting}
            </motion.h2>
            <motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
              className={`p-6 border-4 ${borderClass} ${shadowClass} bg-white text-black max-w-2xl transform -rotate-1`}
            >
              <p className="text-xl md:text-2xl font-bold leading-tight">
                {aboutText}
              </p>
            </motion.div>
          </div>
          {tenant.heroImageUrl && (
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.4 }}
              className={`w-full md:w-1/3 aspect-[3/4] border-4 ${borderClass} ${shadowClass} bg-white overflow-hidden transform rotate-2 hover:rotate-0 transition-transform`}
            >
              <img src={tenant.heroImageUrl} className="w-full h-full object-cover filter contrast-150 saturate-150" />
            </motion.div>
          )}
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="px-6 md:px-12 py-32">
        <div className={`inline-block mb-24 p-6 border-4 ${borderClass} ${shadowClass} bg-[#4ECDC4] text-black transform -rotate-2`}>
          <h3 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">{catalogTitle}</h3>
          <p className="font-bold mt-2 text-xl">{catalogSubtitle}</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-20">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} viewport={{ once: true, margin: "-50px" }} transition={{ type: "spring", stiffness: 100, damping: 10, delay: idx * 0.1 }}
              className={`flex flex-col border-4 ${borderClass} ${shadowClass} bg-white text-black h-full group hover:-translate-y-2 hover:-translate-x-2 hover:shadow-[16px_16px_0px_0px_rgba(17,17,17,1)] transition-all`}
            >
              <div className={`w-full aspect-square border-b-4 ${borderClass} bg-gray-100 overflow-hidden relative`}>
                 {product.imageUrl ? (
                   <img src={product.imageUrl} className="w-full h-full object-cover filter contrast-125 mix-blend-multiply group-hover:scale-110 transition-transform" />
                 ) : (
                   <div className="w-full h-full flex items-center justify-center"><Package size={80} weight="bold" /></div>
                 )}
                 <div className={`absolute top-4 right-4 px-4 py-2 border-4 ${borderClass} bg-[#FF5C5C] text-black font-black text-xl shadow-[4px_4px_0px_0px_#111]`}>
                   RP {Number(product.price).toLocaleString("id-ID")}
                 </div>
              </div>
              <div className="flex flex-col flex-1 p-6">
                <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 leading-none">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                <p className="font-bold text-gray-700 leading-snug mb-8">{product.description}</p>
                <div className="mt-auto">
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className={`w-full py-4 border-4 ${borderClass} bg-[#FFE873] text-black font-black uppercase text-xl hover:bg-[#4ECDC4] active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0px_0px_#111] transition-all flex justify-center items-center gap-3 shadow-[6px_6px_0px_0px_#111]`}
                  >
                    <Plus size={24} weight="bold" /> ADD TO CART
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t-4 ${borderClass} px-6 md:px-12 py-20 flex flex-col md:flex-row justify-between items-center gap-12 bg-white text-black`}>
        <div className="flex flex-wrap justify-center md:justify-start gap-6">
          <a href={waLink} className={`px-6 py-3 border-4 ${borderClass} font-black uppercase hover:bg-[#4ECDC4] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#111] transition-all`}><Phone size={20} className="inline mr-2" /> WhatsApp</a>
          {emailLink && <a href={emailLink} className={`px-6 py-3 border-4 ${borderClass} font-black uppercase hover:bg-[#4ECDC4] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#111] transition-all`}><EnvelopeSimple size={20} className="inline mr-2" /> Email</a>}
          {igLink && <a href={igLink} className={`px-6 py-3 border-4 ${borderClass} font-black uppercase hover:bg-[#4ECDC4] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#111] transition-all`}><At size={20} className="inline mr-2" /> Instagram</a>}
        </div>
        <div className={`p-4 border-4 ${borderClass} bg-[#FFE873] font-bold text-center md:text-right transform rotate-1`}>
          <p>&copy; {new Date().getFullYear()} {tenant.name}.<br/>{footerText}</p>
        </div>
      </footer>
      
      {/* Brutalist Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className={`relative w-full max-w-lg h-full bg-white text-black border-l-8 ${borderClass} flex flex-col`}
            >
              <div className={`p-6 border-b-8 ${borderClass} bg-[#FF5C5C] flex justify-between items-center`}>
                <h2 className="text-3xl font-black uppercase tracking-tighter text-white" style={{ textShadow: '2px 2px 0px #000' }}>SHOPPING CART</h2>
                <button onClick={() => setIsCartOpen(false)} className={`w-12 h-12 border-4 ${borderClass} bg-white flex items-center justify-center hover:bg-black hover:text-white transition-colors`}><X size={24} weight="bold" /></button>
              </div>
              
              <div className="flex-1 overflow-auto p-6 space-y-6 bg-gray-100">
                {cart.items.map((item: any) => (
                  <div key={item.id} className={`flex gap-4 p-4 border-4 ${borderClass} bg-white shadow-[4px_4px_0px_0px_#111]`}>
                    <div className={`w-24 h-24 border-4 ${borderClass} bg-gray-200`}>
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="font-black text-xl uppercase leading-none mb-1">{item.name}</h4>
                        <p className="font-bold text-gray-500">RP {item.price.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={`w-8 h-8 border-4 ${borderClass} bg-[#FFE873] font-black flex items-center justify-center hover:bg-black hover:text-white`}>-</button>
                        <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={`w-8 h-8 border-4 ${borderClass} bg-[#4ECDC4] font-black flex items-center justify-center hover:bg-black hover:text-white`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 0 && (
                  <div className={`p-6 border-4 ${borderClass} bg-white mt-8 shadow-[8px_8px_0px_0px_#111]`}>
                    <h3 className="font-black text-2xl uppercase mb-6 bg-[#FFE873] inline-block px-2 border-2 border-black">CHECKOUT DETAILS</h3>
                    <div className="space-y-4">
                      <input type="text" placeholder="FULL NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full border-4 ${borderClass} p-4 font-bold outline-none focus:bg-[#4ECDC4] transition-colors uppercase`} />
                      <input type="text" placeholder="WHATSAPP NUMBER" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full border-4 ${borderClass} p-4 font-bold outline-none focus:bg-[#4ECDC4] transition-colors uppercase`} />
                      <textarea placeholder="FULL ADDRESS" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={`w-full border-4 ${borderClass} p-4 font-bold outline-none h-32 focus:bg-[#4ECDC4] transition-colors uppercase`} />
                    </div>
                  </div>
                )}
              </div>
              
              {cart.items.length > 0 && (
                <div className={`p-6 border-t-8 ${borderClass} bg-white`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="font-black text-xl uppercase">GRAND TOTAL</span>
                    <span className="text-3xl font-black bg-[#FFE873] px-2 py-1 border-2 border-black">RP {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-5 border-4 ${borderClass} bg-[#4ECDC4] font-black text-2xl uppercase hover:bg-black hover:text-white shadow-[8px_8px_0px_0px_#111] hover:translate-y-1 hover:translate-x-1 hover:shadow-[4px_4px_0px_0px_#111] active:translate-y-2 active:translate-x-2 active:shadow-none transition-all`}>
                    SUBMIT ORDER
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
