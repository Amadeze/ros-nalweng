"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Factory, Loader2, Package, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { ProductionHistoryTable } from "./ProductionHistoryTable";
import { ProductionForm } from "./ProductionForm";
import type {
  FGProductOption,
  PackagingOption,
  ProductionBatchRow,
  RBStockOption,
} from "../actions";

interface ProductionClientProps {
  batches: ProductionBatchRow[];
  fgOptions: FGProductOption[];
  rbOptions: RBStockOption[];
  packagingOptions: PackagingOption[];
}

export function ProductionClient({
  batches,
  fgOptions,
  rbOptions,
  packagingOptions,
}: ProductionClientProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProduce = rbOptions.length > 0 && packagingOptions.length > 0;

  const kpi = useMemo(() => {
    const validBatches = batches.filter(b => b.status === "COMPLETED");
    const totalFG = validBatches.reduce((sum, b) => sum + b.unitsProduced, 0);
    const totalRB = validBatches.reduce((sum, b) => sum + b.totalRbUsedKg, 0);
    
    return {
      count: batches.length,
      totalFG,
      totalRB
    };
  }, [batches]);

  return (
    <>
      <StandardPageLayout
        title="Produksi"
        description={`${batches.length} batch tercatat · stok RB & FG diupdate otomatis`}
        actionButton={
          <Button
            size="default"
            className="gap-2 bg-amber-700 text-white hover:bg-amber-800 shadow-md hover:shadow-lg rounded-xl font-semibold px-5 transition-all group"
            onClick={() => setDrawerOpen(true)}
          >
            <Factory size={16} className="group-hover:scale-110 transition-transform" />
            Batch Baru
          </Button>
        }
        mobileFabAction={{
          label: "Batch Baru",
          icon: <Factory size={22} />,
          onClick: () => setDrawerOpen(true),
          "aria-label": "Buat batch baru",
        }}
      >
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-indigo-50 to-blue-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Factory size={48} className="text-indigo-600" /></div>
            <p className="text-xs font-medium text-indigo-600 relative z-10">Total Batch Produksi</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-indigo-700 relative z-10">{kpi.count}</p>
          </div>
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-fuchsia-50 to-pink-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Package size={48} className="text-fuchsia-600" /></div>
            <p className="text-xs font-medium text-fuchsia-600 relative z-10">Total Produk Jadi (FG)</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-fuchsia-700 relative z-10">{kpi.totalFG} <span className="text-sm">pcs</span></p>
          </div>
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Thermometer size={48} className="text-amber-600" /></div>
            <p className="text-xs font-medium text-amber-600 relative z-10">Ekstraksi Roasted Bean</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-amber-700 relative z-10">{kpi.totalRB.toFixed(1)} <span className="text-sm">kg</span></p>
          </div>
        </div>
        
        <ProductionHistoryTable batches={batches} />
      </StandardPageLayout>

      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setDrawerOpen(open); }}
        title="Batch Produksi Baru"
        description="Pilih SKU → resep otomatis terisi. Gramasi dapat diedit bebas sebelum disimpan."
        size="lg"
        submitButton={
          <Button
            type="submit"
            form="production-form"
            size="sm"
            disabled={isSubmitting || !canProduce}
            className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 shadow-md rounded-xl font-bold disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Batch"}
          </Button>
        }
      >
        {!canProduce ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12 text-center">
            <Factory size={24} className="text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">Bahan baku belum tersedia</p>
            <p className="text-xs text-zinc-400 max-w-xs">
              {rbOptions.length === 0 && "Roasted Bean stok kosong. "}
              {packagingOptions.length === 0 && "Kemasan stok kosong. "}
              Tambahkan via Inventory & Roasting terlebih dahulu.
            </p>
          </div>
        ) : (
          <ProductionForm
            id="production-form"
            fgOptions={fgOptions}
            rbOptions={rbOptions}
            packagingOptions={packagingOptions}
            onSuccess={() => { setDrawerOpen(false); router.refresh(); }}
            onPendingChange={setIsSubmitting}
          />
        )}
      </StandardDrawer>
    </>
  );
}
