"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, X } from "lucide-react"; // Pastikan lucide-react ter-install
import { usePathname } from "next/navigation";

/**
 * AppShell — root shell untuk semua halaman autentikasi.
 * Sudah dilengkapi efek Glassmorphism & Mobile-Friendly (Off-canvas sidebar)
 */
export function AppShell({ children, userRole }: { children: React.ReactNode, userRole: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Tutup sidebar mobile secara otomatis jika rute (URL) berubah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex h-screen w-full overflow-hidden p-0 md:p-8 lg:p-12">
      
      {/* ── OVERLAY MOBILE ── */}
      {/* Muncul sebagai efek blur di belakang sidebar jika dibuka di HP */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm md:hidden transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── CONTAINER UTAMA (KACA BESAR UNTUK DESKTOP) ── */}
      <div className="flex h-full w-full overflow-hidden flex-col md:flex-row md:rounded-2xl md:border md:border-white/60 md:bg-white/30 md:shadow-2xl md:backdrop-blur-3xl md:ring-1 md:ring-white/50 transition-all duration-500 hover:shadow-slate-300/50">

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
      <main className="flex flex-1 flex-col overflow-hidden bg-white/30 backdrop-blur-2xl md:bg-transparent md:backdrop-blur-none md:border-none md:shadow-none">
        
        {/* HEADER KHUSUS MOBILE (Hanya tampil di layar kecil) */}
        <div className="flex shrink-0 items-center gap-3 border-b border-white/40 bg-white/40 px-4 py-4 backdrop-blur-xl md:hidden">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-slate-800 shadow-sm active:scale-95 transition-all hover:bg-white/80 hover:shadow-md"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center h-11 ml-1">
            <img src="/logo.png" alt="Nalweng Logo" className="h-full w-auto object-contain drop-shadow-sm" />
          </div>
        </div>

        {/* AREA KONTEN ANAK (DashboardShell, dll masuk ke sini) */}
        <div className="flex-1 overflow-auto custom-scrollbar">
          {children}
        </div>
      </main>
      </div>

    </div>
  );
}