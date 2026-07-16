"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Coffee, Package, Plus, Phone, EnvelopeSimple, At, X, ShoppingBag } from "@phosphor-icons/react";
import { ThemeProps } from "./ThemeProps";

// =============================================================================
// UNIVERSAL PREMIUM THEME
// =============================================================================
// This is a SINGLE component that renders completely differently
// based on CSS custom properties injected by ThemeEngine.
// No hardcoded colors, no hardcoded fonts, no hardcoded shadows.
// Everything reads from --t-* variables.
// =============================================================================

import { ThemeRouter } from "./ThemeRouter";

export function UniversalTheme({
  tenant, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
  customerAddress, setCustomerAddress, shippingMethod, setShippingMethod, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
  catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, iconStroke, isDark
}: ThemeProps) {

  const products = tenant.products || [];
  const cartItems = cart.items[tenant.subdomain || ""] || [];

  const themeProps = {
    tenant, products, cart, isCartOpen, setIsCartOpen, customerName, setCustomerName, customerPhone, setCustomerPhone,
    customerAddress, setCustomerAddress, shippingMethod, setShippingMethod, handleAddToCart, handleCheckout, mounted, heroGreeting, aboutText,
    catalogTitle, catalogSubtitle, footerText, waLink, emailLink, igLink, iconProps, iconStroke, isDark
  };

  return (
    <div className="relative w-full min-h-screen">
      
      {/* ═══ THEME MATRIX RENDERER ═══ */}
      {/* Ini akan memuat salah satu dari 10 tema eksklusif berdasarkan tenant.layoutStyle */}
      <ThemeRouter {...themeProps} />

      {/* ═══ MOBILE FLOATING CART BUTTON ═══ */}
      {!isCartOpen && (
        <button 
          onClick={() => setIsCartOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-[90] w-14 h-14 bg-black text-white rounded-full shadow-2xl flex items-center justify-center border-2 border-white hover:scale-105 active:scale-95 transition-all"
        >
          <ShoppingBag size={24} weight="bold" />
          {cartItems.length > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
              {cartItems.length}
            </span>
          )}
        </button>
      )}

      {/* ═══ GLOBAL CART DRAWER ═══ */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-md"
              onClick={() => setIsCartOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative w-full max-w-md h-full flex flex-col overflow-hidden bg-white text-black shadow-2xl"
            >
              {/* Cart Header */}
              <div className="p-5 md:p-6 flex justify-between items-center flex-shrink-0 border-b border-gray-200">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Your Cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:bg-gray-100 text-gray-500"
                >
                  <X size={16} weight="bold" />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-auto p-5 md:p-6 space-y-5">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 text-gray-400">
                    <Package size={48} className="mx-auto mb-4 opacity-30" />
                    <p className="text-sm font-medium">Your cart is empty</p>
                  </div>
                ) : (
                  cartItems.map((item: any) => (
                    <motion.div
                      layout
                      key={item.id}
                      className="flex gap-4 items-center"
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border border-gray-100 bg-gray-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} className="w-full h-full object-cover" alt={item.name} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Coffee size={24} />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-semibold line-clamp-1 mb-1 text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-xs mb-2 text-gray-500">
                          Rp {item.price.toLocaleString("id-ID")}
                        </p>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => cart.updateQuantity(tenant.subdomain, item.id, -1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors border border-gray-200 hover:bg-gray-100 text-gray-700"
                          >
                            −
                          </button>
                          <span className="text-sm font-bold w-5 text-center text-gray-900">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => cart.updateQuantity(tenant.subdomain, item.id, 1)}
                            className="w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-colors border border-gray-200 hover:bg-gray-100 text-gray-700"
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-gray-900">
                          Rp {(item.price * item.quantity).toLocaleString("id-ID")}
                        </p>
                        <button
                          onClick={() => cart.removeItem(tenant.subdomain, item.id)}
                          className="text-xs mt-1 font-semibold text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Checkout Form */}
                {cartItems.length > 0 && (
                  <div className="pt-6 space-y-4 border-t border-gray-100 mt-6">
                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">
                      Shipping Details
                    </h3>
                    <input 
                      value={customerName} 
                      onChange={e => setCustomerName(e.target.value)} 
                      placeholder="Full Name" 
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                    <input 
                      value={customerPhone} 
                      onChange={e => setCustomerPhone(e.target.value)} 
                      placeholder="WhatsApp Number" 
                      type="tel"
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />
                    <textarea 
                      value={customerAddress} 
                      onChange={e => setCustomerAddress(e.target.value)} 
                      placeholder="Alamat Lengkap (Jalan, Kec, Kota, Kode Pos)" 
                      rows={3}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors"
                    />

                    <div className="mb-4 mt-2">
                      <label className="block text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">Metode Pengiriman</label>
                      <select 
                        value={shippingMethod} 
                        onChange={e => setShippingMethod(e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors bg-white"
                      >
                        <option value="LOCAL_DELIVERY">Dalam Kota - Kurir Lokal (Lalamove / Gojek)</option>
                        <option value="STORE_COURIER">Dalam Kota - Kurir Pribadi Toko</option>
                        <option value="COURIER">Luar Kota - Ekspedisi (JNE/J&T/Sicepat)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              {cartItems.length > 0 && (
                <div className="p-5 md:p-6 flex-shrink-0 border-t border-gray-200 bg-gray-50">
                  <div className="flex justify-between items-center mb-5">
                    <span className="text-sm text-gray-500 font-medium">Total</span>
                    <span className="text-2xl font-black text-gray-900">
                      Rp {cart.getTotalPrice(tenant.subdomain).toLocaleString("id-ID")}
                    </span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    className="w-full py-4 rounded-xl font-bold text-base transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 bg-black text-white hover:bg-gray-800 shadow-lg"
                  >
                    <Phone size={18} weight="bold" /> Checkout via WhatsApp
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
