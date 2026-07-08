"use client";

import { useState } from "react";
import { Factory, Loader2 } from "lucide-react";
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
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProduce = rbOptions.length > 0 && packagingOptions.length > 0;

  return (
    <>
      <StandardPageLayout
        title="Produksi"
        description={`${batches.length} batch tercatat · stok RB & FG diupdate otomatis`}
        actionButton={
          <Button
            size="sm"
            className="gap-1.5 bg-slate-800 text-white hover:bg-slate-700 shadow-md rounded-xl font-bold"
            onClick={() => setDrawerOpen(true)}
          >
            <Factory size={14} />
            Batch Baru
          </Button>
        }
      >
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
            className="gap-1.5 bg-slate-800 text-white hover:bg-slate-700 shadow-md rounded-xl font-bold disabled:opacity-60"
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
            onSuccess={() => setDrawerOpen(false)}
            onPendingChange={setIsSubmitting}
          />
        )}
      </StandardDrawer>
    </>
  );
}
