import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SettingsClient } from "./_components/SettingsClient";
import { StandardPageLayout } from "@/components/StandardPageLayout";

export default async function SettingsPage() {
  const user = await requireRole("OWNER");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId }
  });

  if (!tenant) {
    throw new Error("Tenant not found.");
  }

  const {
    midtransServerKey,
    artisanWebhookToken: _artisanWebhookToken,
    ...safeTenant
  } = tenant;

  return (
    <StandardPageLayout
      title="Pengaturan Portal"
      description="Atur identitas, tampilan, kontak, dan pembayaran portal pelanggan."
    >
      <SettingsClient
        tenant={{
          ...safeTenant,
          midtransServerKeyConfigured: Boolean(midtransServerKey),
        }}
      />
    </StandardPageLayout>
  );
}
