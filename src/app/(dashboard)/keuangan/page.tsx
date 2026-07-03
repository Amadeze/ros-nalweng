import { getKeuanganPageData, getExpenseHistory } from "./actions";
import { KeuanganClient } from "./_components/KeuanganClient";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  const [data, expenses] = await Promise.all([
    getKeuanganPageData(),
    getExpenseHistory(),
  ]);
  return <KeuanganClient data={data} expenses={expenses} />;
}
