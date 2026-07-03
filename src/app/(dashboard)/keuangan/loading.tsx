import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Skeleton } from "@/components/ui/skeleton";

export default function KeuanganLoading() {
  return (
    <StandardPageLayout title="Keuangan" description="Memuat data..." isLoading>
      {/* KPI skeleton */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4">
            <Skeleton className="h-9 w-9 rounded-lg" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-2.5 w-20" />
            </div>
          </div>
        ))}
      </div>
      <></>
    </StandardPageLayout>
  );
}
