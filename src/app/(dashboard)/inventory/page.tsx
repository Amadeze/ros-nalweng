import { getInventoryPageData, getPackagingOptions } from "./actions";
import { InventoryClient } from "./_components/InventoryClient";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [data, packagings] = await Promise.all([
    getInventoryPageData(),
    getPackagingOptions(),
  ]);

  return (
    <InventoryClient
      gbStocks={data.gbStocks}
      rbStocks={data.rbStocks}
      pkgStocks={data.pkgStocks}
      fgStocks={data.fgStocks}
      ledgerEntries={data.ledgerEntries}
      suppliers={data.suppliers}
      gbProducts={data.gbProducts}
      packagings={packagings.map((p) => ({
        id:          p.id,
        name:        p.name,
        code:        p.code,
        costPerUnit: Number(p.costPerUnit),
      }))}
    />
  );
}

