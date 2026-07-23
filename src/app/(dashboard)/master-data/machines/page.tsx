import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { MachinesClient } from "./_components/MachinesClient";

export default async function MachinesPage() {
  const user = await requireRole("OWNER", "MANAGER");

  const machines = await prisma.machine.findMany({
    where: { tenantId: user.tenantId },
    select: {
      id: true,
      name: true,
      description: true,
      capacityKg: true,
      isActive: true,
      createdAt: true,
      _count: {
        select: { artisanConnectors: true, artisanImports: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg-hover)] shadow-[var(--glass-shadow)]">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)] md:text-xl">
              Mesin Roasting
            </h1>
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">
              Kelola mesin roasting untuk integrasi Artisan.
            </p>
          </div>
        </div>
      </header>
      <div className="custom-scrollbar flex-1 overflow-auto">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          <MachinesClient
            machines={machines.map((m) => ({
              ...m,
              capacityKg: m.capacityKg ? Number(m.capacityKg) : null,
              createdAt: m.createdAt.toISOString(),
            }))}
          />
        </div>
      </div>
    </div>
  );
}
