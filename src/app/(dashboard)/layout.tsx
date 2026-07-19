import { AppShell } from "@/components/layout/AppShell";
import { getTenantAccessRecord, requireCurrentUser } from "@/lib/auth";
import { AppToastProvider } from "@/components/AppToastProvider";

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
  const tenant = await getTenantAccessRecord(user.tenantId);

  return (
    <AppToastProvider>
      <AppShell
        userRole={user.role}
        subscriptionTier={tenant?.subscriptionTier || "TRIAL"}
      >
        {children}
      </AppShell>
    </AppToastProvider>
  );
}
