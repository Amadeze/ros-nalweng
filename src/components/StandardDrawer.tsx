import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface StandardDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  submitButton?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  isLoading?: boolean;
}

const SIZE_MAP: Record<NonNullable<StandardDrawerProps["size"]>, string> = {
  sm: "sm:max-w-[384px]",
  md: "sm:max-w-[500px]",
  lg: "sm:max-w-[700px]",
  xl: "sm:max-w-[900px]",
};

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className={[
          SIZE_MAP[size],
          "flex flex-col gap-0 p-0 overflow-hidden",
          "rounded-[2rem] border border-white/60 bg-white/30 backdrop-blur-3xl shadow-2xl shadow-slate-300/40",
        ].join(" ")}
      >
        {/* ── Modal Header ── */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-4 px-8 pt-8 pb-2">
          <div className="min-w-0 pt-0.5 text-left">
            <DialogTitle className="truncate text-xl font-black text-slate-800 tracking-tight">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-[11px] font-bold uppercase tracking-wider text-slate-500 line-clamp-2">
                {description}
              </DialogDescription>
            )}
          </div>

          <DialogClose
            render={
              <button
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-full p-2 text-slate-500 transition-all hover:bg-slate-900 hover:text-white hover:scale-110 focus-visible:outline-none shadow-sm bg-white/50 border border-white/60"
                aria-label="Tutup"
              />
            }
          >
            <X size={14} strokeWidth={3} />
          </DialogClose>
        </DialogHeader>

        {/* ── Modal Body — scrollable ── */}
        <div className="flex-1 overflow-y-auto px-8 py-6 max-h-[70vh] custom-scrollbar">
          {isLoading ? <FormSkeleton /> : children}
        </div>

        {/* ── Modal Footer ── */}
        <div className="shrink-0 px-8 pb-8 pt-4">
          <DialogFooter className="flex-row justify-end gap-3 sm:justify-end bg-transparent border-none p-0">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/60 bg-white/50 text-slate-700 font-bold hover:bg-white/80 hover:text-slate-900 shadow-sm rounded-xl px-5"
                />
              }
            >
              Batal
            </DialogClose>
            {submitButton && (
              <div className="[&>button]:rounded-xl [&>button]:px-6 [&>button]:font-bold [&>button]:shadow-md">
                {submitButton}
              </div>
            )}
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
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
