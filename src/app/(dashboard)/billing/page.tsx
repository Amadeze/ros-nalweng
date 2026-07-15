import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import BillingClient from "./_components/BillingClient";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  
  if (!session.user || !session.user.tenantId) {
    return <div>Not authenticated</div>;
  }

  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId }
  });

  if (!tenant) return <div>Tenant not found</div>;

  return <BillingClient tenant={tenant} />;
}
