import { getPnLReport } from "../keuangan/actions";
import { SuperDashboardClient } from "./_components/SuperDashboardClient";
import { requireFeature } from "@/lib/auth";
import { getCurrentDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function LaporanPage({ searchParams }: { searchParams: Promise<{ month?: string; year?: string }> }) {
  await requireFeature("ADVANCED_REPORTS");
  const resolvedParams = await searchParams;
  const now = getCurrentDate();
  
  let month = now.getMonth() + 1;
  let year = now.getFullYear();

  if (resolvedParams.month && resolvedParams.year) {
    const requestedMonth = Number.parseInt(resolvedParams.month, 10);
    const requestedYear = Number.parseInt(resolvedParams.year, 10);
    if (
      Number.isInteger(requestedMonth) &&
      requestedMonth >= 1 &&
      requestedMonth <= 12 &&
      Number.isInteger(requestedYear) &&
      requestedYear >= 2000 &&
      requestedYear <= 2100
    ) {
      month = requestedMonth;
      year = requestedYear;
    }
  }

  const pnlReport = await getPnLReport(month, year);

  return <SuperDashboardClient pnlReport={pnlReport} />;
}
