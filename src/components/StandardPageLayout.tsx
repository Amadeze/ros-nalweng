import { Skeleton } from "@/components/ui/skeleton";

interface StandardPageLayoutProps {
  title: string;
  description?: string;
  actionButton?: React.ReactNode;
  children: React.ReactNode;
  isLoading?: boolean;
}

export function StandardPageLayout({
  title,
  description,
  actionButton,
  children,
  isLoading = false,
}: StandardPageLayoutProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/20 px-4 md:px-6 backdrop-blur-md">
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-lg font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-xs font-medium text-slate-500">
              {description}
            </p>
          )}
        </div>

        {actionButton && (
          <div className="hidden md:flex shrink-0 items-center gap-2 ml-4">
            {actionButton}
          </div>
        )}
      </header>

      {/* Mobile Floating Action Button (Adaptive) */}
      {actionButton && !isLoading && (
        <div className="md:hidden fixed bottom-6 right-6 z-[100] animate-in slide-in-from-bottom-10 zoom-in-95 fade-in duration-500">
          <div className="p-1.5 rounded-full shadow-[0_20px_40px_-15px_rgba(37,99,235,0.5)] ring-1 ring-white/60 bg-white/40 backdrop-blur-2xl">
            <div className="[&>button]:rounded-full [&>button]:h-14 [&>button]:px-6 [&>button]:shadow-none [&>button]:text-base [&>button]:font-semibold">
              {actionButton}
            </div>
          </div>
        </div>
      )}

      {/* ── Content area ── */}
      <div className="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
        {isLoading ? <PageSkeleton /> : children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton loading state — Glassmorphism style
// ─────────────────────────────────────────────

export function PageSkeleton() {
  return (
    <div className="space-y-3">
      {/* Baris header tabel */}
      <div className="flex items-center gap-4 rounded-[1rem] border border-white/60 bg-white/40 px-4 py-3 backdrop-blur-xl shadow-sm">
        <Skeleton className="h-4 w-4 rounded bg-white/50" />
        <Skeleton className="h-4 w-32 bg-white/50" />
        <Skeleton className="h-4 w-24 ml-auto bg-white/50" />
        <Skeleton className="h-4 w-20 bg-white/50" />
        <Skeleton className="h-4 w-16 bg-white/50" />
      </div>

      {/* 6 baris data */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-[1rem] border border-white/50 bg-white/30 px-4 py-3.5 backdrop-blur-md shadow-sm"
        >
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