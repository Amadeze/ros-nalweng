"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Coffee,
  Database,
  Factory,
  FileText,
  Flame,
  LayoutDashboard,
  Link2,
  LogOut,
  PackageSearch,
  ScrollText,
  Settings,
  ShoppingCart,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { cn } from "@/lib/utils";
import { PLAN_CATALOG, planHasFeature, type PlanTier } from "@/lib/plans";

type NavLink = {
  label: string;
  href: string;
  icon: React.ElementType;
};

type NavSection = {
  label: string;
  items: NavLink[];
};

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Utama",
    items: [{ label: "Dashboard", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Operasional",
    items: [
      { label: "Inventory", href: "/inventory", icon: PackageSearch },
      { label: "Roasting", href: "/roasting", icon: Flame },
      { label: "Roast Profiles", href: "/roasting/roasts", icon: BarChart3 },
      { label: "Produksi", href: "/produksi", icon: Factory },
    ],
  },
  {
    label: "Penjualan & keuangan",
    items: [
      { label: "Penjualan", href: "/penjualan", icon: ShoppingCart },
      { label: "Keuangan", href: "/keuangan", icon: BarChart3 },
      { label: "Laporan", href: "/laporan", icon: FileText },
    ],
  },
  {
    label: "Administrasi",
    items: [
      { label: "Data Master", href: "/master-data", icon: Database },
      { label: "Mesin Roasting", href: "/master-data/machines", icon: Flame },
      { label: "Audit & Integrasi", href: "/audit", icon: ScrollText },
      { label: "Integrasi Artisan", href: "/settings/integrations/artisan", icon: Link2 },
      { label: "Pengaturan", href: "/settings", icon: Settings },
      { label: "Billing & Plan", href: "/billing", icon: FileText },
    ],
  },
];

function canAccess(href: string, userRole: string, subscriptionTier: PlanTier) {
  if (href === "/laporan" && !planHasFeature(subscriptionTier, "ADVANCED_REPORTS")) return false;
  if (href === "/settings/integrations/artisan" && !planHasFeature(subscriptionTier, "ARTISAN")) return false;
  if (userRole === "OWNER") return true;
  if (userRole === "MANAGER") return !["/settings", "/billing"].includes(href);
  if (userRole === "OPERATOR") return ["/dashboard", "/inventory", "/roasting", "/roasting/roasts", "/produksi", "/master-data/machines"].includes(href);
  if (userRole === "CASHIER") return ["/dashboard", "/penjualan", "/master-data"].includes(href);
  return false;
}

export function Sidebar({
  userRole,
  subscriptionTier,
  forceExpanded,
}: {
  userRole: string;
  subscriptionTier: PlanTier;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const isCollapsed = forceExpanded ? false : collapsed;

  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccess(item.href, userRole, subscriptionTier)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col bg-[var(--glass-bg)] border-r border-[var(--glass-border)] shadow-[var(--glass-shadow)] transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isCollapsed ? "w-[76px]" : "w-[260px]",
      )}
    >
      {/* Premium Brand Area */}
      <div className={cn("flex shrink-0 items-center border-b border-[var(--glass-border)]/50", isCollapsed ? "justify-center py-5" : "gap-4 px-6 py-5")}>
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--amber-warm)] to-[var(--amber-deep)] shadow-lg shadow-[var(--amber-deep)]/20">
          <Coffee className="h-5 w-5 text-white" />
          <div className="absolute inset-0 rounded-2xl ring-1 ring-white/20" />
        </div>
        {!isCollapsed && (
          <div className="min-w-0 flex-1">
            <p className="truncate text-[15px] font-black tracking-tight text-[var(--text-primary)]">Roastery OS</p>
            <p className="mt-0.5 truncate text-[11px] font-bold uppercase tracking-widest text-[var(--amber-warm)]">
              {PLAN_CATALOG[subscriptionTier].label}
            </p>
          </div>
        )}
        {!forceExpanded && !isCollapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-bg-subtle)] text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--text-primary)] hover:shadow-sm transition-all"
            aria-label="Ciutkan sidebar"
          >
            <ChevronLeft size={16} />
          </button>
        )}
        {!forceExpanded && isCollapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="absolute -right-3.5 top-[32px] z-10 flex h-7 w-7 items-center justify-center rounded-full border border-[var(--glass-border)] bg-[var(--glass-bg-hover)] text-[var(--text-secondary)] shadow-md shadow-black/5 hover:text-[var(--text-primary)] hover:scale-105 transition-all"
            aria-label="Perluas sidebar"
          >
            <ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* Navigation Area */}
      <nav className="custom-scrollbar flex-1 overflow-y-auto py-6 px-3" aria-label="Navigasi aplikasi">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.label} className={cn(sectionIndex > 0 && "mt-6")}>
            {!isCollapsed && (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[var(--text-tertiary)]">
                {section.label}
              </p>
            )}
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={isCollapsed ? item.label : undefined}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "group relative flex items-center rounded-xl text-[14px] font-semibold transition-all duration-300",
                      isCollapsed ? "justify-center h-12 w-12 mx-auto" : "gap-3.5 h-11 px-3.5",
                      active
                        ? "text-[var(--amber-deep)] dark:text-[var(--amber-warm)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]",
                    )}
                  >
                    {active && (
                      <motion.div 
                        layoutId="active-nav"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-[var(--amber-warm)]/10 to-[var(--amber-deep)]/5 border border-[var(--amber-warm)]/20 shadow-sm"
                        initial={false}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                    
                    {!active && (
                      <div className="absolute inset-0 rounded-xl bg-[var(--glass-bg-hover)] opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}

                    <Icon
                      className={cn("relative z-10 h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110", active ? "text-[var(--amber-warm)]" : "text-[var(--text-tertiary)]")}
                      aria-hidden="true"
                    />
                    {!isCollapsed && <span className="relative z-10 truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Area */}
      <div className="shrink-0 border-t border-[var(--glass-border)]/50 p-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className={cn(
              "group flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-all hover:bg-red-500/10 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400",
              isCollapsed && "justify-center px-0 h-12 w-12 mx-auto",
            )}
            title={isCollapsed ? "Keluar" : undefined}
          >
            <LogOut className="h-5 w-5 shrink-0 transition-transform group-hover:-translate-x-1" aria-hidden="true" />
            {!isCollapsed && <span>Keluar</span>}
          </button>
        </form>
        {!isCollapsed && <p className="px-3.5 pt-3 text-[11px] font-medium text-[var(--text-tertiary)] text-center">ROS · v2.0</p>}
      </div>
    </aside>
  );
}
