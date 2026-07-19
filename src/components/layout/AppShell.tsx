"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Coffee } from "lucide-react";
import { usePathname } from "next/navigation";
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
    <div className="relative flex h-[100dvh] w-full overflow-hidden p-0 md:p-4 xl:p-6">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-white/20 backdrop-blur-sm md:hidden transition-all"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── MAIN CONTAINER ── */}
      <div className="mx-auto flex h-full w-full max-w-[1800px] overflow-hidden flex-col bg-[#fbfaf8] md:flex-row md:rounded-[1.75rem] md:border md:border-stone-200/80 md:shadow-2xl md:shadow-stone-300/30 md:ring-1 md:ring-white/70">

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
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-[#fbfaf8] md:bg-transparent">

          {/* MOBILE HEADER */}
          <div className="flex h-16 shrink-0 items-center gap-3 border-b border-stone-200/80 bg-[#fbfaf8]/90 px-4 backdrop-blur-xl md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-stone-200 bg-white/80 text-stone-800 shadow-sm active:scale-95 transition-all hover:bg-white"
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
            <div className="flex h-full w-full flex-col">{children}</div>
          </div>
        </main>
      </div>

    </div>
  );
}
