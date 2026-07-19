"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Menu, Coffee, X } from "lucide-react";
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
    <div className="ros-workspace relative flex h-[100dvh] w-full overflow-hidden bg-stone-100">

      {/* ── MOBILE OVERLAY ── */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-stone-950/35 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ── MAIN CONTAINER ── */}
      <div className="flex h-full w-full overflow-hidden flex-col bg-stone-50 md:flex-row">

        {/* ── DESKTOP SIDEBAR ── */}
        {/* Hidden on mobile, shown on desktop */}
        <div className="hidden md:flex">
          <Sidebar userRole={userRole} subscriptionTier={subscriptionTier} />
        </div>

        {/* ── MOBILE SIDEBAR (drawer) ── */}
        <div
          className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 md:hidden ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-[-120%]"
          }`}
        >
          <div className="relative h-full">
            <Sidebar userRole={userRole} subscriptionTier={subscriptionTier} forceExpanded />
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-lg text-stone-500 hover:bg-stone-100 hover:text-stone-900"
              aria-label="Tutup menu"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* ── MAIN CONTENT AREA ── */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden bg-stone-50">

          {/* MOBILE HEADER */}
          <div className="flex h-14 shrink-0 items-center gap-3 border-b border-stone-200 bg-white px-4 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-700 transition-colors hover:bg-stone-50"
              aria-label="Buka menu"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <Coffee className="h-5 w-5 text-stone-800" />
              <span className="text-sm font-bold tracking-tight text-stone-800">Roastery OS</span>
            </div>
          </div>

          {/* CONTENT */}
          <div className="custom-scrollbar flex-1 overflow-auto">
            <div className="flex h-full w-full flex-col">{children}</div>
          </div>
        </main>
      </div>

    </div>
  );
}
