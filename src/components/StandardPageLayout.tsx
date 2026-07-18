"use client";

import { useState, useEffect, useRef, useCallback, useId } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

// ── Types ──

interface SpeedDialItem {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "secondary";
}

interface MobileFabAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  "aria-label"?: string;
}

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  /** Desktop header actions (all work + utility actions) */
  actionButton?: React.ReactNode;
  /** Single mobile FAB (for pages with 1 work action) */
  mobileFabAction?: MobileFabAction;
  /** Mobile speed dial items (for pages with multiple work actions) */
  mobileSpeedDialItems?: SpeedDialItem[];
  /** Mobile header utility actions (export, print, etc.) */
  mobileHeaderActions?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

// ── Reduced motion ──

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const h = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, []);
  return reduced;
}

// ── Main component ──

export function StandardPageLayout({
  title,
  description,
  actionButton,
  mobileFabAction,
  mobileSpeedDialItems,
  mobileHeaderActions,
  children,
  isLoading = false,
}: StandardPageLayoutProps) {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const fabRef = useRef<HTMLButtonElement>(null);
  const speedDialRef = useRef<HTMLDivElement>(null);
  const panelId = useId();
  const reducedMotion = usePrefersReducedMotion();

  const closeSpeedDial = useCallback(() => {
    setSpeedDialOpen(false);
    requestAnimationFrame(() => fabRef.current?.focus());
  }, []);

  const animDuration = reducedMotion ? 0 : 0.15;

  // Close speed dial on Escape / click outside
  useEffect(() => {
    if (!speedDialOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); closeSpeedDial(); }
    };
    const onClick = (e: MouseEvent) => {
      if (
        speedDialRef.current && !speedDialRef.current.contains(e.target as Node) &&
        fabRef.current && !fabRef.current.contains(e.target as Node)
      ) closeSpeedDial();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, [speedDialOpen, closeSpeedDial]);

  const hasSpeedDial = !isLoading && mobileSpeedDialItems && mobileSpeedDialItems.length > 0;
  const hasSingleFab = !isLoading && !hasSpeedDial && !!mobileFabAction;
  const hasFab = hasSpeedDial || hasSingleFab;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/20 px-4 md:px-6 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
              {description}
            </p>
          )}
        </div>

        {/* Desktop actions */}
        {actionButton && (
          <div className="hidden md:flex shrink-0 items-center gap-2 ml-4">
            {actionButton}
          </div>
        )}

        {/* Mobile header utility actions */}
        {mobileHeaderActions && (
          <div className="md:hidden shrink-0 ml-2">
            {mobileHeaderActions}
          </div>
        )}
      </header>

      {/* ── Mobile Speed Dial (multiple work actions) ── */}
      {hasSpeedDial && (
        <>
          <AnimatePresence>
            {speedDialOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: animDuration }}
                className="md:hidden fixed inset-0 z-[99] bg-black/10"
                onClick={closeSpeedDial}
                aria-hidden="true"
              />
            )}
          </AnimatePresence>

          <div
            ref={speedDialRef}
            className="md:hidden fixed z-[100] flex flex-col items-end"
            style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", right: "16px" }}
          >
            <AnimatePresence>
              {speedDialOpen && (
                <motion.div
                  id={panelId}
                  role="menu"
                  aria-label="Menu aksi"
                  className="flex flex-col items-end gap-2 mb-3"
                >
                  {(mobileSpeedDialItems ?? []).map((item, i) => (
                    <motion.button
                      key={item.label}
                      role="menuitem"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: animDuration, delay: reducedMotion ? 0 : ((mobileSpeedDialItems?.length ?? 0) - 1 - i) * 0.04 }}
                      onClick={() => { item.onClick(); closeSpeedDial(); }}
                      className={cn(
                        "flex items-center gap-2.5 rounded-full px-4 py-2.5 text-sm font-semibold shadow-lg active:scale-95 transition-transform min-h-[44px]",
                        item.variant === "primary"
                          ? "bg-blue-600 text-white shadow-blue-900/30"
                          : "border border-white/60 bg-white/80 backdrop-blur-xl text-slate-700 shadow-slate-200/40"
                      )}
                    >
                      <span className={item.variant === "primary" ? "text-white/80" : "text-slate-500"}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              ref={fabRef}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSpeedDialOpen((p) => !p)}
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-full shadow-xl active:scale-95 transition-colors min-h-[56px] min-w-[56px]",
                speedDialOpen ? "bg-slate-800 text-white shadow-slate-900/40" : "bg-blue-600 text-white shadow-blue-900/30"
              )}
              aria-label={speedDialOpen ? "Tutup menu aksi" : "Buka menu aksi"}
              aria-expanded={speedDialOpen}
              aria-controls={panelId}
            >
              <motion.span
                animate={{ rotate: speedDialOpen ? 45 : 0 }}
                transition={{ duration: animDuration }}
                className="flex items-center justify-center"
              >
                {speedDialOpen ? <X size={22} /> : <Plus size={22} />}
              </motion.span>
            </motion.button>
          </div>
        </>
      )}

      {/* ── Mobile Single FAB (one work action) ── */}
      {hasSingleFab && (
        <div
          className="md:hidden fixed z-[100]"
          style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", right: "16px" }}
        >
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={mobileFabAction!.onClick}
            className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-blue-600 text-white shadow-xl shadow-blue-900/30 active:scale-95 transition-all min-h-[52px] min-w-[52px]"
            aria-label={mobileFabAction!["aria-label"] || mobileFabAction!.label}
          >
            {mobileFabAction!.icon || <Plus size={22} />}
          </motion.button>
        </div>
      )}

      {/* ── Content area ── */}
      <div
        className={cn(
          "flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative",
          hasFab && "pb-[calc(88px+env(safe-area-inset-bottom,0px))] md:pb-6"
        )}
      >
        {isLoading ? <PageSkeleton /> : children}
      </div>
    </div>
  );
}

// ── Skeleton ──

export function PageSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4 rounded-[1rem] border border-white/60 bg-white/40 px-4 py-3 backdrop-blur-xl shadow-sm">
        <Skeleton className="h-4 w-4 rounded bg-white/50" />
        <Skeleton className="h-4 w-32 bg-white/50" />
        <Skeleton className="h-4 w-24 ml-auto bg-white/50" />
        <Skeleton className="h-4 w-20 bg-white/50" />
        <Skeleton className="h-4 w-16 bg-white/50" />
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-[1rem] border border-white/50 bg-white/30 px-4 py-3.5 backdrop-blur-md shadow-sm">
          <Skeleton className="h-4 w-4 rounded bg-white/50" />
          <Skeleton className="h-4 w-48 bg-white/50" />
          <Skeleton className="h-4 w-28 ml-auto bg-white/50" />
          <Skeleton className="h-4 w-20 bg-white/50" />
          <Skeleton className="h-6 w-16 rounded-full bg-white/50" />
        </div>
      ))}
    </div>
  );
}
