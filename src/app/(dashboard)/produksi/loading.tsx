import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Button } from "@/components/ui/button";
import { Factory } from "lucide-react";

export default function ProduksiLoading() {
  return (
    <StandardPageLayout
      title="Produksi"
      description="Memuat data..."
      isLoading
      actionButton={
        <Button size="sm" disabled className="gap-1.5 bg-zinc-900 text-white opacity-50">
          <Factory size={14} />
          Batch Baru
        </Button>
      }
    >
      <></>
    </StandardPageLayout>
  );
}
