"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PackageSearch,
  Flame,
  Factory,
  ShoppingCart,
  BarChart3,
  Database,
  FileText,
  LogOut,
  Settings,
  ScrollText,
  Coffee,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/app/login/actions";
import { planHasFeature, type PlanTier } from "@/lib/plans";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ─────────────────────────────────────────────
// Navigation data
// ─────────────────────────────────────────────

type NavSingle = { kind: "single"; label: string; href: string; icon: React.ElementType };
type NavGroup = {
  kind: "group";
  label: string;
  icon: React.ElementType;
  children: { label: string; href: string; icon: React.ElementType }[];
};
type NavItem = NavSingle | NavGroup;

const NAV_ITEMS: NavItem[] = [
  { kind: "single", label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  {
    kind: "group",
    label: "Operasional",
    icon: PackageSearch,
    children: [
      { label: "Inventory", href: "/inventory", icon: PackageSearch },
      { label: "Roasting", href: "/roasting", icon: Flame },
      { label: "Produksi", href: "/produksi", icon: Factory },
    ],
  },
  {
    kind: "group",
    label: "Keuangan",
    icon: ShoppingCart,
    children: [
      { label: "Penjualan", href: "/penjualan", icon: ShoppingCart },
      { label: "Keuangan", href: "/keuangan", icon: BarChart3 },
      { label: "Laporan Finansial", href: "/laporan", icon: FileText },
    ],
  },
  {
    kind: "group",
    label: "Sistem",
    icon: Settings,
    children: [
      { label: "Data Master", href: "/master-data", icon: Database },
      { label: "Audit & Integrasi", href: "/audit", icon: ScrollText },
      { label: "Pengaturan", href: "/settings", icon: Settings },
      { label: "Billing & Plan", href: "/billing", icon: FileText },
    ],
  },
];

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

const EXPANDED_W = "w-64";
const COLLAPSED_W = "w-[72px]";
const STORAGE_KEY = "ros-sidebar-collapsed";

// ─────────────────────────────────────────────
// Hook: localStorage-backed collapsed state
// ─────────────────────────────────────────────

function useCollapsed(defaultValue: boolean) {
  const [collapsed, setCollapsed] = useState(defaultValue);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setCollapsed(stored === "true");
    } catch { /* localStorage not available */ }
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch { /* localStorage not available */ }
      return next;
    });
  }, []);

  return [collapsed, toggle] as const;
}

// ─────────────────────────────────────────────
// Collapsed Sidebar (icon rail + flyout)
// ─────────────────────────────────────────────

function CollapsedSidebar({
  items,
  pathname,
  onToggle,
}: {
  items: NavItem[];
  pathname: string;
  onToggle: () => void;
}) {
  const [flyoutGroup, setFlyoutGroup] = useState<string | null>(null);
  const flyoutRef = useRef<HTMLDivElement>(null);
  const iconRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isGroupActive = (group: NavGroup) =>
    group.children.some((c) => pathname.startsWith(c.href));

  const openFlyout = (label: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setFlyoutGroup(label);
  };

  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setFlyoutGroup(null), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFlyoutGroup(null);
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (
        flyoutRef.current &&
        !flyoutRef.current.contains(e.target as Node) &&
        ![...iconRefs.current.values()].some((el) => el.contains(e.target as Node))
      ) {
        setFlyoutGroup(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <aside
      className={cn(
        "relative flex h-full shrink-0 flex-col items-center rounded-2xl bg-white/70 backdrop-blur-3xl border border-white/60 text-slate-800 shadow-2xl transition-[width] duration-200 md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none",
        COLLAPSED_W
      )}
    >
      {/* Brand — icon only */}
      <div className="flex h-20 items-center justify-center pt-4 mb-2">
        <Coffee className="h-8 w-8 text-slate-800" />
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/60 hover:text-slate-700 transition-colors"
        title="Expand sidebar"
        aria-label="Expand sidebar"
      >
        <PanelLeftOpen size={16} />
      </button>

      <div className="mx-3 h-px w-8 bg-white/40 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 flex flex-col items-center gap-1 overflow-y-auto px-2 py-2 custom-scrollbar">
        {items.map((item) => {
          if (item.kind === "single") {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger render={<button />}>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
                      active
                        ? "text-white"
                        : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="sidebar-active-indicator"
                        className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30"
                        transition={{ type: "spring", stiffness: 350, damping: 30 }}
                      />
                    )}
                    <Icon size={18} className="relative z-10" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          }

          // Group
          const Icon = item.icon;
          const active = isGroupActive(item);
          return (
            <div key={item.label} className="relative">
              <button
                ref={(el) => {
                  if (el) iconRefs.current.set(item.label, el);
                }}
                className={cn(
                  "relative flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200",
                  active || flyoutGroup === item.label
                    ? "text-white"
                    : "text-slate-500 hover:text-slate-800 hover:bg-white/60"
                )}
                onClick={() => openFlyout(item.label)}
                onMouseEnter={() => openFlyout(item.label)}
                onMouseLeave={scheduleClose}
                aria-label={item.label}
              >
                {(active || flyoutGroup === item.label) && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30" />
                )}
                <Icon size={18} className="relative z-10" />
              </button>
            </div>
          );
        })}
      </nav>

      <div className="mx-3 h-px w-8 bg-white/40" />

      {/* Footer */}
      <div className="px-2 py-4">
        <form action={logoutAction}>
          <Tooltip>
            <TooltipTrigger render={<button type="submit" />}>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-white/60 hover:text-rose-600 transition-colors">
                <LogOut size={18} />
              </div>
            </TooltipTrigger>
            <TooltipContent side="right" sideOffset={8}>
              Keluar
            </TooltipContent>
          </Tooltip>
        </form>
      </div>

      {/* Flyout */}
      <AnimatePresence>
        {flyoutGroup && (() => {
          const group = items.find(
            (i) => i.kind === "group" && i.label === flyoutGroup
          ) as NavGroup | undefined;
          if (!group) return null;

          const Icon = group.icon;

          return (
            <motion.div
              ref={flyoutRef}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -4 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className={cn(
                "absolute left-full top-0 z-[200] ml-2 w-56 rounded-2xl border border-white/60 bg-white/80 backdrop-blur-2xl shadow-2xl p-3"
              )}
              onMouseEnter={cancelClose}
              onMouseLeave={scheduleClose}
            >
              {/* Group header */}
              <div className="flex items-center gap-2.5 px-2 pb-2 mb-1 border-b border-white/40">
                <div className="flex items-center justify-center rounded-lg bg-blue-500/10 p-1.5">
                  <Icon size={16} className="text-blue-600" />
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  {group.label}
                </span>
              </div>

              {/* Children */}
              <div className="space-y-0.5">
                {group.children.map((child) => {
                  const ChildIcon = child.icon;
                  const childActive = pathname.startsWith(child.href);
                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={cn(
                        "flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-150",
                        childActive
                          ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-md shadow-blue-500/20"
                          : "text-slate-600 hover:bg-white/60 hover:text-slate-900"
                      )}
                    >
                      <ChildIcon size={16} />
                      <span>{child.label}</span>
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Expanded Sidebar (full labels + accordion)
// ─────────────────────────────────────────────

function ExpandedSidebar({
  items,
  pathname,
  onToggle,
}: {
  items: NavItem[];
  pathname: string;
  onToggle?: () => void;
}) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const item of items) {
      if (item.kind === "group" && item.children.some((c) => pathname.startsWith(c.href))) {
        initial.add(item.label);
      }
    }
    return initial;
  });

  // Auto-expand groups when route changes
  useEffect(() => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      for (const item of items) {
        if (item.kind === "group" && item.children.some((c) => pathname.startsWith(c.href))) {
          next.add(item.label);
        }
      }
      return next;
    });
  }, [pathname, items]);

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col rounded-2xl bg-white/70 backdrop-blur-3xl border border-white/60 text-slate-800 shadow-2xl transition-[width] duration-200 md:bg-transparent md:backdrop-blur-none md:border-transparent md:shadow-none",
        EXPANDED_W
      )}
    >
      {/* Brand */}
      <div className="flex h-20 items-center justify-between px-4 pt-4 mb-2">
        <div className="flex items-center gap-2">
          <Coffee className="h-8 w-8 text-slate-800" />
          <span className="text-lg font-bold text-slate-800 tracking-tight">Roastery OS</span>
        </div>
        {onToggle && (
          <button
            onClick={onToggle}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/60 hover:text-slate-700 transition-colors"
            title="Collapse sidebar"
            aria-label="Collapse sidebar"
          >
            <PanelLeftClose size={16} />
          </button>
        )}
      </div>

      <div className="mx-4 h-px bg-white/40 my-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 custom-scrollbar">
        {items.map((item) => {
          if (item.kind === "single") {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 mb-1",
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
                <div
                  className={cn(
                    "relative z-10 flex items-center justify-center rounded-lg p-1.5 transition-colors duration-200",
                    active
                      ? "text-white"
                      : "bg-white/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-800"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span className="relative z-10 truncate tracking-wide">{item.label}</span>
              </Link>
            );
          }

          // Group (accordion)
          const isOpen = expandedGroups.has(item.label);
          const groupActive = item.children.some((c) => pathname.startsWith(c.href));
          const Icon = item.icon;

          return (
            <div key={item.label} className="mb-1">
              <button
                onClick={() => toggleGroup(item.label)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200",
                  groupActive && !isOpen
                    ? "text-slate-800"
                    : "text-slate-600 hover:text-slate-900"
                )}
                aria-expanded={isOpen}
                aria-controls={`sidebar-group-${item.label}`}
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-lg p-1.5 transition-colors duration-200",
                    groupActive
                      ? "bg-blue-500/10 text-blue-600"
                      : "bg-white/50 text-slate-500 group-hover:bg-white/80 group-hover:text-slate-800"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span className="flex-1 text-left truncate tracking-wide">{item.label}</span>
                <ChevronRight
                  size={14}
                  className={cn(
                    "text-slate-400 transition-transform duration-200 shrink-0",
                    isOpen && "rotate-90"
                  )}
                />
              </button>

              {/* Submenu with animation */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`sidebar-group-${item.label}`}
                    role="group"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="ml-4 pl-4 border-l border-white/30 py-1 space-y-0.5">
                      {item.children.map((child) => {
                        const ChildIcon = child.icon;
                        const childActive = pathname.startsWith(child.href);
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={cn(
                              "group relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                              childActive
                                ? "text-white"
                                : "text-slate-500 hover:text-slate-800 hover:bg-white/40"
                            )}
                          >
                            {childActive && (
                              <motion.div
                                layoutId="sidebar-active-indicator"
                                className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-400 shadow-lg shadow-blue-500/30"
                                transition={{ type: "spring", stiffness: 350, damping: 30 }}
                              />
                            )}
                            <ChildIcon size={15} className="relative z-10" />
                            <span className="relative z-10 truncate">{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>

      <div className="mx-4 h-px bg-white/40" />

      {/* Footer */}
      <div className="px-3 py-4">
        <form action={logoutAction}>
          <button
            type="submit"
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/40 hover:text-slate-900 hover:shadow-sm active:scale-[0.98]"
          >
            <div className="flex items-center justify-center rounded-lg bg-white/50 p-1.5 text-slate-400 transition-all duration-200 group-hover:bg-rose-100 group-hover:text-rose-600 group-hover:shadow-sm">
              <LogOut size={18} />
            </div>
            <span className="tracking-wide">Keluar</span>
          </button>
        </form>
        <p className="mt-3 text-center text-[10px] font-bold tracking-wider text-slate-400/80 uppercase">
          ROS · v1.0.0
        </p>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────
// Main Sidebar component
// ─────────────────────────────────────────────

export function Sidebar({
  userRole,
  subscriptionTier,
  forceExpanded = false,
}: {
  userRole: string;
  subscriptionTier: PlanTier;
  forceExpanded?: boolean;
}) {
  const pathname = usePathname();
  const [collapsed, toggleCollapsed] = useCollapsed(false);
  const isCollapsed = forceExpanded ? false : collapsed;

  const isItemVisible = useCallback(
    (href: string) => {
      if (href === "/laporan" && !planHasFeature(subscriptionTier, "ADVANCED_REPORTS")) {
        return false;
      }
      if (userRole === "OWNER") return true;
      if (userRole === "MANAGER") return !["/settings", "/billing"].includes(href);
      if (userRole === "OPERATOR")
        return ["/dashboard", "/inventory", "/roasting", "/produksi"].includes(href);
      if (userRole === "CASHIER")
        return ["/dashboard", "/penjualan", "/master-data"].includes(href);
      return false;
    },
    [userRole, subscriptionTier]
  );

  const filteredItems = NAV_ITEMS.filter((item) => {
    if (item.kind === "single") return isItemVisible(item.href);
    const visibleChildren = item.children.filter((c) => isItemVisible(c.href));
    return visibleChildren.length > 0;
  }).map((item) => {
    if (item.kind === "group") {
      return { ...item, children: item.children.filter((c) => isItemVisible(c.href)) };
    }
    return item;
  });

  return (
    <TooltipProvider>
      {isCollapsed ? (
        <CollapsedSidebar
          items={filteredItems}
          pathname={pathname}
          onToggle={toggleCollapsed}
        />
      ) : (
        <ExpandedSidebar
          items={filteredItems}
          pathname={pathname}
          onToggle={forceExpanded ? undefined : toggleCollapsed}
        />
      )}
    </TooltipProvider>
  );
}
