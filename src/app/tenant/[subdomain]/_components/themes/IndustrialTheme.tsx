"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Package, Phone, EnvelopeSimple, At, List, X, HardDrives } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

export function IndustrialTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, isDark
}: ThemeProps) {
  
  const bgClass = isDark ? 'bg-[#0f172a] text-[#38bdf8]' : 'bg-[#e2e8f0] text-[#334155]';
  const borderClass = isDark ? 'border-[#38bdf8]' : 'border-[#334155]';
  const hoverBg = isDark ? 'hover:bg-[#38bdf8]' : 'hover:bg-[#334155]';
  const hoverText = isDark ? 'hover:text-[#0f172a]' : 'hover:text-[#e2e8f0]';
  
  const gridPattern = isDark 
    ? 'bg-[linear-gradient(rgba(56,189,248,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.15)_1px,transparent_1px)]'
    : 'bg-[linear-gradient(rgba(51,65,85,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.15)_1px,transparent_1px)]';

  return (
    <div className={`min-h-screen ${bgClass} font-mono overflow-x-hidden relative selection:bg-current selection:text-white`}>
      <div className={`fixed inset-0 pointer-events-none ${gridPattern} bg-[size:40px_40px] z-0`}></div>
      <div className={`fixed inset-0 pointer-events-none ${gridPattern} bg-[size:8px_8px] opacity-30 z-0`}></div>
      
      <header className={`border-b-4 ${borderClass} p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 bg-inherit shadow-[0_4px_20px_rgba(0,0,0,0.1)] gap-4`}>
        <div className="flex items-center gap-4">
          <motion.div initial={{ rotate: -90 }} animate={{ rotate: 0 }} transition={{ duration: 0.5 }} className={`w-12 h-12 border-2 ${borderClass} flex items-center justify-center p-1 bg-inherit`}>
            {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-full h-full object-contain grayscale contrast-200" /> : <HardDrives size={24} weight="bold" />}
          </motion.div>
          <div>
            <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tighter leading-none">[ {tenant.name} ]</h1>
            <span className={`text-[10px] uppercase border ${borderClass} px-1 mt-1 inline-block`}>SYS_ON // PORTAL</span>
          </div>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)} 
          className={`border-4 ${borderClass} px-8 py-3 uppercase font-black text-lg ${hoverBg} ${hoverText} transition-colors flex items-center gap-3 active:translate-y-1 shadow-[4px_4px_0_0_currentColor] hover:shadow-[0_0_0_0_currentColor]`}
        >
          <List size={24} weight="bold" /> INVENTORY ({cart.items.length})
        </button>
      </header>

      <main className="p-4 md:p-10 max-w-7xl mx-auto relative z-10">
        <section className={`border-4 ${borderClass} p-8 md:p-12 mb-16 flex flex-col lg:flex-row gap-12 items-center bg-inherit shadow-[12px_12px_0_0_currentColor]`}>
          <div className="flex-1">
            <div className={`inline-block px-3 py-1 border-2 ${borderClass} text-xs font-bold uppercase mb-6`}>_SPECIFICATION</div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-black uppercase mb-8 leading-none tracking-tight border-b-4 border-current pb-6"
            >
              {heroGreeting}
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg leading-relaxed uppercase opacity-90 max-w-2xl font-bold"
            >
              {aboutText}
            </motion.p>
          </div>
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.8 }}
            className={`w-full lg:w-5/12 aspect-[4/3] border-4 ${borderClass} p-3 relative group`}
          >
            <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-current z-20"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-current z-20"></div>
            
            <div className="w-full h-full relative overflow-hidden bg-black/5">
              {tenant.backgroundImageUrl || tenant.heroImageUrl ? (
                <img src={(tenant.backgroundImageUrl || tenant.heroImageUrl) as string} className="w-full h-full object-cover grayscale contrast-[1.5] brightness-75 group-hover:scale-105 transition-transform duration-700 mix-blend-hard-light" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><Package size={80} className="opacity-20" weight="duotone" /></div>
              )}
              <div className={`absolute inset-0 ${gridPattern} bg-[size:20px_20px] opacity-40 mix-blend-overlay`}></div>
            </div>
          </motion.div>
        </section>

        <section id="catalog">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-3xl font-black uppercase tracking-tight">&gt; MATERIAL_DB</h3>
            <div className={`h-1 flex-1 ${isDark ? 'bg-[#38bdf8]' : 'bg-[#334155]'}`}></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tenant.products.map((product, idx) => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`border-4 ${borderClass} flex flex-col bg-inherit hover:shadow-[8px_8px_0_0_currentColor] transition-all group hover:-translate-y-1 hover:-translate-x-1`}
              >
                <div className={`border-b-4 ${borderClass} aspect-square p-3 relative overflow-hidden bg-black/5`}>
                   <div className="absolute top-2 left-2 text-xs font-bold opacity-50">REF:{product.id.substring(0,6).toUpperCase()}</div>
                   {product.imageUrl ? (
                     <img src={product.imageUrl} className="w-full h-full object-cover grayscale contrast-150 opacity-80 group-hover:opacity-100 mix-blend-luminosity transition-opacity duration-300" />
                   ) : (
                     <Package className="w-full h-full p-12 opacity-20" weight="thin" />
                   )}
                </div>
                <div className="p-6 flex flex-col flex-1">
                  <h4 className="font-black uppercase text-2xl mb-2 leading-none">{product.name}</h4>
                {product.category && (
                  <span className="inline-block mt-2 text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full border border-[var(--t-accent)] text-[var(--t-accent)] bg-[var(--t-accent)]/10">
                    {product.category}
                  </span>
                )}
                  <p className="text-sm opacity-80 mb-8 flex-1 font-bold">{product.description}</p>
                  <div className={`border-t-2 ${borderClass} pt-4 mt-auto flex flex-col gap-4`}>
                    <p className="font-black text-xl">IDR {Number(product.price).toLocaleString("id-ID")}</p>
                    <button 
                      onClick={() => handleAddToCart(product)} 
                      className={`w-full py-4 border-4 ${borderClass} uppercase text-lg font-black ${hoverBg} ${hoverText} transition-colors active:translate-y-1 shadow-[2px_2px_0_0_currentColor] hover:shadow-[0_0_0_0_currentColor]`}
                    >
                      ADD_TO_QUEUE
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>

      <section className={`border-t-4 ${borderClass} p-8 md:p-16 text-center relative z-10 bg-inherit mt-20`}>
        <h3 className="text-2xl font-black uppercase mb-10">&gt; EXTERNAL_LINKS</h3>
        <div className="flex flex-wrap justify-center gap-6">
          <a href={waLink} className={`px-6 py-3 border-2 ${borderClass} font-bold uppercase ${hoverBg} ${hoverText} transition-colors flex items-center gap-3 shadow-[4px_4px_0_0_currentColor]`}><Phone size={20} weight="bold" /> NODE_01</a>
          {emailLink && <a href={emailLink} className={`px-6 py-3 border-2 ${borderClass} font-bold uppercase ${hoverBg} ${hoverText} transition-colors flex items-center gap-3 shadow-[4px_4px_0_0_currentColor]`}><EnvelopeSimple size={20} weight="bold" /> NODE_02</a>}
          {igLink && <a href={igLink} className={`px-6 py-3 border-2 ${borderClass} font-bold uppercase ${hoverBg} ${hoverText} transition-colors flex items-center gap-3 shadow-[4px_4px_0_0_currentColor]`}><At size={20} weight="bold" /> NODE_03</a>}
        </div>
      </section>

      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end p-2 md:p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`relative w-full max-w-lg h-full ${bgClass} border-4 ${borderClass} p-8 flex flex-col shadow-[-12px_12px_0_0_currentColor]`}
            >
              <div className={`flex justify-between items-center border-b-4 ${borderClass} pb-6 mb-8`}>
                <h2 className="text-3xl font-black uppercase tracking-tighter">BUFFER_ZONE</h2>
                <button onClick={() => setIsCartOpen(false)} className={`w-12 h-12 border-4 ${borderClass} flex items-center justify-center font-black ${hoverBg} ${hoverText} transition-colors shadow-[2px_2px_0_0_currentColor]`}><X size={24} weight="bold" /></button>
              </div>
              
              <div className="flex-1 overflow-auto space-y-6 pr-2">
                {cart.items.map((item: any) => (
                  <div key={item.id} className={`border-4 ${borderClass} p-4 flex gap-6 bg-inherit hover:shadow-[4px_4px_0_0_currentColor] transition-all`}>
                    <img src={item.imageUrl} className={`w-24 h-24 border-2 ${borderClass} grayscale contrast-[1.5] p-1`} />
                    <div className="flex-1 flex flex-col justify-center">
                      <h4 className="font-black uppercase text-xl leading-none mb-2">{item.name}</h4>
                      <p className="text-sm font-bold opacity-80 mb-4">IDR {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={`w-10 h-10 border-2 ${borderClass} ${hoverBg} ${hoverText} flex items-center justify-center font-black`}>-</button>
                        <span className="w-8 text-center font-black text-xl">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={`w-10 h-10 border-2 ${borderClass} ${hoverBg} ${hoverText} flex items-center justify-center font-black`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 0 && (
                  <div className={`mt-10 border-4 ${borderClass} p-6 space-y-6 bg-inherit shadow-[4px_4px_0_0_currentColor]`}>
                    <h3 className="font-black uppercase text-lg border-b-2 border-current pb-2">&gt; REQ_PARAMS</h3>
                    <input type="text" placeholder="ID_NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className={`w-full bg-transparent border-2 ${borderClass} p-4 outline-none uppercase font-bold focus:shadow-[4px_4px_0_0_currentColor] transition-shadow`} />
                    <input type="text" placeholder="COM_NODE (WA)" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={`w-full bg-transparent border-2 ${borderClass} p-4 outline-none uppercase font-bold focus:shadow-[4px_4px_0_0_currentColor] transition-shadow`} />
                    <textarea placeholder="LOC_VECTOR" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={`w-full bg-transparent border-2 ${borderClass} p-4 outline-none uppercase font-bold h-28 focus:shadow-[4px_4px_0_0_currentColor] transition-shadow`} />
                  </div>
                )}
              </div>
              
              {cart.items.length > 0 && (
                <div className={`pt-8 border-t-4 ${borderClass} mt-6`}>
                  <div className="flex justify-between font-black text-2xl mb-8 uppercase">
                    <span>TOT_VAL</span>
                    <span>IDR {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={`w-full py-6 border-4 ${borderClass} font-black text-2xl uppercase tracking-widest ${isDark ? 'bg-[#38bdf8] text-[#0f172a]' : 'bg-[#334155] text-[#e2e8f0]'} hover:bg-transparent ${isDark ? 'hover:text-[#38bdf8]' : 'hover:text-[#334155]'} transition-colors shadow-[6px_6px_0_0_currentColor] active:translate-y-1 active:shadow-[2px_2px_0_0_currentColor]`}>
                    INIT_CHECKOUT
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
