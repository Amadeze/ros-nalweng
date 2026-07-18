"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Coffee } from "lucide-react";
import { usePathname } from "next/navigation";
import { PageTransition } from "./PageTransition";
import type { PlanTier } from "@/lib/plans";

/**
 * AppShell — root shell untuk semua halaman autentikasi.
 * Sidebar supports expanded/collapsed on desktop, drawer on mobile.
 */
export function AppShell({
  children,
  userRole,
  subscriptionTier,
}: {
  children: React.ReactNode;
  userRole: string;
  subscriptionTier: PlanTier;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Close mobile sidebar on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden p-0 md:p-8 lg:p-12">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm md:hidden transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── MAIN CONTAINER ── */}
      <div className="flex h-full w-full overflow-hidden flex-col md:flex-row md:rounded-2xl md:border md:border-white/60 md:bg-white/30 md:shadow-2xl md:backdrop-blur-xl md:ring-1 md:ring-white/50 transition-all duration-500 hover:shadow-slate-300/50">

        {/* ── DESKTOP SIDEBAR ── */}
        {/* Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex">
          <Sidebar userRole={userRole} subscriptionTier={subscriptionTier} />
        </div>

        {/* ── MOBILE SIDEBAR (drawer) ── */}
        <div
          className={`fixed inset-y-2 left-2 z-50 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-[-120%]"
          }`}
        >
          {/* On mobile, always show expanded sidebar */}
          <Sidebar userRole={userRole} subscriptionTier={subscriptionTier} forceExpanded />
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex flex-1 flex-col overflow-hidden bg-white/30 backdrop-blur-md md:bg-transparent md:backdrop-blur-none md:border-none md:shadow-none">

          {/* MOBILE HEADER */}
          <div className="flex shrink-0 items-center gap-3 border-b border-white/40 bg-white/40 px-4 py-4 backdrop-blur-xl md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/50 border border-white/60 text-slate-800 shadow-sm active:scale-95 transition-all hover:bg-white/80 hover:shadow-md"
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center ml-3 gap-2">
              <Coffee className="h-6 w-6 text-slate-800" />
              <span className="font-bold text-slate-800 tracking-tight">Roastery OS</span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 overflow-auto custom-scrollbar">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>

    </div>
  );
}
