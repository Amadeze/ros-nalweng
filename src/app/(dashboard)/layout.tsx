import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { AppShell } from "@/components/layout/AppShell";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

/**
 * Layout untuk semua halaman yang memerlukan sidebar (route group dashboard).
 * Halaman login/auth berada di luar route group ini dan tidak mendapat sidebar.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  const role = session.user?.role || "OPERATOR";

  return <AppShell userRole={role}>{children}</AppShell>;
}
