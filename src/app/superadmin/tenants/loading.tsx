import { Skeleton } from "@/components/ui/skeleton";

export default function SuperadminTenantsLoading() {
  return (
    <div className="min-h-full space-y-6 p-8" aria-busy="true" aria-label="Memuat tenant">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48 bg-white/10" />
        <Skeleton className="h-9 w-32 bg-white/10" />
      </div>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="flex items-center gap-4 border-b border-white/5 p-4">
            <Skeleton className="h-9 w-9 rounded-md bg-white/10" />
            <Skeleton className="h-3 w-36 bg-white/10" />
            <Skeleton className="h-3 flex-1 bg-white/10" />
            <Skeleton className="h-6 w-20 bg-white/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
