import { getSalesPageData } from "./actions";
import { SalesClient } from "./_components/SalesClient";

export const dynamic = "force-dynamic";

export default async function PenjualanPage() {
  const data = await getSalesPageData();
  return (
    <SalesClient
      invoices={data.invoices}
      customers={data.customers}
      fgOptions={data.fgOptions}
    />
  );
}
