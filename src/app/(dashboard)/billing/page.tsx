import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import BillingClient from "./_components/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await requireRole("OWNER");

  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId }
  });

  if (!tenant) throw new Error("Tenant not found.");

  return <BillingClient tenant={tenant} />;
}
