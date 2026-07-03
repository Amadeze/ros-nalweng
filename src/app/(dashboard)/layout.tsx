import { AppShell } from "@/components/layout/AppShell";

/**
 * Layout untuk semua halaman yang memerlukan sidebar (route group dashboard).
 * Halaman login/auth berada di luar route group ini dan tidak mendapat sidebar.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppShell>{children}</AppShell>;
}
