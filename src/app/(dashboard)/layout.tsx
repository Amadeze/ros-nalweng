import { AppShell } from "@/components/layout/AppShell";
import { requireCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Layout untuk semua halaman yang memerlukan sidebar (route group dashboard).
 * Halaman login/auth berada di luar route group ini dan tidak mendapat sidebar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireCurrentUser();
  const tenant = await prisma.tenant.findUnique({
    where: { id: user.tenantId },
    select: { subscriptionTier: true },
  });

  return (
    <AppShell
      userRole={user.role}
      subscriptionTier={tenant?.subscriptionTier || "TRIAL"}
    >
      {children}
    </AppShell>
  );
}
