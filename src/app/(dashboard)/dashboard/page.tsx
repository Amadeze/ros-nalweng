import { getDashboardData } from "./actions";
import { DashboardShell } from "./_components/DashboardShell";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const data = await getDashboardData();
  return <DashboardShell data={data} />;
}
