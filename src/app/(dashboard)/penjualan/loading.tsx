import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Button } from "@/components/ui/button";
import { ReceiptText } from "lucide-react";

export default function PenjualanLoading() {
  return (
    <StandardPageLayout
      title="Penjualan"
      description="Memuat data..."
      isLoading
      actionButton={
        <Button size="sm" disabled className="gap-1.5 bg-zinc-900 text-white opacity-50">
          <ReceiptText size={14} />
          Nota Baru
        </Button>
      }
    >
      <></>
    </StandardPageLayout>
  );
}
