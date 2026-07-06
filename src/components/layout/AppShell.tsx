"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, X } from "lucide-react"; // Pastikan lucide-react ter-install

/**
 * AppShell — root shell untuk semua halaman autentikasi.
 * Sudah dilengkapi efek Glassmorphism & Mobile-Friendly (Off-canvas sidebar)
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden p-2 md:p-4 md:gap-4">
      
      {/* ── OVERLAY MOBILE ── */}
      {/* Muncul sebagai efek blur di belakang sidebar jika dibuka di HP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR CONTAINER ── */}
      {/* Di HP: Muncul dari kiri (slide). Di Desktop: Selalu tampil di kiri */}
      <div
        className={`fixed inset-y-2 left-2 z-50 transition-transform duration-300 ease-in-out md:relative md:inset-auto md:z-auto md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-[-120%]"
        }`}
      >
        <Sidebar />
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      {/* Menggunakan efek glassmorphism (bg-white/40, backdrop-blur-xl) */}
      <main className="flex flex-1 flex-col overflow-hidden rounded-[1.5rem] md:rounded-[2rem] border border-white/60 bg-white/40 shadow-2xl backdrop-blur-xl">
        
        {/* HEADER KHUSUS MOBILE (Hanya tampil di layar kecil) */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/40 bg-white/30 px-4 py-3 backdrop-blur-md md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-slate-700 shadow-sm backdrop-blur-md active:scale-95 transition-transform"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-sm font-bold text-slate-800 tracking-tight">Nalweng</span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">Roastery OS</span>
          </div>
        </div>

        {/* AREA KONTEN ANAK (DashboardShell, dll masuk ke sini) */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>

    </div>
  );
}