"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  Flame,
  Factory,
  ShoppingCart,
  BarChart3,
  Coffee,
  Database,
  FileText,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

// ─────────────────────────────────────────────
// Menu definition
// ─────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",    icon: LayoutDashboard },
  { label: "Inventory",   href: "/inventory",    icon: PackageSearch   },
  { label: "Roasting",    href: "/roasting",     icon: Flame           },
  { label: "Produksi",    href: "/produksi",     icon: Factory         },
  { label: "Penjualan",   href: "/penjualan",    icon: ShoppingCart    },
  { label: "Keuangan",    href: "/keuangan",     icon: BarChart3       },
  { label: "Laporan P&L", href: "/laporan",      icon: FileText        },
  { label: "Data Master", href: "/master-data",  icon: Database        },
] as const;

// ─────────────────────────────────────────────
// NavItem
// ─────────────────────────────────────────────

function NavItem({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300",
        active
          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg shadow-blue-500/30 translate-x-1"
          : "text-slate-600 hover:bg-white/40 hover:text-slate-900 hover:translate-x-1 hover:scale-[1.02] active:scale-95"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-xl p-1.5 transition-all duration-300",
        active ? "text-white" : "bg-white/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-800 group-hover:shadow-sm"
      )}>
        <Icon size={18} />
      </div>
      <span className="truncate tracking-wide">{label}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────

export function Sidebar({ userRole }: { userRole: string }) {
  const pathname = usePathname();

  // Role-based access control for sidebar menus
  const filteredNavItems = NAV_ITEMS.filter((item) => {
    if (userRole === "OWNER" || userRole === "MANAGER") return true;
    if (userRole === "OPERATOR") {
      return ["/dashboard", "/inventory", "/roasting", "/produksi"].includes(item.href);
    }
    if (userRole === "CASHIER") {
      return ["/dashboard", "/penjualan", "/master-data"].includes(item.href);
    }
    return false;
  });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/60 text-slate-800 shadow-2xl md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none">
      {/* Brand */}
      <div className="flex h-24 items-center px-4 pt-6 mb-2 transition-transform duration-500 hover:scale-105">
        <img src="/logo.png" alt="Nalweng Logo" className="w-full h-auto max-w-[170px] object-contain" />
      </div>

      <div className="mx-6 h-px bg-white/40 my-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 custom-scrollbar">
        <p className="mb-3 px-2 text-[10px] font-black uppercase tracking-widest text-slate-500/80">
          Menu Utama
        </p>
        <div className="flex flex-col gap-1.5">
          {filteredNavItems.map((item) => (
            <NavItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname.startsWith(item.href)}
            />
          ))}
        </div>
      </nav>

      <div className="mx-6 h-px bg-white/40" />

      {/* Footer — logout */}
      <div className="px-4 py-5">
        <form action={logoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-white/40 hover:text-slate-900 hover:shadow-sm hover:scale-[1.02] active:scale-95"
          >
            <div className="flex items-center justify-center rounded-xl bg-white/50 p-1.5 text-slate-400 transition-all duration-300 group-hover:bg-rose-100 group-hover:text-rose-600 group-hover:shadow-sm">
              <LogOut size={18} />
            </div>
            <span className="tracking-wide">Keluar</span>
          </button>
        </form>
        <p className="mt-4 text-center text-[10px] font-bold tracking-wider text-slate-400/80 uppercase">ROS · v1.0.0</p>
      </div>
    </aside>
  );
}
