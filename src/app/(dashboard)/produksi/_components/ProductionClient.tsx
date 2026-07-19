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
            className="gap-2 rounded-lg bg-stone-900 px-5 font-semibold text-white shadow-none hover:bg-stone-800"
            onClick={() => setDrawerOpen(true)}
          >
            <Factory size={16} />
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
        <div className="mb-6 grid overflow-hidden rounded-xl border border-stone-200 bg-white sm:grid-cols-3">
          {[
            { label: "Total batch", value: kpi.count, icon: Factory, tone: "bg-sky-50 text-sky-700" },
            { label: "Produk jadi", value: `${kpi.totalFG} pcs`, icon: Package, tone: "bg-violet-50 text-violet-700" },
            { label: "Roasted bean terpakai", value: `${kpi.totalRB.toFixed(1)} kg`, icon: Thermometer, tone: "bg-amber-50 text-amber-700" },
          ].map((metric, index) => (
            <div key={metric.label} className={`min-w-0 p-4 sm:p-5 ${index < 2 ? "border-b border-stone-200 sm:border-b-0 sm:border-r" : ""}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-stone-500">{metric.label}</p>
                  <p className="mt-2 break-words font-mono text-base font-bold tabular-nums text-stone-900 sm:text-lg">{metric.value}</p>
                </div>
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${metric.tone}`}><metric.icon size={17} aria-hidden="true" /></span>
              </div>
            </div>
          ))}
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
