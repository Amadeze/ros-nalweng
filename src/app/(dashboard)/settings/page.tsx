import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { SettingsClient } from "./_components/SettingsClient";

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
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Portal Settings</h1>
      <SettingsClient
        tenant={{
          ...safeTenant,
          midtransServerKeyConfigured: Boolean(midtransServerKey),
        }}
      />
    </div>
  );
}
