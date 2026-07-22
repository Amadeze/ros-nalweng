import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SettingsClient } from "./_components/SettingsClient";

import { randomBytes } from "crypto";

export default async function SettingsPage() {
  const user = await requireRole("OWNER");

  let tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId }
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  // Auto-generate artisanWebhookToken if missing for backward compatibility
  if (!tenant.artisanWebhookToken) {
    const token = `art_${randomBytes(16).toString("hex")}`;
    tenant = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { artisanWebhookToken: token }
    });
  }

  const {
    midtransServerKey,
    ...safeTenant
  } = tenant;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg-hover)] backdrop-blur-[var(--glass-blur)] shadow-[var(--glass-shadow)]">
        <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)] md:text-xl">Pengaturan Portal</h1>
            <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">Atur identitas, tampilan, kontak, dan pembayaran portal pelanggan.</p>
          </div>
        </div>
      </header>
      <div className="custom-scrollbar flex-1 overflow-auto">
        <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">
          <SettingsClient
            tenant={{
              ...safeTenant,
              midtransServerKeyConfigured: Boolean(midtransServerKey),
              setupCompletedAt: tenant.setupCompletedAt,
            }}
          />
        </div>
      </div>
    </div>
  );
}
