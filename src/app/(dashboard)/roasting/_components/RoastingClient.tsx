"use client";

import { useState } from "react";
import { Flame, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { RoastingHistoryTable } from "./RoastingHistoryTable";
import { RoastingForm } from "./RoastingForm";
import type { GBStockOption, RBProductOption, RoastingBatchRow } from "../actions";

interface RoastingClientProps {
  batches: RoastingBatchRow[];
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
}

export function RoastingClient({ batches, gbOptions, rbOptions }: RoastingClientProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  return (
    <>
      <StandardPageLayout
        title="Roasting"
        description={`${batches.length} batch tercatat · stok GB & RB diupdate otomatis`}
        actionButton={
          <Button
            size="sm"
            className="gap-1.5 bg-slate-800 text-white hover:bg-slate-700 shadow-md rounded-xl font-bold"
            onClick={() => setDrawerOpen(true)}
          >
            <Flame size={14} />
            Mulai Roasting
          </Button>
        }
      >
        <RoastingHistoryTable batches={batches} />
      </StandardPageLayout>

      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(open) => {
          if (!isSubmitting) setDrawerOpen(open);
        }}
        title="Catat Roasting Batch"
        description="Stok Green Bean akan dipotong dan Roasted Bean bertambah otomatis."
        size="lg"
        submitButton={
          <Button
            type="submit"
            form="roasting-form"
            size="sm"
            disabled={isSubmitting || gbOptions.length === 0}
            className="gap-1.5 bg-slate-800 text-white hover:bg-slate-700 shadow-md rounded-xl font-bold disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Batch"}
          </Button>
        }
      >
        {gbOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12">
            <Plus size={24} className="text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">Tidak ada Green Bean tersedia</p>
            <p className="text-xs text-zinc-400">
              Catat Barang Datang di halaman Inventory terlebih dahulu.
            </p>
          </div>
        ) : (
          <RoastingForm
            id="roasting-form"
            gbOptions={gbOptions}
            rbOptions={rbOptions}
            onSuccess={() => setDrawerOpen(false)}
            onPendingChange={setIsSubmitting}
          />
        )}
      </StandardDrawer>
    </>
  );
}
