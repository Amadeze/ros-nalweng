import { Skeleton } from "@/components/ui/skeleton";

interface StandardPageLayoutProps {
  /** Judul halaman — ditampilkan di header kiri. */
  title: string;
  /** Deskripsi singkat di bawah judul (opsional). */
  description?: string;
  /**
   * Tombol aksi utama di kanan atas, biasanya tombol [+ Tambah].
   * Terima ReactNode agar konsumen bebas menentukan label & handler-nya.
   */
  actionButton?: React.ReactNode;
  /**
   * Konten utama halaman — biasanya sebuah data table.
   * Dirender di area scrollable di bawah header.
   */
  children: React.ReactNode;
  /** Saat true, tampilkan skeleton loading state sebagai pengganti children. */
  isLoading?: boolean;
}

/**
 * StandardPageLayout
 *
 * Layout wajib untuk semua 6 halaman menu utama ROS:
 *   Header (title + description) → actionButton (kanan atas) → children (table)
 *
 * Jangan membuat layout/halaman form terpisah.
 * Form selalu ditampilkan via StandardDrawer yang dipanggil dari halaman ini.
 */
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/30 px-6 backdrop-blur-sm">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-slate-800">
            {title}
          </h1>
          {description && (
            <p className="mt-0.5 truncate text-xs text-slate-400">
              {description}
            </p>
          )}
        </div>

        {/* Tombol aksi — slot untuk tombol Tambah, Export, dsb. */}
        {actionButton && (
          <div className="ml-4 flex shrink-0 items-center gap-2">
            {actionButton}
          </div>
        )}
      </header>

      {/* ── Content area ── */}
      <div className="flex-1 overflow-auto p-6">
        {isLoading ? <PageSkeleton /> : children}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Skeleton loading state — merepresentasikan tabel dengan N baris
// ─────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="space-y-3">
      {/* Baris header tabel */}
      <div className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/80 px-4 py-3 backdrop-blur-md">
        <Skeleton className="h-4 w-4 rounded" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24 ml-auto" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* 6 baris data */}
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-white/50 bg-white/80 px-4 py-3.5 backdrop-blur-md"
        >
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-4 w-28 ml-auto" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
