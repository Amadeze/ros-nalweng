"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, ArrowRight } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function BauhausTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  // Bauhaus primary colors
  const primaryColors = ["#E63946", "#F4A261", "#2A9D8F", "#E9C46A", "#264653"];
  const bgColor = isDark ? "bg-[#1a1a1a]" : "bg-[#f4f4f4]";
  const textColor = isDark ? "text-[#f4f4f4]" : "text-[#1a1a1a]";
  const borderColor = isDark ? "border-[#f4f4f4]" : "border-[#1a1a1a]";

  return (
    <div className={`min-h-screen ${bgColor} ${textColor} font-sans overflow-x-hidden selection:bg-[#E63946] selection:text-white`}>
      <header className={`border-b-[4px] ${borderColor} flex flex-col md:flex-row justify-between items-stretch sticky top-0 z-50 ${bgColor}`}>
        <div className={`p-6 md:p-8 flex items-center gap-6 border-b-[4px] md:border-b-0 md:border-r-[4px] ${borderColor} flex-1`}>
          <div className="w-16 h-16 rounded-full bg-[#E63946] flex items-center justify-center shrink-0 border-[4px] border-inherit">
            {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-10 h-10 object-contain invert mix-blend-luminosity" /> : <Coffee size={32} color={isDark ? '#1a1a1a' : '#f4f4f4'} weight="bold" />}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none">{tenant.name}</h1>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className={`p-6 md:p-8 text-2xl font-black uppercase hover:bg-[#F4A261] hover:text-[#1a1a1a] transition-colors flex items-center gap-4 group`}
        >
          CART <span className="w-10 h-10 rounded-full border-[4px] border-current flex items-center justify-center bg-[#2A9D8F] text-[#1a1a1a] group-hover:bg-[#1a1a1a] group-hover:text-[#F4A261] transition-colors">{(cart.items[tenant.subdomain || ""] || []).length}</span>
        </button>
      </header>

      <section className={`border-b-[4px] ${borderColor} flex flex-col lg:flex-row relative z-10`}>
        <div className={`p-8 md:p-16 lg:w-3/5 flex flex-col justify-center border-b-[4px] lg:border-b-0 lg:border-r-[4px] ${borderColor}`}>
          <motion.div initial={{ width: 0 }} animate={{ width: "100px" }} transition={{ duration: 0.8 }} className="h-4 bg-[#E63946] mb-8"></motion.div>
          <motion.h2 
            initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
            className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] uppercase mb-10"
          >
            {heroGreeting}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4, duration: 0.8 }}
            className="text-2xl font-medium max-w-xl leading-snug"
          >
            {aboutText}
          </motion.p>
        </div>
        
        <div className="lg:w-2/5 aspect-square lg:aspect-auto relative bg-[#2A9D8F]">
          {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
             <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover mix-blend-multiply grayscale contrast-125" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-64 h-64 rounded-full bg-[#F4A261] mix-blend-multiply flex items-center justify-center">
                <Coffee size={120} color="#1a1a1a" weight="fill" />
              </div>
            </div>
          )}
          <div className="absolute top-8 right-8 w-32 h-32 bg-[#E9C46A] rounded-full border-[4px] border-[#1a1a1a] mix-blend-exclusion"></div>
        </div>
      </section>

      <section id="catalog" className={`border-b-[4px] ${borderColor} relative z-10`}>
        <div className={`p-8 md:p-12 border-b-[4px] ${borderColor} bg-[#E9C46A] text-[#1a1a1a]`}>
          <h3 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">{catalogTitle}</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
          {tenant.products.map((product, idx) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className={`flex flex-col border-b-[4px] md:border-b-[4px] md:border-r-[4px] xl:border-b-[4px] ${borderColor} group bg-inherit hover:bg-[#1a1a1a] hover:text-[#f4f4f4] dark:hover:bg-[#f4f4f4] dark:hover:text-[#1a1a1a] transition-colors`}
            >
              <div className={`aspect-[4/3] border-b-[4px] ${borderColor} relative overflow-hidden`} style={{ backgroundColor: primaryColors[idx % primaryColors.length] }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover mix-blend-multiply grayscale contrast-125 group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Package size={80} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50" color="#1a1a1a" weight="fill" />
                )}
                <div className={`absolute top-4 left-4 border-[4px] ${borderColor} bg-white px-3 py-1 font-black text-xl uppercase text-black`}>
                  {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}
                </div>
              </div>
              <div className="p-8 flex flex-col flex-1">
                <h4 className="text-3xl font-black uppercase leading-tight mb-4">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                <p className="font-medium text-lg mb-8 flex-1 opacity-80">{product.description}</p>
                <div className="flex justify-between items-end mt-auto">
                  <span className="text-2xl font-black">IDR {Number(product.price).toLocaleString("id-ID")}</span>
                  <button 
                    onClick={() => handleAddToCart(product)} 
                    className={`w-14 h-14 rounded-full border-[4px] border-inherit flex items-center justify-center hover:bg-[#E63946] hover:text-white transition-colors`}
                  >
                    <Plus size={24} weight="bold" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="p-12 md:p-24 flex flex-col items-center justify-center text-center relative z-10">
        <h3 className="text-4xl font-black uppercase mb-12">CONNECT</h3>
        <div className="flex flex-wrap justify-center gap-6">
          <a href={waLink} className={`px-8 py-4 border-[4px] ${borderColor} text-xl font-black uppercase hover:bg-[#2A9D8F] hover:text-[#1a1a1a] transition-colors flex items-center gap-3`}>
            <Phone size={24} weight="bold" /> WHATSAPP
          </a>
          {emailLink && <a href={emailLink} className={`px-8 py-4 border-[4px] ${borderColor} text-xl font-black uppercase hover:bg-[#F4A261] hover:text-[#1a1a1a] transition-colors flex items-center gap-3`}>
            <EnvelopeSimple size={24} weight="bold" /> EMAIL
          </a>}
          {igLink && <a href={igLink} className={`px-8 py-4 border-[4px] ${borderColor} text-xl font-black uppercase hover:bg-[#E9C46A] hover:text-[#1a1a1a] transition-colors flex items-center gap-3`}>
            <At size={24} weight="bold" /> INSTAGRAM
          </a>}
        </div>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", ease: "easeInOut", duration: 0.4 }}
              className={`relative w-full max-w-lg h-full ${bgColor} ${textColor} border-l-[8px] border-[#1a1a1a] dark:border-[#f4f4f4] flex flex-col`}
            >
              <div className={`flex justify-between items-center border-b-[4px] ${borderColor} p-8 bg-[#E63946] text-white`}>
                <h2 className="text-4xl font-black uppercase tracking-tighter">BASKET</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-12 h-12 rounded-full border-[4px] border-white flex items-center justify-center hover:bg-white hover:text-[#E63946] transition-colors font-black">X</button>
              </div>
              
              <div className="flex-1 overflow-auto p-8 space-y-8">
                {cart.items.map((item: any, idx: number) => (
                  <div key={item.id} className={`flex gap-6 border-[4px] ${borderColor} p-4 bg-inherit`}>
                    <div className={`w-24 h-24 border-[4px] ${borderColor} flex-shrink-0 bg-black/5`}>
                      <img src={item.imageUrl} className="w-full h-full object-cover grayscale mix-blend-multiply" />
                    </div>
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-black text-xl uppercase leading-tight mb-2">{item.name}</h4>
                      <p className="font-bold text-lg mb-4">IDR {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={`w-10 h-10 border-[4px] ${borderColor} flex items-center justify-center hover:bg-current hover:text-${isDark ? '[#1a1a1a]' : 'white'} transition-colors font-black`}>-</button>
                        <span className="font-black text-xl w-6 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={`w-10 h-10 border-[4px] ${borderColor} flex items-center justify-center hover:bg-current hover:text-${isDark ? '[#1a1a1a]' : 'white'} transition-colors font-black`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                  <div className={`p-6 border-[4px] ${borderColor} bg-[#F4A261] text-[#1a1a1a] space-y-6 mt-8`}>
                    <h3 className="font-black text-2xl uppercase">DETAILS</h3>
                    <input type="text" placeholder="NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-[4px] border-[#1a1a1a] pb-2 text-xl font-bold outline-none placeholder-[#1a1a1a]/50 uppercase" />
                    <input type="text" placeholder="PHONE" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b-[4px] border-[#1a1a1a] pb-2 text-xl font-bold outline-none placeholder-[#1a1a1a]/50 uppercase" />
                    <textarea placeholder="ADDRESS" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b-[4px] border-[#1a1a1a] pb-2 text-xl font-bold outline-none placeholder-[#1a1a1a]/50 uppercase h-24" />
                  </div>
                )}
              </div>
              
              {(cart.items[tenant.subdomain || ""] || []).length > 0 && (
                <div className={`border-t-[4px] ${borderColor} p-8 bg-[#2A9D8F] text-[#1a1a1a]`}>
                  <div className="flex justify-between items-end mb-8">
                    <span className="font-black text-3xl uppercase">TOTAL</span>
                    <span className="font-black text-3xl">IDR {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-6 border-[4px] border-[#1a1a1a] bg-[#1a1a1a] text-white font-black text-3xl uppercase hover:bg-transparent hover:text-[#1a1a1a] transition-colors flex items-center justify-center gap-4`}>
                    CHECKOUT <ArrowRight size={32} weight="bold" />
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
