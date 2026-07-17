import { Skeleton } from "@/components/ui/skeleton";

export default function SuperadminDashboardLoading() {
  return (
    <div className="min-h-full space-y-8 p-8 text-white" aria-busy="true" aria-label="Memuat superadmin dashboard">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 bg-white/10" />
        <Skeleton className="h-3 w-80 bg-white/10" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-5">
            <Skeleton className="h-3 w-24 bg-white/10" />
            <Skeleton className="h-9 w-32 bg-white/15" />
          </div>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Skeleton className="h-80 w-full bg-white/10" />
        <Skeleton className="h-80 w-full bg-white/10" />
      </div>
    </div>
  );
}
