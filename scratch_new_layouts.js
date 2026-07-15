const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Find the start of the render logic
const startMarker = "  // ==========================================\n  // RENDER: EDITORIAL";
const startIndex = content.indexOf(startMarker);
if (startIndex === -1) {
  console.error("Could not find start marker");
  process.exit(1);
}

// The end of the component
const endMarker = "}\n";
const lastBrace = content.lastIndexOf(endMarker);

// New layout block
const newLayouts = `  // ==========================================
  // RENDER: NEO-BRUTALISM (was EDITORIAL)
  // ==========================================
  if (layoutStyle === "editorial") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-zinc-900 text-white' : 'bg-[#F2EDDE] text-black'} font-\${fontFamily} overflow-x-hidden\`}>
        
        {/* BRUTALIST NAV */}
        <header className={\`fixed top-0 inset-x-0 z-50 border-b-4 \${isDark ? 'border-white bg-zinc-900' : 'border-black bg-[#F2EDDE]'} flex items-center justify-between px-6 py-4\`}>
          <div className="flex items-center gap-4">
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} alt="Logo" className={\`w-12 h-12 border-2 \${isDark ? 'border-white bg-black' : 'border-black bg-white'} object-contain\`} />
            ) : (
              <div className={\`w-12 h-12 flex items-center justify-center border-2 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-white'}\`}>
                <Coffee {...iconProps} className="w-8 h-8" />
              </div>
            )}
            <h1 className="text-3xl font-black uppercase tracking-tighter leading-none">{tenant.name}</h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className={\`px-6 py-2 border-4 \${isDark ? 'border-white bg-zinc-800 shadow-[4px_4px_0_0_#fff] hover:shadow-none' : 'border-black bg-[#FF5722] text-white shadow-[4px_4px_0_0_#000] hover:shadow-[0_0_0_0_#000]'} hover:translate-x-1 hover:translate-y-1 transition-all uppercase font-black\`}>
            CART ({cart.items.length})
          </button>
        </header>

        {/* BRUTALIST HERO */}
        <section className={\`mt-24 mx-6 border-4 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-[#FFC107]'} min-h-[60vh] flex flex-col justify-center items-center text-center p-12 relative overflow-hidden\`}>
          {tenant.backgroundImageUrl && (
            <img src={tenant.backgroundImageUrl} alt="BG" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-multiply grayscale" />
          )}
          <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter z-10 mix-blend-exclusion text-white" style={{ WebkitTextStroke: isDark ? '2px white' : '2px black' }}>
            WE ROAST<br/>GOOD SHIT
          </h2>
        </section>

        {/* MARQUEE ABOUT */}
        <div className={\`border-y-4 \${isDark ? 'border-white bg-zinc-900 text-white' : 'border-black bg-white text-black'} py-4 mt-12 overflow-hidden whitespace-nowrap flex\`}>
          <div className="animate-[marquee_20s_linear_infinite] flex gap-10 items-center">
            {[...Array(5)].map((_, i) => (
              <span key={i} className="text-3xl font-black uppercase tracking-widest">{aboutText || 'ESTABLISHED QUALITY ROASTERS'} <Coffee {...iconProps} className="inline w-8 h-8 mx-4"/></span>
            ))}
          </div>
        </div>

        {/* BRUTALIST CATALOG */}
        <section id="catalog" className="p-6 mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className={\`border-4 \${isDark ? 'border-white bg-zinc-800 shadow-[8px_8px_0_0_#fff]' : 'border-black bg-white shadow-[8px_8px_0_0_#000]'} flex flex-col group\`}>
                <div className={\`h-64 border-b-4 \${isDark ? 'border-white bg-black' : 'border-black bg-zinc-100'} p-4 relative overflow-hidden flex items-center justify-center\`}>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover filter grayscale contrast-125 group-hover:grayscale-0 transition-all" />
                  ) : (
                    <Package {...iconProps} className="w-24 h-24 opacity-20" />
                  )}
                  <div className={\`absolute top-2 right-2 border-2 \${isDark ? 'border-white bg-black text-white' : 'border-black bg-yellow-300 text-black'} px-3 py-1 font-black text-xs\`}>
                    RP {Number(product.price).toLocaleString("id-ID")}
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-2">{product.name}</h3>
                  <p className="font-bold opacity-60 mb-6 flex-1">{product.description}</p>
                  <button onClick={() => handleAddToCart(product)} className={\`w-full py-4 border-2 \${isDark ? 'border-white hover:bg-white hover:text-black' : 'border-black bg-[#4CAF50] text-black hover:bg-black hover:text-white'} font-black uppercase transition-colors\`}>
                    + ADD TO CART
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CART DRAWER (BRUTALIST) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-md \${isDark ? 'bg-zinc-900 border-l-4 border-white' : 'bg-white border-l-4 border-black'} flex flex-col h-full shadow-[-20px_0_0_0_rgba(0,0,0,0.2)]\`}>
              <div className={\`p-6 border-b-4 \${isDark ? 'border-white' : 'border-black'} flex justify-between items-center\`}>
                <h2 className="text-3xl font-black uppercase">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="font-black text-2xl hover:text-red-500">X</button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                {cart.items.map(item => (
                  <div key={item.id} className={\`flex gap-4 border-2 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-zinc-100'} p-2\`}>
                    <div className={\`w-20 h-20 border-2 \${isDark ? 'border-white' : 'border-black'} overflow-hidden\`}>
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover grayscale" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black uppercase">{item.name}</h4>
                      <p className="font-bold">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="border-2 border-current px-2 font-black">-</button>
                        <span className="font-black">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="border-2 border-current px-2 font-black">+</button>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.items.length > 0 && (
                  <div className={\`border-t-4 \${isDark ? 'border-white' : 'border-black'} pt-6 space-y-4\`}>
                    <input type="text" placeholder="FULL NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className={\`w-full border-2 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-white'} p-3 font-bold uppercase placeholder-opacity-50\`} />
                    <input type="text" placeholder="WHATSAPP" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={\`w-full border-2 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-white'} p-3 font-bold uppercase placeholder-opacity-50\`} />
                    <textarea placeholder="ADDRESS" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={\`w-full border-2 \${isDark ? 'border-white bg-zinc-800' : 'border-black bg-white'} p-3 font-bold uppercase placeholder-opacity-50 h-24\`} />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className={\`p-6 border-t-4 \${isDark ? 'border-white bg-zinc-900' : 'border-black bg-[#FFC107]'}\`}>
                  <div className="flex justify-between font-black text-2xl mb-4 uppercase">
                    <span>Total</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-4 border-4 \${isDark ? 'border-white bg-white text-black' : 'border-black bg-black text-white'} font-black text-xl uppercase hover:opacity-80\`}>
                    CHECKOUT
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: LUXURY (was CLASSIC)
  // ==========================================
  else if (layoutStyle === "classic") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#111] text-zinc-300' : 'bg-[#FAFAF9] text-zinc-800'} font-serif overflow-x-hidden\`}>
        
        <header className="fixed top-0 inset-x-0 z-50 mix-blend-difference text-white p-8 flex justify-between items-center">
          <h1 className="text-2xl tracking-[0.2em] uppercase">{tenant.name}</h1>
          <button onClick={() => setIsCartOpen(true)} className="uppercase tracking-[0.1em] text-sm hover:opacity-50 transition-opacity">
            Bag ({cart.items.length})
          </button>
        </header>

        <section className="relative h-screen flex items-center justify-center p-8">
          {tenant.backgroundImageUrl ? (
            <motion.img 
              initial={{ scale: 1.1, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeOut" }}
              src={tenant.backgroundImageUrl} alt="Hero" className="absolute inset-0 w-full h-full object-cover filter brightness-[0.8]" 
            />
          ) : (
            <div className={\`absolute inset-0 \${isDark ? 'bg-zinc-900' : 'bg-zinc-200'}\`}></div>
          )}
          <div className="relative z-10 text-center max-w-3xl">
            <motion.h2 
              initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1.5, delay: 0.5 }}
              className="text-4xl md:text-6xl font-light tracking-widest uppercase leading-snug text-white mix-blend-overlay"
            >
              The Art of Coffee
            </motion.h2>
          </div>
        </section>

        <section className="max-w-4xl mx-auto py-32 px-8 text-center">
          <p className="text-xl md:text-3xl font-light leading-loose tracking-wide">{aboutText || "Crafting exceptional coffee experiences through meticulous sourcing and roasting."}</p>
        </section>

        <section className="py-20 px-8">
          <div className="max-w-6xl mx-auto flex flex-col gap-32">
            {products.map((product, idx) => (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 1 }}
                key={product.id} 
                className={\`flex flex-col \${idx % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-12 items-center\`}
              >
                <div className="w-full md:w-1/2 aspect-[3/4] relative overflow-hidden group">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                  ) : (
                    <div className={\`absolute inset-0 flex items-center justify-center \${isDark ? 'bg-zinc-800' : 'bg-zinc-200'}\`}>
                      <Coffee className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <div className="w-full md:w-1/2 flex flex-col justify-center">
                  <span className="text-sm tracking-[0.2em] uppercase opacity-50 mb-4">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                  <h3 className="text-3xl md:text-5xl font-light mb-6 tracking-wide">{product.name}</h3>
                  <p className="text-lg opacity-70 leading-relaxed mb-10 max-w-md font-sans font-light">{product.description}</p>
                  <button 
                    onClick={() => handleAddToCart(product)}
                    className={\`w-max px-10 py-4 border \${isDark ? 'border-zinc-700 hover:bg-white hover:text-black' : 'border-zinc-300 hover:bg-black hover:text-white'} transition-colors tracking-widest uppercase text-sm\`}
                  >
                    Add to Bag
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CART DRAWER (LUXURY) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end font-sans">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.5 }}
              className={\`relative w-full max-w-md \${isDark ? 'bg-[#111] text-zinc-300' : 'bg-white text-zinc-800'} h-full flex flex-col p-8\`}
            >
              <div className="flex justify-between items-center mb-12">
                <h2 className="text-xl tracking-widest uppercase font-serif">Shopping Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="opacity-50 hover:opacity-100 text-sm tracking-widest uppercase">Close</button>
              </div>
              
              <div className="flex-1 overflow-auto space-y-8">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-6 pb-8 border-b border-zinc-500/20">
                    <div className="w-24 h-32 relative overflow-hidden bg-zinc-100">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col">
                      <h4 className="font-serif text-lg tracking-wide">{item.name}</h4>
                      <p className="text-sm opacity-60 mt-1">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="mt-auto flex items-center gap-4">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="opacity-50 hover:opacity-100">-</button>
                        <span className="text-sm">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="opacity-50 hover:opacity-100">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 0 && (
                  <div className="pt-8 space-y-6">
                    <div>
                      <label className="text-xs tracking-widest uppercase opacity-50 block mb-2">Name</label>
                      <input type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className={\`w-full bg-transparent border-b \${isDark ? 'border-zinc-700' : 'border-zinc-200'} pb-2 outline-none focus:border-current transition-colors\`} />
                    </div>
                    <div>
                      <label className="text-xs tracking-widest uppercase opacity-50 block mb-2">WhatsApp</label>
                      <input type="text" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={\`w-full bg-transparent border-b \${isDark ? 'border-zinc-700' : 'border-zinc-200'} pb-2 outline-none focus:border-current transition-colors\`} />
                    </div>
                    <div>
                      <label className="text-xs tracking-widest uppercase opacity-50 block mb-2">Address</label>
                      <input type="text" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={\`w-full bg-transparent border-b \${isDark ? 'border-zinc-700' : 'border-zinc-200'} pb-2 outline-none focus:border-current transition-colors\`} />
                    </div>
                  </div>
                )}
              </div>

              {cart.items.length > 0 && (
                <div className="pt-8 mt-4">
                  <div className="flex justify-between font-serif text-xl mb-8">
                    <span>Total</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-4 \${isDark ? 'bg-white text-black' : 'bg-black text-white'} tracking-widest uppercase text-sm hover:opacity-80 transition-opacity\`}>
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: BENTO DASHBOARD
  // ==========================================
  else if (layoutStyle === "bento") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#000] text-zinc-200' : 'bg-[#E5E5EA] text-zinc-800'} font-\${fontFamily} p-2 md:p-4 lg:p-6\`}>
        
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-4 auto-rows-[200px]">
          
          {/* HEADER WIDGET */}
          <div className={\`col-span-1 md:col-span-4 lg:col-span-8 row-span-1 \${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} rounded-3xl p-8 flex items-center justify-between shadow-sm overflow-hidden relative group\`}>
            <div className="relative z-10">
              <h1 className="text-4xl font-bold tracking-tight mb-1">{tenant.name}</h1>
              <p className="opacity-50 text-sm font-medium">B2B Dashboard</p>
            </div>
            {tenant.logoUrl ? (
              <img src={tenant.logoUrl} className="w-24 h-24 object-contain relative z-10" />
            ) : (
              <Coffee className="w-24 h-24 opacity-10 relative z-10 group-hover:scale-110 transition-transform" />
            )}
            <div className={\`absolute -right-20 -top-20 w-64 h-64 rounded-full blur-3xl opacity-20 \${isDark ? theme.primary : 'bg-blue-400'}\`}></div>
          </div>

          {/* CART WIDGET */}
          <div 
            onClick={() => setIsCartOpen(true)}
            className={\`col-span-1 md:col-span-2 lg:col-span-4 row-span-1 \${isDark ? 'bg-[#1C1C1E] hover:bg-[#2C2C2E]' : 'bg-[#F2F2F7] hover:bg-[#FFFFFF]'} rounded-3xl p-8 flex flex-col justify-center cursor-pointer transition-colors shadow-sm relative overflow-hidden\`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="opacity-50 font-medium mb-2">Shopping Cart</p>
                <h3 className="text-3xl font-bold">{cart.items.length} Items</h3>
              </div>
              <div className={\`w-16 h-16 rounded-full flex items-center justify-center \${isDark ? 'bg-[#2C2C2E]' : 'bg-white'} shadow-sm\`}>
                <Package size={24} />
              </div>
            </div>
          </div>

          {/* HERO IMAGE WIDGET */}
          <div className="col-span-1 md:col-span-4 lg:col-span-8 row-span-2 rounded-3xl overflow-hidden relative shadow-sm">
            {tenant.backgroundImageUrl ? (
              <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover" />
            ) : (
              <div className={\`w-full h-full \${isDark ? 'bg-gradient-to-br from-zinc-800 to-zinc-900' : 'bg-gradient-to-br from-blue-100 to-indigo-100'}\`}></div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 text-white">
              <h2 className="text-3xl font-bold">Premium Selection</h2>
              <p className="opacity-80 mt-2 max-w-md text-sm">Discover our carefully curated catalog of freshly roasted beans for your business.</p>
            </div>
          </div>

          {/* ABOUT WIDGET */}
          <div className={\`col-span-1 md:col-span-4 lg:col-span-4 row-span-2 \${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} rounded-3xl p-8 flex flex-col shadow-sm\`}>
            <h3 className="font-bold opacity-50 mb-6">About Us</h3>
            <p className="text-lg leading-relaxed flex-1 overflow-auto">{aboutText || "Your trusted partner in quality coffee roasting."}</p>
          </div>

          {/* PRODUCTS GRID WIDGETS */}
          {products.map((product, idx) => (
            <div key={product.id} className={\`col-span-1 md:col-span-2 lg:col-span-4 row-span-2 \${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} rounded-3xl p-6 flex flex-col shadow-sm group\`}>
              <div className="w-full h-40 rounded-2xl overflow-hidden bg-black/5 mb-4 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <Coffee className="w-full h-full p-10 opacity-20" />
                )}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-black px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  Rp {Number(product.price).toLocaleString("id-ID")}
                </div>
              </div>
              <h4 className="font-bold text-xl mb-1 line-clamp-1">{product.name}</h4>
              <p className="text-sm opacity-50 line-clamp-2 mb-4 flex-1">{product.description}</p>
              <button 
                onClick={() => handleAddToCart(product)}
                className={\`w-full py-3 rounded-xl font-bold \${isDark ? 'bg-zinc-700 hover:bg-white hover:text-black' : 'bg-white hover:bg-black hover:text-white shadow-sm'} transition-all\`}
              >
                Add to Cart
              </button>
            </div>
          ))}

        </div>

        {/* CART MODAL (BENTO) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className={\`relative w-full max-w-2xl max-h-[90vh] \${isDark ? 'bg-[#1C1C1E]' : 'bg-[#F2F2F7]'} rounded-[2rem] shadow-2xl flex flex-col overflow-hidden\`}
            >
              <div className={\`p-6 border-b \${isDark ? 'border-white/10' : 'border-black/10'} flex justify-between items-center\`}>
                <h2 className="text-2xl font-bold">Shopping Cart</h2>
                <div onClick={() => setIsCartOpen(false)} className={\`w-10 h-10 rounded-full \${isDark ? 'bg-zinc-800' : 'bg-white'} flex items-center justify-center cursor-pointer hover:scale-105 transition-transform\`}>X</div>
              </div>
              
              <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
                {cart.items.map(item => (
                  <div key={item.id} className={\`flex gap-4 p-4 rounded-2xl \${isDark ? 'bg-[#2C2C2E]' : 'bg-white shadow-sm'}\`}>
                    <img src={item.imageUrl} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="opacity-60 text-sm mb-2">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={\`w-8 h-8 rounded-full \${isDark ? 'bg-zinc-700' : 'bg-zinc-100'} flex items-center justify-center\`}>-</button>
                        <span className="font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={\`w-8 h-8 rounded-full \${isDark ? 'bg-zinc-700' : 'bg-zinc-100'} flex items-center justify-center\`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {cart.items.length > 0 && (
                  <div className={\`mt-4 p-6 rounded-2xl \${isDark ? 'bg-[#2C2C2E]' : 'bg-white shadow-sm'} space-y-4\`}>
                    <h3 className="font-bold mb-2">Delivery Details</h3>
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={\`w-full p-4 rounded-xl \${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-200'} border outline-none\`} />
                    <input type="text" placeholder="WhatsApp Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={\`w-full p-4 rounded-xl \${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-200'} border outline-none\`} />
                    <textarea placeholder="Complete Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={\`w-full p-4 rounded-xl \${isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-zinc-50 border-zinc-200'} border outline-none min-h-[100px]\`} />
                  </div>
                )}
              </div>

              {cart.items.length > 0 && (
                <div className={\`p-6 border-t \${isDark ? 'border-white/10 bg-[#1C1C1E]' : 'border-black/10 bg-[#F2F2F7]'}\`}>
                  <div className="flex justify-between items-center mb-4">
                    <span className="opacity-60 font-medium">Total Amount</span>
                    <span className="text-2xl font-bold">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20">
                    Confirm Order
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // RENDER: MODERN (APPLE / AWWWARDS)
  // ==========================================
  else {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#050505] text-white' : 'bg-[#FAFAFA] text-black'} font-\${fontFamily} overflow-x-hidden selection:bg-blue-500/30\`}>
        
        {/* AMBIENT GLOWS */}
        <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
          <div className={\`absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 mix-blend-screen \${isDark ? 'bg-blue-600' : 'bg-blue-300'}\`}></div>
          <div className={\`absolute bottom-[-20%] right-[-10%] w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-20 mix-blend-screen \${isDark ? 'bg-purple-600' : 'bg-indigo-300'}\`}></div>
        </div>

        {/* GLASS HEADER */}
        <header className={\`fixed top-0 inset-x-0 z-50 border-b \${isDark ? 'border-white/10 bg-black/40' : 'border-black/10 bg-white/40'} backdrop-blur-2xl\`}>
          <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              {tenant.logoUrl ? (
                <div className={\`w-10 h-10 rounded-xl overflow-hidden \${isDark ? 'bg-white/5 border border-white/10' : 'bg-black/5 border border-black/10'} p-1\`}>
                  <img src={tenant.logoUrl} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className={\`w-10 h-10 rounded-xl \${isDark ? 'bg-gradient-to-tr from-blue-500 to-purple-500' : 'bg-gradient-to-tr from-blue-400 to-indigo-500'} flex items-center justify-center shadow-lg shadow-blue-500/20\`}>
                  <Coffee size={20} className="text-white" />
                </div>
              )}
              <h1 className="text-xl font-semibold tracking-tight">{tenant.name}</h1>
            </div>
            <button 
              onClick={() => setIsCartOpen(true)} 
              className={\`px-5 py-2 rounded-full text-sm font-medium flex items-center gap-2 transition-all \${isDark ? 'bg-white/10 hover:bg-white/20 border border-white/5' : 'bg-black/5 hover:bg-black/10 border border-black/5'}\`}
            >
              <Package size={16} /> Bag ({cart.items.length})
            </button>
          </div>
        </header>

        {/* MODERN HERO */}
        <section className="relative pt-32 pb-20 px-6 z-10 flex flex-col items-center text-center">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }} className="max-w-4xl">
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-b from-current to-current/50">
              Premium Coffee, <br/> Delivered at Scale.
            </h2>
            <p className="text-lg md:text-xl opacity-60 mb-10 max-w-2xl mx-auto">
              {aboutText || "Streamline your wholesale orders with our modern digital platform. Crafted for cafes, restaurants, and businesses."}
            </p>
            <a href="#catalog" className={\`px-8 py-4 rounded-full font-medium transition-all \${isDark ? 'bg-white text-black hover:scale-105' : 'bg-black text-white hover:scale-105'} shadow-xl\`}>
              Explore Catalog
            </a>
          </motion.div>
          
          {tenant.backgroundImageUrl && (
            <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 1, delay: 0.2 }} className="w-full max-w-6xl mt-20 h-[60vh] rounded-[2rem] overflow-hidden relative shadow-2xl">
              <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </motion.div>
          )}
        </section>

        {/* MODERN CATALOG */}
        <section id="catalog" className="py-20 px-6 z-10 relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-12">
              <h3 className="text-3xl font-bold tracking-tight">Product Catalog</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map(product => (
                <div key={product.id} className={\`group relative rounded-[2rem] \${isDark ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-black/5 border-black/10 hover:bg-black/10'} border p-2 transition-all duration-300 flex flex-col\`}>
                  <div className="aspect-[4/3] rounded-[1.5rem] overflow-hidden bg-black/10 relative mb-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <Coffee className="w-full h-full p-12 opacity-20" />
                    )}
                  </div>
                  <div className="px-4 pb-4 flex flex-col flex-1">
                    <h4 className="text-xl font-semibold mb-1">{product.name}</h4>
                    <p className="opacity-50 text-sm line-clamp-2 mb-6 flex-1">{product.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-semibold text-lg">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className={\`w-10 h-10 rounded-full flex items-center justify-center \${isDark ? 'bg-white text-black' : 'bg-black text-white'} group-hover:scale-110 transition-transform\`}
                      >
                        <Plus size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CART DRAWER (MODERN) */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></motion.div>
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={\`relative w-full max-w-md h-full \${isDark ? 'bg-[#0A0A0A]/90 border-l border-white/10' : 'bg-white/90 border-l border-black/10'} backdrop-blur-3xl flex flex-col shadow-2xl\`}
            >
              <div className={\`p-6 border-b \${isDark ? 'border-white/10' : 'border-black/10'} flex justify-between items-center\`}>
                <h2 className="text-xl font-semibold">Your Bag</h2>
                <div onClick={() => setIsCartOpen(false)} className={\`w-8 h-8 rounded-full \${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} flex items-center justify-center cursor-pointer transition-colors\`}>
                  <Minus size={16} className="rotate-45" />
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6 space-y-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className={\`w-24 h-24 rounded-2xl \${isDark ? 'bg-white/5' : 'bg-black/5'} overflow-hidden\`}>
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover" />}
                    </div>
                    <div className="flex-1 flex flex-col py-1">
                      <h4 className="font-semibold line-clamp-1">{item.name}</h4>
                      <p className="opacity-60 text-sm">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="mt-auto flex items-center gap-3">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className={\`w-7 h-7 rounded-full \${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} flex items-center justify-center\`}>-</button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className={\`w-7 h-7 rounded-full \${isDark ? 'bg-white/10 hover:bg-white/20' : 'bg-black/5 hover:bg-black/10'} flex items-center justify-center\`}>+</button>
                      </div>
                    </div>
                  </div>
                ))}

                {cart.items.length > 0 && (
                  <div className={\`mt-8 pt-8 border-t \${isDark ? 'border-white/10' : 'border-black/10'} space-y-4\`}>
                    <h3 className="font-medium mb-4">Delivery Information</h3>
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className={\`w-full p-4 rounded-2xl \${isDark ? 'bg-white/5 border border-white/10 focus:border-white/30' : 'bg-black/5 border border-black/10 focus:border-black/30'} outline-none transition-colors\`} />
                    <input type="text" placeholder="WhatsApp Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className={\`w-full p-4 rounded-2xl \${isDark ? 'bg-white/5 border border-white/10 focus:border-white/30' : 'bg-black/5 border border-black/10 focus:border-black/30'} outline-none transition-colors\`} />
                    <textarea placeholder="Shipping Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className={\`w-full p-4 rounded-2xl \${isDark ? 'bg-white/5 border border-white/10 focus:border-white/30' : 'bg-black/5 border border-black/10 focus:border-black/30'} outline-none transition-colors min-h-[120px]\`} />
                  </div>
                )}
              </div>

              {cart.items.length > 0 && (
                <div className={\`p-6 border-t \${isDark ? 'border-white/10 bg-[#0A0A0A]' : 'border-black/10 bg-white'}\`}>
                  <div className="flex justify-between items-center mb-6">
                    <span className="opacity-60">Total</span>
                    <span className="text-2xl font-bold">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-4 rounded-2xl \${isDark ? 'bg-white text-black hover:bg-zinc-200' : 'bg-black text-white hover:bg-zinc-800'} font-semibold transition-colors\`}>
                    Checkout
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }
`;

content = content.substring(0, startIndex) + newLayouts + content.substring(lastBrace);
fs.writeFileSync(targetPath, content, 'utf8');
console.log("Stitched new layouts successfully!");
