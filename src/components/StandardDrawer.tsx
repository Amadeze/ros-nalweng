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
  sm: "sm:max-w-[400px]",
  md: "sm:max-w-[520px]",
  lg: "sm:max-w-[720px]",
  xl: "sm:max-w-[960px]",
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
          "flex max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] flex-col gap-0 overflow-hidden p-0 sm:max-h-[calc(100dvh-3rem)]",
          "rounded-xl border border-stone-200 bg-white shadow-xl",
        ].join(" ")}
      >
        {/* ── Modal Header ── */}
        <DialogHeader className="flex shrink-0 flex-row items-start justify-between gap-4 border-b border-stone-200/70 px-5 py-5 sm:px-6">
          <div className="min-w-0 pt-0.5 text-left">
            <DialogTitle className="truncate text-lg font-bold tracking-tight text-stone-900 sm:text-xl">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="mt-1 text-xs font-medium leading-5 text-stone-500 line-clamp-2">
                {description}
              </DialogDescription>
            )}
          </div>

          <DialogClose
            render={
              <button
                className="mt-0.5 flex shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white p-2 text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-900 focus-visible:outline-none"
                aria-label="Tutup"
              />
            }
          >
            <X size={14} strokeWidth={3} />
          </DialogClose>
        </DialogHeader>

        {/* ── Modal Body — scrollable ── */}
        <div className="flex-1 overflow-y-auto px-5 py-5 custom-scrollbar sm:px-6 sm:py-6">
          {isLoading ? <FormSkeleton /> : children}
        </div>

        {/* ── Modal Footer ── */}
        <div className="shrink-0 border-t border-stone-200 bg-stone-50 px-5 py-4 sm:px-6">
          <DialogFooter className="flex-row justify-end gap-3 sm:justify-end bg-transparent border-none p-0">
            <DialogClose
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-lg border-stone-200 bg-white px-5 text-stone-700 shadow-none hover:bg-stone-50 hover:text-stone-900"
                />
              }
            >
              Batal
            </DialogClose>
            {submitButton && (
              <div className="[&>button]:rounded-lg [&>button]:px-6 [&>button]:font-semibold [&>button]:shadow-none">
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
