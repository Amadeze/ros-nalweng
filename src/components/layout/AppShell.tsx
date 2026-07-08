"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, X } from "lucide-react"; // Pastikan lucide-react ter-install

/**
 * AppShell — root shell untuk semua halaman autentikasi.
 * Sudah dilengkapi efek Glassmorphism & Mobile-Friendly (Off-canvas sidebar)
 */
export function AppShell({ children, userRole }: { children: React.ReactNode, userRole: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="relative flex h-screen w-full overflow-hidden p-2 md:p-6 md:gap-6">
      
      {/* ── OVERLAY MOBILE ── */}
      {/* Muncul sebagai efek blur di belakang sidebar jika dibuka di HP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-md md:hidden transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── SIDEBAR CONTAINER ── */}
      {/* Di HP: Muncul dari kiri (slide). Di Desktop: Selalu tampil di kiri */}
      <div
        className={`fixed inset-y-2 left-2 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:inset-auto md:z-auto md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-[-120%]"
        }`}
      >
        <Sidebar userRole={userRole} />
      </div>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex flex-1 flex-col overflow-hidden rounded-[2rem] md:rounded-[2.5rem] border border-white/60 bg-white/30 shadow-2xl backdrop-blur-2xl ring-1 ring-white/50">
        
        {/* HEADER KHUSUS MOBILE (Hanya tampil di layar kecil) */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/40 bg-white/40 px-4 py-4 backdrop-blur-xl md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-slate-800 shadow-sm active:scale-95 transition-all hover:bg-white/80 hover:shadow-md"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-base font-black text-slate-900 tracking-tight">Nalweng</span>
            <span className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Roastery OS</span>
          </div>
        </div>

        {/* AREA KONTEN ANAK (DashboardShell, dll masuk ke sini) */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </div>
      </main>

    </div>
  );
}