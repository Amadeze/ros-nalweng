"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Coffee,
  Database,
  Factory,
  FileText,
  Flame,
  LayoutDashboard,
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
      { label: "Audit & Integrasi", href: "/audit", icon: ScrollText },
      { label: "Pengaturan", href: "/settings", icon: Settings },
      { label: "Billing & Plan", href: "/billing", icon: FileText },
    ],
  },
];

function canAccess(href: string, userRole: string, subscriptionTier: PlanTier) {
  if (href === "/laporan" && !planHasFeature(subscriptionTier, "ADVANCED_REPORTS")) return false;
  if (userRole === "OWNER") return true;
  if (userRole === "MANAGER") return !["/settings", "/billing"].includes(href);
  if (userRole === "OPERATOR") return ["/dashboard", "/inventory", "/roasting", "/produksi"].includes(href);
  if (userRole === "CASHIER") return ["/dashboard", "/penjualan", "/master-data"].includes(href);
  return false;
}

export function Sidebar({
  userRole,
  subscriptionTier,
}: {
  userRole: string;
  subscriptionTier: PlanTier;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const visibleSections = NAV_SECTIONS.map((section) => ({
    ...section,
    items: section.items.filter((item) => canAccess(item.href, userRole, subscriptionTier)),
  })).filter((section) => section.items.length > 0);

  return (
    <aside className="flex h-full w-[244px] shrink-0 flex-col border-r border-stone-200 bg-white text-stone-900">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-stone-200 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-900 text-amber-300">
          <Coffee className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold tracking-tight">Roastery OS</p>
          <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wider text-stone-400">
            {PLAN_CATALOG[subscriptionTier].label} plan
          </p>
        </div>
      </div>

      <nav className="custom-scrollbar flex-1 overflow-y-auto px-3 py-4" aria-label="Navigasi aplikasi">
        {visibleSections.map((section, sectionIndex) => (
          <div key={section.label} className={cn(sectionIndex > 0 && "mt-5")}>
            <p className="mb-1.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-stone-400">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-stone-900 text-white"
                        : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
                    )}
                  >
                    <Icon className={cn("h-[18px] w-[18px] shrink-0", active ? "text-amber-300" : "text-stone-400")} aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-stone-200 p-3">
        <form action={logoutAction}>
          <button type="submit" className="flex min-h-10 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-red-50 hover:text-red-700">
            <LogOut className="h-[18px] w-[18px]" aria-hidden="true" />
            Keluar
          </button>
        </form>
        <p className="px-3 pt-2 text-[10px] text-stone-400">ROS · v1.0.0</p>
      </div>
    </aside>
  );
}
