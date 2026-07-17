import {
  getExpenseHistory,
  getKeuanganPageData,
  getPaymentHistory,
  getPurchaseHistory,
  getSupplierPaymentHistory,
} from "./actions";
import { KeuanganClient } from "./_components/KeuanganClient";

export const dynamic = "force-dynamic";

export default async function KeuanganPage() {
  const [data, expenses, purchases, payments, supplierPayments] = await Promise.all([
    getKeuanganPageData(),
    getExpenseHistory(),
    getPurchaseHistory(),
    getPaymentHistory(),
    getSupplierPaymentHistory(),
  ]);
  return (
    <KeuanganClient
      data={data}
      expenses={expenses}
      purchases={purchases}
      payments={payments}
      supplierPayments={supplierPayments}
    />
  );
}
