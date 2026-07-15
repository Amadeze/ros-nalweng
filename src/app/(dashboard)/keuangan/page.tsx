import { getKeuanganPageData, getExpenseHistory, getPurchaseHistory } from "./actions";
import { KeuanganClient } from "./_components/KeuanganClient";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  const [data, expenses, purchases] = await Promise.all([
    getKeuanganPageData(),
    getExpenseHistory(),
    getPurchaseHistory(),
  ]);
  return <KeuanganClient data={data} expenses={expenses} purchases={purchases} />;
}
