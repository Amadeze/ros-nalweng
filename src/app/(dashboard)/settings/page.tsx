import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { SettingsClient } from "./_components/SettingsClient";

export default async function SettingsPage() {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  
  if (!session.user || session.user.role !== "OWNER") {
    redirect("/dashboard");
  }

  // Use raw prisma here if we need to query without scoping, 
  // but since we have tenant scoping, we just need to query the current tenant.
  const tenant = await prisma.tenant.findUnique({
    where: { id: session.user.tenantId }
  });

  if (!tenant) {
    redirect("/login");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Portal Settings</h1>
      <SettingsClient tenant={tenant} />
    </div>
  );
}
