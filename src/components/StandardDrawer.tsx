import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StandardDrawerProps {
  /** Status buka/tutup drawer. Dikontrol oleh state di halaman pemanggil. */
  open: boolean;
  /** Callback saat drawer ditutup (klik overlay, tombol X, atau tombol Batal). */
  onOpenChange: (open: boolean) => void;
  /** Judul form di header drawer. */
  title: string;
  /** Deskripsi singkat konteks form (opsional). */
  description?: string;
  /**
   * Isi form. Wajib berupa controlled form — state dikelola di luar komponen ini.
   * Komponen ini tidak tahu-menahu soal submit logic.
   */
  children: React.ReactNode;
  /**
   * Tombol submit kustom di footer.
   * Contoh: <Button type="submit" form="my-form">Simpan</Button>
   * Jika tidak diisi, footer hanya menampilkan tombol Batal.
   */
  submitButton?: React.ReactNode;
  /**
   * Lebar drawer. Default: "md" (448px).
   * - "sm"  : 384px — form pendek / lookup
   * - "md"  : 448px — form standar (default)
   * - "lg"  : 560px — form dengan banyak field
   * - "xl"  : 680px — form kompleks / multi-section
   */
  size?: "sm" | "md" | "lg" | "xl";
  /**
   * Saat true, tampilkan skeleton loading state sebagai pengganti children.
   * Gunakan saat data untuk pre-fill form sedang di-fetch.
   */
  isLoading?: boolean;
}

const SIZE_MAP: Record<NonNullable<StandardDrawerProps["size"]>, string> = {
  sm: "w-96",      // 384px
  md: "w-[448px]", // 448px
  lg: "w-[560px]", // 560px
  xl: "w-[680px]", // 680px
};

/**
 * StandardDrawer
 *
 * Komponen Sheet (dari Shadcn) yang dipakai sebagai satu-satunya
 * cara menampilkan form input di seluruh ROS.
 *
 * Pola penggunaan di halaman:
 * ```tsx
 * const [open, setOpen] = useState(false);
 *
 * <Button onClick={() => setOpen(true)}>+ Tambah</Button>
 *
 * <StandardDrawer
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Tambah Barang Datang"
 *   submitButton={<Button type="submit" form="purchase-form">Simpan</Button>}
 * >
 *   <PurchaseForm id="purchase-form" onSuccess={() => setOpen(false)} />
 * </StandardDrawer>
 * ```
 */
export function StandardDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  submitButton,
  size = "md",
  isLoading = false,
}: StandardDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className={[
          SIZE_MAP[size],
          "flex flex-col gap-0 p-0 bg-white border-l border-zinc-200",
          "max-w-none",
        ].join(" ")}
        showCloseButton={false}
      >
        {/* ── Drawer Header ── */}
        <SheetHeader className="flex shrink-0 flex-row items-start justify-between gap-4 border-b border-zinc-100 px-6 py-4">
          <div className="min-w-0 pt-0.5">
            <SheetTitle className="truncate text-base font-semibold text-zinc-900">
              {title}
            </SheetTitle>
            {description && (
              <SheetDescription className="mt-0.5 text-xs text-zinc-500 line-clamp-2">
                {description}
              </SheetDescription>
            )}
          </div>

          {/* Tombol tutup custom — base-ui gunakan render prop, bukan asChild */}
          <SheetClose
            render={
              <button
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900"
                aria-label="Tutup"
              />
            }
          >
            <X size={16} />
          </SheetClose>
        </SheetHeader>

        {/* ── Drawer Body — scrollable ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {isLoading ? <FormSkeleton /> : children}
        </div>

        {/* ── Drawer Footer ── */}
        <div className="shrink-0 border-t border-zinc-100 bg-zinc-50 px-6 py-4">
          <SheetFooter className="flex-row justify-end gap-2 sm:justify-end">
            <SheetClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="border-zinc-200 text-zinc-700 hover:bg-zinc-100"
                />
              }
            >
              Batal
            </SheetClose>
            {submitButton}
          </SheetFooter>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────
// Skeleton loading state untuk form di dalam drawer
// ─────────────────────────────────────────────

function FormSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-1.5">
          <Skeleton className="h-3.5 w-24" />
          <Skeleton className="h-9 w-full rounded-md" />
        </div>
      ))}
      <Separator className="my-2 bg-zinc-100" />
      <div className="space-y-1.5">
        <Skeleton className="h-3.5 w-16" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    </div>
  );
}
