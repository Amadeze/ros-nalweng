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
  Package,
  LogOut,
  Users,
  Settings,
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";

// ─────────────────────────────────────────────
// Menu definition
const NAV_ITEMS = [
  { label: "Dashboard",   href: "/dashboard",    icon: LayoutDashboard },
  { label: "Inventory",   href: "/inventory",    icon: PackageSearch   },
  { label: "Roasting",    href: "/roasting",     icon: Flame           },
  { label: "Produksi",    href: "/produksi",     icon: Factory         },
  { label: "Penjualan",   href: "/penjualan",    icon: ShoppingCart    },
  { label: "Keuangan",    href: "/keuangan",     icon: BarChart3       },
  { label: "Laporan Finansial", href: "/laporan", icon: FileText       },
  { label: "Data Master", href: "/master-data",  icon: Database        },
  { label: "Pengaturan",  href: "/settings",     icon: Settings        },
  { label: "Billing & Plan", href: "/billing",   icon: FileText        },
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
        "group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200",
        active
          ? "text-white"
          : "text-slate-600 hover:text-slate-900"
      )}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active-indicator"
          className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
      
      {/* Icon Wrapper */}
      <div className={cn(
        "relative z-10 flex items-center justify-center rounded-xl p-1.5 transition-colors duration-200",
        active ? "text-white" : "bg-white/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-800"
      )}>
        <Icon size={18} />
      </div>
      
      <span className="relative z-10 truncate tracking-wide">{label}</span>
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
    if (userRole === "OWNER") return true;
    if (userRole === "MANAGER") {
      return item.href !== "/settings";
    }
    if (userRole === "OPERATOR") {
      return ["/dashboard", "/inventory", "/roasting", "/produksi"].includes(item.href);
    }
    if (userRole === "CASHIER") {
      return ["/dashboard", "/penjualan", "/master-data"].includes(item.href);
    }
    return false;
  });

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col rounded-2xl bg-white/70 backdrop-blur-3xl border border-white/60 text-slate-800 shadow-2xl md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none">
      {/* Brand */}
      <div className="flex h-32 items-center justify-center px-2 pt-6 mb-4 transition-transform duration-500 hover:scale-105">
        <img src="/logo.png" alt="Beanslab Logo" className="w-full h-auto max-w-[220px] object-contain drop-shadow-sm" />
      </div>

      <div className="mx-6 h-px bg-white/40 my-2" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1.5 overflow-y-auto px-4 py-4 custom-scrollbar">
        {filteredNavItems.map((item) => (
          <NavItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname.startsWith(item.href)}
          />
        ))}
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
