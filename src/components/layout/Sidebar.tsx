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
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
        active
          ? "bg-white/10 text-white shadow-sm"
          : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
      )}
    >
      <Icon
        size={18}
        className={cn(
          "shrink-0 transition-colors",
          active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
        )}
      />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ─────────────────────────────────────────────
// Sidebar
// ─────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col rounded-[2rem] bg-[#0f2b38] text-slate-300 shadow-2xl">
      {/* Brand */}
      <div className="flex h-16 items-center gap-2.5 px-5 pt-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
          <Coffee size={16} className="text-white" />
        </div>
        <div className="leading-tight">
          <p className="text-[13px] font-semibold text-white tracking-tight">
            Nalweng
          </p>
          <p className="text-[11px] text-slate-500 tracking-wide uppercase">
            Roastery OS
          </p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/10" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
          Menu Utama
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <NavItem
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname.startsWith(item.href)}
              />
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-4 h-px bg-white/10" />

      {/* Footer — logout */}
      <div className="px-3 py-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-all hover:bg-white/5 hover:text-slate-200"
          >
            <LogOut size={18} className="shrink-0 text-slate-500" />
            <span>Keluar</span>
          </button>
        </form>
        <p className="mt-2 px-3 text-[11px] text-slate-600">ROS · v1.0.0</p>
      </div>
    </aside>
  );
}
