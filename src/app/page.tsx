"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { 
  BarChart3, 
  Box, 
  ChevronRight, 
  Coffee, 
  Flame, 
  Globe, 
  Landmark, 
  MenuIcon, 
  PackageCheck, 
  PieChart, 
  Receipt, 
  ShieldCheck, 
  Store, 
  Users 
} from "lucide-react";
import { ShaderBackground } from "@/components/ShaderBackground";

export default function LandingPage() {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const stagger = {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { staggerChildren: 0.2 }
  };

  return (
    <div className="bg-[#0b0c10] text-[#c5c6c7] font-sans antialiased min-h-screen flex flex-col relative overflow-x-hidden selection:bg-[#d4a373] selection:text-[#2d2218]">
      
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-[#0b0c10]/80 backdrop-blur-md border-b border-white/5">
        <div className="flex justify-between items-center h-20 px-6 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4a373] to-[#b38554] flex items-center justify-center">
              <Coffee className="w-5 h-5 text-[#2d2218]" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Roastery OS</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <a className="text-sm font-medium hover:text-[#d4a373] transition-colors" href="#features">Fitur Utama</a>
            <a className="text-sm font-medium hover:text-[#d4a373] transition-colors" href="#workflow">Alur Kerja</a>
            <a className="text-sm font-medium hover:text-[#d4a373] transition-colors" href="#pricing">Harga</a>
          </nav>
          <div className="hidden md:flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold hover:text-[#d4a373] transition-colors">Log in</Link>
            <Link href="/register" className="bg-[#d4a373] text-[#2d2218] px-6 py-2.5 rounded-full hover:bg-white transition-all font-bold shadow-[0_0_20px_rgba(212,163,115,0.3)]">
              Coba Gratis 14 Hari
            </Link>
          </div>
          <button className="md:hidden text-[#d4a373]">
            <MenuIcon className="w-8 h-8" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow z-10 relative pt-20">
        
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center px-6 overflow-hidden">
          <div className="absolute inset-0 w-full h-full z-0 opacity-40 mix-blend-screen">
            <ShaderBackground />
          </div>
          
          <div className="max-w-screen-xl mx-auto z-10 w-full text-center relative mt-12 md:mt-0">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="inline-flex items-center gap-3 px-4 py-2 rounded-full border border-[#d4a373]/30 bg-white/5 backdrop-blur-sm mx-auto mb-8"
            >
              <span className="w-2 h-2 rounded-full bg-[#d4a373] animate-pulse"></span>
              <span className="text-xs font-bold text-[#d4a373] tracking-widest uppercase">ERP Khusus Coffee Roastery</span>
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-5xl md:text-7xl font-extrabold text-white tracking-tight max-w-4xl mx-auto leading-tight"
            >
              Kelola Roastery Anda Seperti <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d4a373] to-[#e6ccb2]">Perusahaan Kelas Dunia.</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-lg md:text-xl text-[#c5c6c7] max-w-2xl mx-auto mt-6"
            >
              Tinggalkan pencatatan manual di Excel & kekacauan order via WhatsApp. 
              Satu platform terpusat untuk mengelola stok Green Bean, Roasting Log, hingga pesanan Wholesale otomatis.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
            >
              <Link href="/register" className="w-full sm:w-auto bg-[#d4a373] text-[#2d2218] px-8 py-4 rounded-full hover:bg-white transition-all font-bold text-lg flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,163,115,0.4)]">
                Mulai Gratis 14 Hari <ChevronRight className="w-5 h-5" />
              </Link>
              <button className="w-full sm:w-auto border border-white/20 bg-white/5 backdrop-blur-md text-white px-8 py-4 rounded-full hover:bg-white/10 transition-all font-semibold text-lg flex items-center justify-center gap-2">
                Jadwalkan Demo
              </button>
            </motion.div>

            {/* Dashboard Mockup Representation */}
            <motion.div 
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5, type: "spring" }}
              className="mt-20 relative mx-auto max-w-5xl"
            >
              <div className="absolute inset-0 bg-[#d4a373]/20 blur-[100px] rounded-[3rem]"></div>
              <div className="relative bg-[#1f2833]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 md:p-4 shadow-2xl overflow-hidden aspect-video">
                <div className="absolute top-0 left-0 w-full h-8 bg-black/40 flex items-center px-4 gap-2 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                </div>
                {/* Mockup Content */}
                <div className="w-full h-full mt-6 bg-[#0b0c10] rounded-lg border border-white/5 flex">
                  {/* Sidebar */}
                  <div className="w-48 hidden md:block border-r border-white/5 p-4 space-y-4">
                    <div className="h-4 w-24 bg-white/10 rounded mb-8"></div>
                    <div className="h-8 w-full bg-[#d4a373]/20 rounded-md"></div>
                    <div className="h-8 w-full bg-white/5 rounded-md"></div>
                    <div className="h-8 w-full bg-white/5 rounded-md"></div>
                    <div className="h-8 w-full bg-white/5 rounded-md"></div>
                  </div>
                  {/* Content */}
                  <div className="flex-1 p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <div className="h-6 w-32 bg-white/10 rounded"></div>
                      <div className="h-8 w-24 bg-[#d4a373] rounded-full"></div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                         <div className="h-3 w-16 bg-white/10 rounded"></div>
                         <div className="h-6 w-24 bg-white/20 rounded"></div>
                      </div>
                      <div className="h-24 bg-white/5 rounded-xl border border-white/5 p-4 flex flex-col justify-between">
                         <div className="h-3 w-20 bg-white/10 rounded"></div>
                         <div className="h-6 w-24 bg-white/20 rounded"></div>
                      </div>
                      <div className="h-24 bg-[#d4a373]/10 rounded-xl border border-[#d4a373]/20 p-4 flex flex-col justify-between">
                         <div className="h-3 w-24 bg-[#d4a373]/40 rounded"></div>
                         <div className="h-6 w-24 bg-[#d4a373] rounded"></div>
                      </div>
                    </div>
                    <div className="h-48 bg-white/5 rounded-xl border border-white/5"></div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* LOGOS / TRUSTED BY */}
        <section className="py-12 border-y border-white/5 bg-black/20">
          <div className="max-w-screen-xl mx-auto px-6 text-center">
            <p className="text-sm font-semibold text-white/40 uppercase tracking-widest mb-8">Dipercaya oleh Roastery Modern</p>
            <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 text-xl font-bold"><Coffee /> <span>Kopi Kenangan</span></div>
              <div className="flex items-center gap-2 text-xl font-bold"><Flame /> <span>RoastMaster</span></div>
              <div className="flex items-center gap-2 text-xl font-bold"><Store /> <span>Daily Brews</span></div>
              <div className="flex items-center gap-2 text-xl font-bold"><Globe /> <span>Origin Co.</span></div>
            </div>
          </div>
        </section>

        {/* FEATURES BENTO GRID */}
        <section id="features" className="py-32 px-6">
          <div className="max-w-screen-2xl mx-auto">
            <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Segala yang Anda Butuhkan untuk Skala Besar</h2>
              <p className="text-lg text-[#c5c6c7]">Dirancang secara spesifik untuk memecahkan masalah operasional yang rumit pada Coffee Roastery, sehingga Anda bisa fokus pada kualitas kopi.</p>
            </motion.div>
            
            <motion.div variants={stagger} initial="initial" whileInView="whileInView" className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[360px]">
              {/* Feature 1 - Green Bean */}
              <motion.div variants={fadeInUp} className="md:col-span-2 bg-gradient-to-br from-[#1f2833] to-[#0b0c10] border border-white/10 rounded-3xl p-10 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-[#d4a373]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#d4a373]/20 flex items-center justify-center mb-6">
                    <Box className="w-7 h-7 text-[#d4a373]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Manajemen Stok & HPP Akurat</h3>
                  <p className="text-[#c5c6c7] max-w-md">Lacak pergerakan Green Bean, hitung penyusutan otomatis saat roasting, dan dapatkan harga pokok produksi (HPP) yang akurat secara real-time.</p>
                </div>
                <div className="z-10 flex gap-3 mt-6">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">Traceability</span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">COGS Calculation</span>
                </div>
              </motion.div>
              
              {/* Feature 2 - B2B Portal */}
              <motion.div variants={fadeInUp} className="bg-gradient-to-br from-[#1f2833] to-[#0b0c10] border border-white/10 rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden">
                <div className="z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#d4a373]/20 flex items-center justify-center mb-6">
                    <Store className="w-7 h-7 text-[#d4a373]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Portal Wholesale (B2B)</h3>
                  <p className="text-[#c5c6c7]">Berikan akses portal pemesanan online khusus untuk tiap kedai kopi klien Anda. Bebas chat WhatsApp berulang.</p>
                </div>
              </motion.div>
              
              {/* Feature 3 - Finance */}
              <motion.div variants={fadeInUp} className="bg-gradient-to-br from-[#1f2833] to-[#0b0c10] border border-white/10 rounded-3xl p-10 flex flex-col justify-between group relative overflow-hidden">
                <div className="z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#d4a373]/20 flex items-center justify-center mb-6">
                    <Receipt className="w-7 h-7 text-[#d4a373]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Auto-Invoice & Payment Gateway</h3>
                  <p className="text-[#c5c6c7]">Cetak invoice otomatis. Pelanggan bayar via QRIS/Transfer Bank (Midtrans), dan status tagihan lunas secara otomatis.</p>
                </div>
              </motion.div>
              
              {/* Feature 4 - Analytics */}
              <motion.div variants={fadeInUp} className="md:col-span-2 bg-gradient-to-tr from-[#1f2833] to-[#0b0c10] border border-white/10 rounded-3xl p-10 flex flex-col justify-between group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-tr from-[#d4a373]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="z-10">
                  <div className="w-14 h-14 rounded-2xl bg-[#d4a373]/20 flex items-center justify-center mb-6">
                    <PieChart className="w-7 h-7 text-[#d4a373]" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-3">Laporan Laba Rugi (P&L) Cerdas</h3>
                  <p className="text-[#c5c6c7] max-w-md">Ketahui margin keuntungan bersih dari setiap kilogram kopi yang Anda jual. Laporan penjualan, pengeluaran, dan neraca dalam hitungan detik.</p>
                </div>
                <div className="z-10 flex gap-3 mt-6">
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">Margin Analysis</span>
                  <span className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-white uppercase tracking-wider">Accounting</span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* PRICING SECTION */}
        <section id="pricing" className="py-32 px-6 bg-black/40 relative z-10 border-t border-white/5">
          <div className="max-w-screen-xl mx-auto flex flex-col gap-16">
            <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Investasi yang Menghemat Ratusan Jam Kerja</h2>
              <p className="text-lg text-[#d4a373]">Gunakan sistem seharga ribuan dolar dengan biaya berlangganan ringan.</p>
            </motion.div>
            
            <div className="flex justify-center">
              {/* Pro Plan */}
              <motion.div variants={fadeInUp} initial="initial" whileInView="whileInView" className="bg-[#1f2833] rounded-3xl p-10 flex flex-col gap-8 border-2 border-[#d4a373]/50 relative shadow-[0_20px_50px_rgba(212,163,115,0.15)] max-w-md w-full">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#d4a373] text-[#2d2218] text-xs font-bold px-6 py-2 rounded-full uppercase tracking-widest shadow-lg">Paket Lengkap</div>
                
                <div className="text-center mt-4">
                  <h3 className="text-2xl font-bold text-white">Roastery OS Pro</h3>
                  <p className="text-[#c5c6c7] mt-2 text-sm">Sistem komplit dari gudang hingga penjualan B2B.</p>
                </div>
                
                <div className="flex items-baseline justify-center gap-2">
                  <span className="text-5xl font-extrabold text-white">Rp 299<span className="text-2xl">rb</span></span>
                  <span className="text-[#c5c6c7]">/ bulan</span>
                </div>
                
                <div className="w-full h-px bg-white/10 my-2"></div>
                
                <ul className="flex flex-col gap-4 text-[#c5c6c7]">
                  <li className="flex items-center gap-3"><ShieldCheck className="text-[#d4a373] w-5 h-5 flex-shrink-0" /> Stok Green Bean & Kemasan Real-time</li>
                  <li className="flex items-center gap-3"><ShieldCheck className="text-[#d4a373] w-5 h-5 flex-shrink-0" /> Roasting Log & Kalkulasi HPP</li>
                  <li className="flex items-center gap-3"><ShieldCheck className="text-[#d4a373] w-5 h-5 flex-shrink-0" /> B2B Portal Custom untuk Pelanggan</li>
                  <li className="flex items-center gap-3"><ShieldCheck className="text-[#d4a373] w-5 h-5 flex-shrink-0" /> Integrasi Payment Gateway (Midtrans)</li>
                  <li className="flex items-center gap-3"><ShieldCheck className="text-[#d4a373] w-5 h-5 flex-shrink-0" /> Laporan Laba Rugi Otomatis</li>
                </ul>
                
                <div className="mt-8">
                  <Link href="/register" className="w-full bg-[#d4a373] text-[#2d2218] py-4 rounded-full hover:bg-white transition-all font-bold block text-center shadow-[0_4px_20px_rgba(212,163,115,0.3)]">Mulai 14 Hari Free Trial</Link>
                  <p className="text-center text-xs text-[#c5c6c7] mt-4">Tanpa perlu kartu kredit untuk mendaftar.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-16 bg-[#0b0c10] border-t border-white/5 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 px-6 max-w-screen-2xl mx-auto">
          <div className="flex flex-col gap-6 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#d4a373] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#2d2218]" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Roastery OS</span>
            </div>
            <p className="text-[#c5c6c7] max-w-sm">
              Sistem operasi generasi baru untuk mengelola bisnis specialty coffee roastery Anda menjadi lebih efisien dan terukur.
            </p>
            <p className="text-xs text-[#c5c6c7]/50 mt-4">
              © {new Date().getFullYear()} Roastery OS by Beanslab. All rights reserved.
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="font-bold text-white uppercase tracking-wider text-sm mb-2">Platform</span>
            <a className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="#features">Fitur</a>
            <a className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="#pricing">Harga</a>
            <Link className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="/login">Login</Link>
          </div>
          
          <div className="flex flex-col gap-4">
            <span className="font-bold text-white uppercase tracking-wider text-sm mb-2">Legal</span>
            <a className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="#">Privasi</a>
            <a className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="#">Syarat & Ketentuan</a>
            <a className="text-[#c5c6c7] hover:text-[#d4a373] transition-colors text-sm" href="#">Hubungi Kami</a>
          </div>
        </div>
      </footer>
    </div>
  );
}