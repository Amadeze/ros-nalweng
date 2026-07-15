const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('f:/Roastery Operating System/ros-app/src/app/tenant/[subdomain]/_components/TenantPortalClient.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Replace the start of the modern block using regex
const regex = /  \/\/ ==========================================\r?\n  \/\/ RENDER: MODERN \(APPLE \/ AWWWARDS\)\r?\n  \/\/ ==========================================\r?\n  else \{/;

const newLayouts = `  // ==========================================
  // RENDER: VINTAGE (WARM & RETRO)
  // ==========================================
  else if (layoutStyle === "vintage") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#2C2621] text-[#D8C3A5]' : 'bg-[#F4EBD0] text-[#4A3B32]'} font-serif overflow-x-hidden selection:bg-[#E98074] selection:text-white\`}>
        <div className={\`fixed inset-0 pointer-events-none opacity-20 \${isDark ? 'mix-blend-overlay' : 'mix-blend-multiply'}\`} style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/aged-paper.png")' }}></div>
        
        <header className={\`border-b-2 border-dashed \${isDark ? 'border-[#D8C3A5]/30' : 'border-[#4A3B32]/30'} p-6 flex flex-col items-center justify-center relative z-10\`}>
          <div className="absolute left-6 top-6">
            <span className="text-xs tracking-widest uppercase opacity-60">Est. 2024</span>
          </div>
          {tenant.logoUrl ? (
            <img src={tenant.logoUrl} className="w-16 h-16 object-contain sepia contrast-125 mb-4" />
          ) : (
            <Coffee className="w-12 h-12 mb-4 opacity-80" />
          )}
          <h1 className="text-3xl font-bold tracking-[0.2em] uppercase">{tenant.name}</h1>
          <button onClick={() => setIsCartOpen(true)} className="absolute right-6 top-6 flex items-center gap-2 uppercase tracking-widest text-sm hover:opacity-70 transition-opacity">
            <Package size={18} /> [<span className="w-4 text-center">{cart.items.length}</span>]
          </button>
        </header>

        <section className="py-20 px-6 max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-normal leading-tight italic mb-8">"{tenant.heroText || 'Preserving the traditional art of coffee roasting.'}"</h2>
          <div className="w-24 h-[1px] bg-current opacity-30 mx-auto mb-8"></div>
          <p className="text-lg leading-relaxed tracking-wide opacity-80">{aboutText || "Our beans are carefully selected and roasted to perfection."}</p>
        </section>

        <section className="py-12 px-6 max-w-6xl mx-auto relative z-10">
          <h3 className="text-2xl font-bold tracking-widest uppercase text-center mb-16 border-b-2 border-current pb-4">Our Provisions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map(product => (
              <div key={product.id} className="flex flex-col group cursor-pointer">
                <div className={\`aspect-[3/4] p-4 border-2 \${isDark ? 'border-[#D8C3A5]/20 bg-[#36302B]' : 'border-[#4A3B32]/20 bg-[#E8DCB8]'} mb-6 relative overflow-hidden\`}>
                  <div className={\`absolute inset-2 border border-dashed \${isDark ? 'border-[#D8C3A5]/20' : 'border-[#4A3B32]/20'} z-10 pointer-events-none\`}></div>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover sepia contrast-125 group-hover:scale-105 transition-transform duration-1000" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center opacity-10"><Coffee size={64} /></div>
                  )}
                </div>
                <h4 className="text-xl font-bold uppercase tracking-wider mb-2 text-center">{product.name}</h4>
                <p className="opacity-70 text-center mb-4 italic flex-1">{product.description}</p>
                <div className="flex flex-col items-center gap-4">
                  <span className="font-bold tracking-widest">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                  <button onClick={() => handleAddToCart(product)} className={\`px-8 py-2 border border-current uppercase tracking-widest text-xs font-bold \${isDark ? 'hover:bg-[#D8C3A5] hover:text-[#2C2621]' : 'hover:bg-[#4A3B32] hover:text-[#F4EBD0]'} transition-colors\`}>
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/60" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-md h-full \${isDark ? 'bg-[#2C2621] text-[#D8C3A5]' : 'bg-[#F4EBD0] text-[#4A3B32]'} border-l-4 border-double border-current flex flex-col p-8\`}>
              <div className="flex justify-between items-center mb-10 pb-4 border-b border-current">
                <h2 className="text-2xl font-bold tracking-widest uppercase">Shopping Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="uppercase tracking-widest text-sm hover:opacity-50">Close</button>
              </div>
              <div className="flex-1 overflow-auto space-y-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 pb-6 border-b border-dashed border-current/30">
                    <div className="w-20 h-24 border border-current p-1">
                      {item.imageUrl && <img src={item.imageUrl} className="w-full h-full object-cover sepia" />}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold tracking-wide uppercase">{item.name}</h4>
                      <p className="opacity-70 text-sm mb-3">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex gap-4 items-center">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="border border-current w-6 h-6 flex items-center justify-center">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="border border-current w-6 h-6 flex items-center justify-center">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                  <div className="pt-6 space-y-4">
                    <input type="text" placeholder="Full Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/50" />
                    <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/50" />
                    <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b border-current pb-2 outline-none placeholder-current/50 h-20" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-8 border-t-2 border-dashed border-current mt-4">
                  <div className="flex justify-between font-bold text-xl mb-6">
                    <span>Total</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-4 border-2 border-current font-bold uppercase tracking-widest \${isDark ? 'bg-[#D8C3A5] text-[#2C2621]' : 'bg-[#4A3B32] text-[#F4EBD0]'} hover:opacity-90\`}>
                    Proceed to Payment
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
  // RENDER: FUTURISTIC (CYBERPUNK)
  // ==========================================
  else if (layoutStyle === "futuristic") {
    return (
      <div className="min-h-screen bg-[#050510] text-[#00ffcc] font-mono overflow-x-hidden selection:bg-[#ff00ff] selection:text-white relative">
        <div className="fixed inset-0 pointer-events-none opacity-10 bg-[linear-gradient(rgba(0,255,204,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,204,0.2)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        <header className="border-b border-[#00ffcc] bg-[#050510]/80 backdrop-blur-md p-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_0_15px_rgba(0,255,204,0.3)]">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 border border-[#ff00ff] flex items-center justify-center shadow-[0_0_10px_rgba(255,0,255,0.5)]">
              {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-8 h-8 object-contain filter hue-rotate-90 saturate-200" /> : <Coffee size={20} />}
            </div>
            <h1 className="text-2xl font-bold uppercase tracking-widest drop-shadow-[0_0_5px_#00ffcc]">SYS.{tenant.name.replace(/\\s+/g, "_")}</h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="border border-[#00ffcc] px-4 py-1 hover:bg-[#00ffcc] hover:text-black transition-colors shadow-[0_0_8px_#00ffcc] uppercase text-sm">
            CART_[{cart.items.length}]
          </button>
        </header>

        <section className="py-24 px-8 max-w-5xl mx-auto flex flex-col md:flex-row gap-12 items-center relative z-10">
          <div className="flex-1">
            <h2 className="text-5xl font-bold uppercase tracking-tighter mb-4 text-[#ff00ff] drop-shadow-[0_0_10px_#ff00ff]">&gt; INIT_PROTOCOL</h2>
            <p className="text-lg opacity-80 leading-relaxed uppercase">{aboutText || "AWAITING DIRECTIVES... COFFEE CALIBRATION SET TO OPTIMAL."}</p>
          </div>
          <div className="w-full md:w-1/3 aspect-square border-2 border-[#00ffcc] p-2 shadow-[0_0_20px_rgba(0,255,204,0.4)] relative">
            <div className="absolute inset-0 bg-[#00ffcc]/10 animate-pulse"></div>
            {tenant.backgroundImageUrl ? (
              <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover filter contrast-150 saturate-200 hue-rotate-180" />
            ) : (
              <div className="w-full h-full bg-[#0a0a20] flex items-center justify-center"><Package size={48} className="animate-spin-slow" /></div>
            )}
          </div>
        </section>

        <section className="py-12 px-8 max-w-7xl mx-auto relative z-10">
          <h3 className="text-2xl font-bold uppercase mb-12 border-l-4 border-[#ff00ff] pl-4 drop-shadow-[0_0_5px_#ff00ff]">Available_Modules</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className="border border-[#00ffcc]/50 bg-[#0a0a1a] p-6 hover:border-[#00ffcc] hover:shadow-[0_0_15px_#00ffcc] transition-all group flex flex-col">
                <div className="h-48 border border-[#ff00ff]/30 mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-1 bg-[#ff00ff]/50 animate-scanline"></div>
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 filter grayscale group-hover:grayscale-0 transition-all duration-300" />
                  ) : (
                    <Coffee className="w-full h-full p-8 opacity-20" />
                  )}
                </div>
                <h4 className="font-bold text-xl uppercase mb-2">&gt; {product.name}</h4>
                <p className="opacity-60 text-sm mb-6 flex-1">{product.description}</p>
                <div className="flex justify-between items-center">
                  <span className="font-bold">CR {Number(product.price).toLocaleString("id-ID")}</span>
                  <button onClick={() => handleAddToCart(product)} className="bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff] px-4 py-2 uppercase text-xs font-bold hover:bg-[#ff00ff] hover:text-black transition-colors shadow-[0_0_10px_rgba(255,0,255,0.5)]">
                    EXECUTE
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className="relative w-full max-w-md bg-[#050510] border-l-2 border-[#ff00ff] p-8 flex flex-col shadow-[-10px_0_30px_rgba(255,0,255,0.2)]">
              <div className="flex justify-between items-center mb-8 border-b border-[#00ffcc] pb-4">
                <h2 className="text-xl font-bold uppercase text-[#00ffcc]">&gt; CART_MEMORY</h2>
                <button onClick={() => setIsCartOpen(false)} className="hover:text-[#ff00ff]">TERMINATE</button>
              </div>
              <div className="flex-1 overflow-auto space-y-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 bg-[#0a0a20] p-4 border border-[#00ffcc]/30">
                    <img src={item.imageUrl} className="w-16 h-16 object-cover border border-[#ff00ff]/50 grayscale" />
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-sm mb-1">{item.name}</h4>
                      <p className="opacity-60 text-xs mb-3">CR {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-3">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="border border-[#00ffcc] px-2 hover:bg-[#00ffcc] hover:text-black">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="border border-[#00ffcc] px-2 hover:bg-[#00ffcc] hover:text-black">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                  <div className="pt-6 space-y-4">
                    <input type="text" placeholder="USER_ID" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-[#0a0a20] border border-[#ff00ff]/50 p-3 outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_#ff00ff]" />
                    <input type="text" placeholder="COMMLINK" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-[#0a0a20] border border-[#ff00ff]/50 p-3 outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_#ff00ff]" />
                    <textarea placeholder="SECTOR_COORDS" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-[#0a0a20] border border-[#ff00ff]/50 p-3 outline-none focus:border-[#ff00ff] focus:shadow-[0_0_10px_#ff00ff] h-24" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-6 mt-4">
                  <div className="flex justify-between font-bold text-xl mb-6 text-[#ff00ff]">
                    <span>TOTAL_MEMORY</span>
                    <span>CR {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 bg-[#00ffcc] text-black font-bold uppercase tracking-widest hover:bg-[#00ffcc]/80 shadow-[0_0_15px_#00ffcc]">
                    PROCESS_TRANSACTION
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
  // RENDER: MINIMALIST (BAUHAUS)
  // ==========================================
  else if (layoutStyle === "minimalist") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-black text-white' : 'bg-white text-black'} font-sans overflow-x-hidden\`}>
        
        <header className="px-12 py-12 flex justify-between items-start">
          <div className="w-1/2">
            <h1 className="text-4xl md:text-6xl font-semibold tracking-tighter leading-none mb-4">{tenant.name}</h1>
            <p className="text-lg md:text-2xl font-light opacity-60 max-w-md">{aboutText || "Less is more."}</p>
          </div>
          <div className="text-right">
            <button onClick={() => setIsCartOpen(true)} className="text-xl md:text-2xl font-light hover:opacity-50 transition-opacity">
              Cart ({cart.items.length})
            </button>
          </div>
        </header>

        {tenant.backgroundImageUrl && (
          <section className="px-12 mb-32">
            <div className="w-full h-[50vh] bg-black/5 overflow-hidden">
              <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-1000" />
            </div>
          </section>
        )}

        <section className="px-12 pb-32">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-32 gap-x-12">
            {products.map(product => (
              <div key={product.id} className="flex flex-col group">
                <div className="aspect-[4/5] bg-black/5 mb-8 overflow-hidden relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} className="w-full h-full object-cover mix-blend-multiply group-hover:scale-110 transition-transform duration-700" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center opacity-10"><Coffee size={40} /></div>
                  )}
                </div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-medium">{product.name}</h3>
                  <span className="text-lg opacity-60">Rp {Number(product.price).toLocaleString("id-ID")}</span>
                </div>
                <p className="text-sm font-light opacity-60 mb-8 flex-1">{product.description}</p>
                <button onClick={() => handleAddToCart(product)} className="self-start text-sm uppercase tracking-widest font-semibold border-b border-current pb-1 hover:opacity-50 transition-opacity">
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        </section>

        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-white/80 backdrop-blur-md" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-xl h-full \${isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-black'} p-12 flex flex-col shadow-2xl\`}>
              <div className="flex justify-between items-start mb-16">
                <h2 className="text-4xl font-light">Cart</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-xl font-light hover:opacity-50">Close</button>
              </div>
              <div className="flex-1 overflow-auto space-y-12">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-8 items-center">
                    <img src={item.imageUrl} className="w-24 h-32 object-cover bg-black/5" />
                    <div className="flex-1">
                      <h4 className="text-2xl font-medium mb-2">{item.name}</h4>
                      <p className="text-lg opacity-60 mb-6">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-6 text-xl font-light">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="hover:opacity-50">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="hover:opacity-50">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                  <div className="pt-12 border-t border-black/10 space-y-8">
                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b border-current pb-4 text-xl outline-none placeholder-current/30 font-light" />
                    <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b border-current pb-4 text-xl outline-none placeholder-current/30 font-light" />
                    <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b border-current pb-4 text-xl outline-none placeholder-current/30 font-light h-32" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-12 mt-8">
                  <div className="flex justify-between text-2xl font-medium mb-12">
                    <span>Total</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-6 \${isDark ? 'bg-white text-black' : 'bg-black text-white'} text-xl font-medium hover:opacity-80 transition-opacity\`}>
                    Checkout
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
  // RENDER: MAGAZINE (MULTI-COLUMN)
  // ==========================================
  else if (layoutStyle === "magazine") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-zinc-900 text-zinc-100' : 'bg-zinc-50 text-zinc-900'} font-serif overflow-x-hidden\`}>
        <header className="border-b-4 border-current p-6 flex flex-col md:flex-row justify-between items-end gap-6 sticky top-0 bg-inherit z-50">
          <div>
            <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter leading-none">{tenant.name}</h1>
            <p className="text-xl md:text-2xl italic opacity-70 mt-2 font-sans">The Coffee Issue</p>
          </div>
          <button onClick={() => setIsCartOpen(true)} className="text-2xl font-bold uppercase border-b-2 border-current pb-1 hover:text-red-600 transition-colors">
            Bag ({cart.items.length})
          </button>
        </header>

        <main className="p-6 max-w-[1800px] mx-auto">
          <section className="mb-20 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-8">
              {tenant.backgroundImageUrl ? (
                <div className="w-full aspect-video bg-black overflow-hidden group">
                  <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" />
                </div>
              ) : (
                <div className="w-full aspect-video bg-zinc-200 flex items-center justify-center">IMAGE PLACEHOLDER</div>
              )}
            </div>
            <div className="lg:col-span-4 flex flex-col">
              <h2 className="text-5xl font-bold uppercase mb-6 border-b-2 border-current pb-4">Story</h2>
              <p className="text-xl leading-relaxed columns-1 md:columns-2 lg:columns-1 gap-8 text-justify first-letter:text-7xl first-letter:float-left first-letter:mr-3 first-letter:font-black">
                {aboutText || "In this issue, we explore the intricate flavors of our latest harvest. Carefully curated for the discerning palate."}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-5xl font-bold uppercase mb-12 border-b-2 border-current pb-4">Collection</h2>
            <div className="columns-1 md:columns-2 xl:columns-3 gap-8 space-y-8">
              {products.map((product, i) => (
                <div key={product.id} className="break-inside-avoid border border-current p-4 group hover:bg-zinc-100 hover:text-black transition-colors">
                  <div className="w-full aspect-[3/4] mb-4 bg-zinc-200 overflow-hidden">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    ) : (
                      <Coffee className="w-full h-full p-12 opacity-10" />
                    )}
                  </div>
                  <h3 className="text-3xl font-bold uppercase mb-2 leading-tight">{product.name}</h3>
                  <p className="text-2xl italic opacity-80 mb-4">Rp {Number(product.price).toLocaleString("id-ID")}</p>
                  <p className="text-lg mb-8 font-sans font-light leading-relaxed">{product.description}</p>
                  <button onClick={() => handleAddToCart(product)} className="w-full py-3 bg-transparent border-2 border-current text-xl font-bold uppercase hover:bg-current hover:text-zinc-50 transition-colors">
                    Purchase
                  </button>
                </div>
              ))}
            </div>
          </section>
        </main>
        
        {/* Cart Drawer for Magazine... reuse standard simple drawer */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/80" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-md h-full \${isDark ? 'bg-zinc-900 text-white' : 'bg-zinc-50 text-black'} p-8 flex flex-col font-sans\`}>
               <div className="flex justify-between items-center mb-8 border-b-4 border-current pb-4 font-serif">
                <h2 className="text-4xl font-black uppercase">Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="text-xl font-bold hover:opacity-50">X</button>
              </div>
              <div className="flex-1 overflow-auto space-y-6">
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-4 items-center">
                    <img src={item.imageUrl} className="w-20 h-24 object-cover grayscale" />
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-lg">{item.name}</h4>
                      <p className="opacity-60 mb-2">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-4">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="font-bold">-</button>
                        <span>{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="font-bold">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                   <div className="pt-8 border-t-2 border-current space-y-4">
                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-2 outline-none font-bold uppercase" />
                    <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-2 outline-none font-bold uppercase" />
                    <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border-b-2 border-current pb-2 outline-none font-bold uppercase h-24" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-8 border-t-4 border-current mt-4">
                  <div className="flex justify-between font-black text-2xl mb-6 font-serif">
                    <span>TOTAL</span>
                    <span>Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-4 bg-current text-zinc-50 font-black uppercase text-xl hover:opacity-80">
                    Checkout
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
  // RENDER: ORGANIC (EARTHY CURVES)
  // ==========================================
  else if (layoutStyle === "organic") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#2a3026] text-[#e8e6e1]' : 'bg-[#F2EFE9] text-[#3A4035]'} font-sans overflow-x-hidden selection:bg-[#B3A394] selection:text-white\`}>
        <header className="px-8 py-6 flex items-center justify-between z-50 relative">
          <div className={\`flex items-center gap-3 \${isDark ? 'bg-[#3A4035]' : 'bg-white'} px-6 py-3 rounded-full shadow-sm\`}>
             {tenant.logoUrl ? <img src={tenant.logoUrl} className="w-8 h-8 rounded-full" /> : <Coffee size={24} />}
             <h1 className="text-xl font-bold tracking-tight">{tenant.name}</h1>
          </div>
          <button onClick={() => setIsCartOpen(true)} className={\`\${isDark ? 'bg-[#3A4035]' : 'bg-white'} px-6 py-3 rounded-full shadow-sm font-bold flex items-center gap-2 hover:scale-105 transition-transform\`}>
            Bag <span className="bg-[#B3A394] text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">{cart.items.length}</span>
          </button>
        </header>

        <section className="px-8 pt-12 pb-24 max-w-5xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-5xl md:text-7xl font-semibold mb-6 tracking-tight text-balance leading-tight">{tenant.heroText || "Naturally Grown, Masterfully Roasted."}</h2>
          <p className="text-lg md:text-xl opacity-70 max-w-2xl text-balance mb-12">{aboutText}</p>
          
          {tenant.backgroundImageUrl && (
            <div className="w-full aspect-[21/9] rounded-[4rem] overflow-hidden shadow-xl mb-12 relative">
              <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#B3A394] mix-blend-overlay opacity-40"></div>
            </div>
          )}
        </section>

        <section className="px-8 pb-32 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {products.map(product => (
              <div key={product.id} className={\`\${isDark ? 'bg-[#3A4035]' : 'bg-white'} p-4 rounded-[3rem] shadow-sm flex flex-col group\`}>
                <div className="w-full aspect-[4/3] rounded-[2.5rem] overflow-hidden bg-black/5 mb-6 relative">
                   {product.imageUrl ? (
                     <img src={product.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                   ) : (
                     <Coffee className="w-full h-full p-16 opacity-10" />
                   )}
                   <div className="absolute top-4 right-4 bg-white/90 text-black px-4 py-2 rounded-full font-bold shadow-sm backdrop-blur-md">
                     Rp {Number(product.price).toLocaleString("id-ID")}
                   </div>
                </div>
                <div className="px-4 pb-4 flex flex-col flex-1">
                  <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                  <p className="opacity-60 mb-6 flex-1 text-sm leading-relaxed">{product.description}</p>
                  <button onClick={() => handleAddToCart(product)} className={\`w-full py-4 rounded-full font-bold \${isDark ? 'bg-[#e8e6e1] text-[#2a3026]' : 'bg-[#3A4035] text-white'} hover:opacity-80 transition-opacity flex items-center justify-center gap-2\`}>
                    <Plus size={18} /> Add to Bag
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        
        {/* Cart Drawer for Organic */}
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end p-4">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-md h-full \${isDark ? 'bg-[#2a3026]' : 'bg-[#F2EFE9]'} rounded-[3rem] shadow-2xl flex flex-col p-8 overflow-hidden\`}>
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold">Your Bag</h2>
                <button onClick={() => setIsCartOpen(false)} className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center hover:bg-black/10">X</button>
              </div>
              <div className="flex-1 overflow-auto space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className={\`flex gap-4 p-3 rounded-[2rem] \${isDark ? 'bg-[#3A4035]' : 'bg-white'}\`}>
                    <img src={item.imageUrl} className="w-24 h-24 rounded-[1.5rem] object-cover bg-black/5" />
                    <div className="flex-1 py-2 pr-2">
                      <h4 className="font-bold">{item.name}</h4>
                      <p className="opacity-60 text-sm mb-2">Rp {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-4 bg-black/5 w-max rounded-full px-1">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="w-6 h-6 rounded-full bg-white text-black font-bold m-1 shadow-sm">-</button>
                        <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="w-6 h-6 rounded-full bg-white text-black font-bold m-1 shadow-sm">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                  <div className={\`mt-8 p-6 rounded-[2rem] \${isDark ? 'bg-[#3A4035]' : 'bg-white'} space-y-4\`}>
                    <h3 className="font-bold mb-2">Shipping</h3>
                    <input type="text" placeholder="Name" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-black/5 rounded-2xl p-4 outline-none focus:ring-2 ring-[#B3A394]" />
                    <input type="text" placeholder="WhatsApp" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-black/5 rounded-2xl p-4 outline-none focus:ring-2 ring-[#B3A394]" />
                    <textarea placeholder="Address" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-black/5 rounded-2xl p-4 outline-none focus:ring-2 ring-[#B3A394] h-24" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-6 mt-4">
                  <div className="flex justify-between items-center mb-6">
                    <span className="opacity-60 font-medium">Total</span>
                    <span className="text-3xl font-bold">Rp {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className="w-full py-5 rounded-full bg-[#B3A394] text-white font-bold text-lg hover:opacity-90 shadow-lg">
                    Complete Order
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
  // RENDER: INDUSTRIAL (BLUEPRINT)
  // ==========================================
  else if (layoutStyle === "industrial") {
    return (
      <div className={\`min-h-screen \${isDark ? 'bg-[#0f172a] text-[#38bdf8]' : 'bg-[#e2e8f0] text-[#334155]'} font-mono overflow-x-hidden relative\`}>
        <div className={\`fixed inset-0 pointer-events-none \${isDark ? 'bg-[linear-gradient(rgba(56,189,248,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(56,189,248,0.1)_1px,transparent_1px)]' : 'bg-[linear-gradient(rgba(51,65,85,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(51,65,85,0.1)_1px,transparent_1px)]'} bg-[size:20px_20px]\`}></div>
        
        <header className={\`border-b-2 \${isDark ? 'border-[#38bdf8]' : 'border-[#334155]'} p-4 flex justify-between items-center relative z-10 bg-inherit\`}>
          <div className="flex items-center gap-4">
            <h1 className="text-xl md:text-3xl font-bold uppercase tracking-tight">[ {tenant.name} ]</h1>
            <span className="text-xs uppercase border px-2 py-1 hidden md:block">SYS_ON</span>
          </div>
          <button onClick={() => setIsCartOpen(true)} className={\`border-2 \${isDark ? 'border-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#0f172a]' : 'border-[#334155] hover:bg-[#334155] hover:text-[#e2e8f0]'} px-6 py-2 uppercase font-bold text-sm transition-colors\`}>
            CART_({cart.items.length})
          </button>
        </header>

        <section className="p-8 max-w-5xl mx-auto relative z-10">
          <div className={\`border-2 \${isDark ? 'border-[#38bdf8]' : 'border-[#334155]'} p-8 mb-12 flex flex-col md:flex-row gap-8 items-center bg-inherit shadow-[8px_8px_0_0_currentColor]\`}>
            {tenant.backgroundImageUrl && (
              <div className="w-full md:w-1/2 aspect-video border border-current p-2">
                <img src={tenant.backgroundImageUrl} className="w-full h-full object-cover grayscale contrast-150 mix-blend-hard-light" />
              </div>
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold uppercase mb-4 border-b border-current pb-2">_SPECIFICATION</h2>
              <p className="text-sm leading-relaxed uppercase opacity-80">{aboutText || "High performance materials. Precision roasting protocols active."}</p>
            </div>
          </div>

          <h3 className="text-xl font-bold uppercase mb-6">&gt; INVENTORY_MATRIX</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {products.map(product => (
              <div key={product.id} className={\`border-2 \${isDark ? 'border-[#38bdf8]' : 'border-[#334155]'} flex flex-col bg-inherit hover:shadow-[4px_4px_0_0_currentColor] transition-all group\`}>
                <div className="border-b-2 border-current aspect-square p-2 relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-8 h-8 border-b border-r border-current pointer-events-none"></div>
                   <div className="absolute bottom-0 right-0 w-8 h-8 border-t border-l border-current pointer-events-none"></div>
                   {product.imageUrl ? (
                     <img src={product.imageUrl} className="w-full h-full object-cover grayscale contrast-200 opacity-70 group-hover:opacity-100 mix-blend-luminosity" />
                   ) : (
                     <Package className="w-full h-full p-8 opacity-20" />
                   )}
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h4 className="font-bold uppercase text-sm truncate mb-1">{product.name}</h4>
                  <p className="text-xs opacity-60 mb-4 line-clamp-2">{product.description}</p>
                  <div className="mt-auto">
                    <p className="font-bold mb-2 text-sm">IDR {Number(product.price).toLocaleString("id-ID")}</p>
                    <button onClick={() => handleAddToCart(product)} className={\`w-full py-2 border border-current uppercase text-xs font-bold \${isDark ? 'hover:bg-[#38bdf8] hover:text-[#0f172a]' : 'hover:bg-[#334155] hover:text-[#e2e8f0]'} transition-colors\`}>
                      ADD_
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsCartOpen(false)}></div>
            <div className={\`relative w-full max-w-md h-full \${isDark ? 'bg-[#0f172a] text-[#38bdf8]' : 'bg-[#e2e8f0] text-[#334155]'} border-l-4 border-current p-6 flex flex-col\`}>
              <div className="flex justify-between items-center border-b-2 border-current pb-4 mb-6">
                <h2 className="text-xl font-bold uppercase">BUFFER_ZONE</h2>
                <button onClick={() => setIsCartOpen(false)} className="uppercase border px-2 text-xs hover:bg-current hover:text-white transition-colors">X</button>
              </div>
              <div className="flex-1 overflow-auto space-y-4">
                {cart.items.map(item => (
                  <div key={item.id} className="border-2 border-current p-3 flex gap-4">
                    <img src={item.imageUrl} className="w-16 h-16 border border-current grayscale contrast-150" />
                    <div className="flex-1">
                      <h4 className="font-bold uppercase text-sm">{item.name}</h4>
                      <p className="text-xs opacity-80 mb-2">IDR {item.price.toLocaleString("id-ID")}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={() => cart.updateQuantity(item.id, -1)} className="w-6 h-6 border border-current hover:bg-current hover:text-white flex items-center justify-center">-</button>
                        <span className="w-6 text-center font-bold text-sm">{item.quantity}</span>
                        <button onClick={() => cart.updateQuantity(item.id, 1)} className="w-6 h-6 border border-current hover:bg-current hover:text-white flex items-center justify-center">+</button>
                      </div>
                    </div>
                  </div>
                ))}
                {cart.items.length > 0 && (
                  <div className="mt-6 border-2 border-current p-4 space-y-3">
                    <h3 className="font-bold uppercase text-sm mb-2">&gt; REQ_PARAMS</h3>
                    <input type="text" placeholder="ID_NAME" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-transparent border border-current p-2 outline-none uppercase text-xs" />
                    <input type="text" placeholder="COM_NODE" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-transparent border border-current p-2 outline-none uppercase text-xs" />
                    <textarea placeholder="LOC_VECTOR" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} className="w-full bg-transparent border border-current p-2 outline-none uppercase text-xs h-20" />
                  </div>
                )}
              </div>
              {cart.items.length > 0 && (
                <div className="pt-6 border-t-2 border-current mt-4">
                  <div className="flex justify-between font-bold text-lg mb-4 uppercase">
                    <span>TOT_VAL</span>
                    <span>IDR {cart.getTotalPrice().toLocaleString("id-ID")}</span>
                  </div>
                  <button onClick={handleCheckout} className={\`w-full py-4 border-2 border-current font-bold uppercase tracking-widest \${isDark ? 'bg-[#38bdf8] text-[#0f172a] hover:bg-transparent hover:text-[#38bdf8]' : 'bg-[#334155] text-[#e2e8f0] hover:bg-transparent hover:text-[#334155]'} transition-colors\`}>
                    INIT_CHECKOUT
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
  // RENDER: MODERN (APPLE / AWWWARDS) - FALLBACK
  // ==========================================
  else {`;

if (regex.test(content)) {
  content = content.replace(regex, newLayouts);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Stitched 6 new layouts successfully!");
} else {
  console.error("Could not match the regex");
}
