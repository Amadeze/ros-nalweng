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
        "group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300",
        active
          ? "bg-white/80 text-slate-900 shadow-md ring-1 ring-white/50 translate-x-1"
          : "text-slate-600 hover:bg-white/40 hover:text-slate-900 hover:translate-x-1"
      )}
    >
      <div className={cn(
        "flex items-center justify-center rounded-xl p-1.5 transition-all duration-300",
        active ? "bg-slate-900 text-white shadow-md" : "bg-white/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-800 group-hover:shadow-sm"
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
    <aside className="flex h-full w-64 shrink-0 flex-col rounded-[2rem] bg-white/30 backdrop-blur-2xl border border-white/60 text-slate-800 shadow-2xl md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none">
      {/* Brand */}
      <div className="flex h-20 items-center gap-3.5 px-6 pt-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-white shadow-xl shadow-slate-900/20 ring-1 ring-slate-800/50">
          <Coffee size={20} strokeWidth={2.5} />
        </div>
        <div className="leading-tight flex flex-col justify-center">
          <p className="text-[15px] font-black text-slate-900 tracking-tight">
            Nalweng
          </p>
          <p className="text-[9px] text-slate-500 tracking-[0.2em] uppercase font-bold mt-0.5">
            Roastery OS
          </p>
        </div>
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
            className="group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-white/40 hover:text-slate-900 hover:shadow-sm"
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
