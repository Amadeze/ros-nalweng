import { getPnLReport } from "../keuangan/actions";
import { getInventoryValuationReport, getBalanceSheetReport, getCoffeeFlowReport } from "./actions";
import { SuperDashboardClient } from "./_components/SuperDashboardClient";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function LaporanPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  const session = await getIronSession<{ user?: SessionUser }>(await cookies(), SESSION_OPTIONS);
  const resolvedParams = await searchParams;
  const now = new Date();
  
  let month = now.getMonth() + 1;
  let year = now.getFullYear();

  if (resolvedParams.month && resolvedParams.year) {
    month = parseInt(resolvedParams.month, 10);
    year = parseInt(resolvedParams.year, 10);
  }

  const pnlReport = await getPnLReport(month, year);
  const inventoryReport = await getInventoryValuationReport();
  const balanceSheetReport = await getBalanceSheetReport(inventoryReport.grandTotalValue);
  const flowReport = await getCoffeeFlowReport();

  return <SuperDashboardClient pnlReport={pnlReport} inventoryReport={inventoryReport} balanceSheetReport={balanceSheetReport} flowReport={flowReport} userRole={session.user?.role || "OWNER"} />;
}
