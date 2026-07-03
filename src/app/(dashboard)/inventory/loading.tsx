import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Button } from "@/components/ui/button";

/**
 * Ditampilkan oleh Next.js saat InventoryPage sedang fetch data server-side.
 */
export default function InventoryLoading() {
  return (
    <StandardPageLayout
      title="Inventory"
      description="Memuat data stok..."
      actionButton={
        <Button size="sm" disabled className="gap-1.5 bg-zinc-900 text-white opacity-50">
          Barang Datang
        </Button>
      }
      isLoading
    >
      {/* children tidak dirender saat isLoading=true */}
      <></>
    </StandardPageLayout>
  );
}
