import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { RoastsClient } from "./_components/RoastsClient";

export default async function RoastsPage() {
  const user = await requireRole("OWNER", "MANAGER", "OPERATOR");

  const roasts = await prisma.roast.findMany({
    where: { tenantId: user.tenantId },
    select: {
      id: true,
      title: true,
      roastDate: true,
      duration: true,
      chargeTemperature: true,
      dropTemperature: true,
      firstCrackStartTime: true,
      firstCrackEndTime: true,
      greenWeightGrams: true,
      roastedWeightGrams: true,
      lossPercent: true,
      metadata: true,
      beanTemperatureSeries: true,
      environmentalTemperatureSeries: true,
      events: true,
      machine: { select: { name: true } },
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg-hover)] shadow-[var(--glass-shadow)]">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)] md:text-xl">
              Roast Profiles
            </h1>
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
              Data roast dari Artisan Sync yang sudah terimport.
            </p>
          </div>
        </div>
      </header>
      <div className="custom-scrollbar flex-1 overflow-auto">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          <RoastsClient
            roasts={roasts.map((r) => ({
              ...r,
              roastDate: r.roastDate?.toISOString() ?? null,
              createdAt: r.createdAt.toISOString(),
              metadata: r.metadata as Record<string, unknown> | null,
              beanTemperatureSeries: r.beanTemperatureSeries as any,
              environmentalTemperatureSeries: r.environmentalTemperatureSeries as any,
              events: r.events as any,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
