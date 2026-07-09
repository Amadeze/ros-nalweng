import { SuperDashboardClient } from "./_components/SuperDashboardClient";
import { getPnLReport } from "../keuangan/actions";
import { getInventoryValuationReport } from "./actions";

export const dynamic = "force-dynamic";

export default async function LaporanPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const resolvedParams = await searchParams;
  const now = new Date();
  
  let month = now.getMonth() + 1;
  let year = now.getFullYear();

  if (resolvedParams.month && resolvedParams.year) {
    month = parseInt(resolvedParams.month, 10);
    year = parseInt(resolvedParams.year, 10);
  }

  const [pnlReport, inventoryReport] = await Promise.all([
    getPnLReport(month, year),
    getInventoryValuationReport()
  ]);

  return <SuperDashboardClient pnlReport={pnlReport} inventoryReport={inventoryReport} />;
}
