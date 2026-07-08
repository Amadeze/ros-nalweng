import { PnLReportClient } from "./_components/PnLReportClient";
import { getPnLReport } from "../keuangan/actions";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ month?: string; year?: string }>;
}

export default async function LaporanPage({ searchParams }: Props) {
  const params = await searchParams;
  const now    = new Date();
  const month  = params.month ? parseInt(params.month) : now.getMonth() + 1;
  const year   = params.year  ? parseInt(params.year)  : now.getFullYear();

  const report = await getPnLReport(month, year);

  return (
    <PnLReportClient report={report} />
  );
}
