"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Flame, Loader2, Plus, Scale, Thermometer, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { RoastingHistoryTable } from "./RoastingHistoryTable";
import { RoastingForm } from "./RoastingForm";
import type { GBStockOption, RBProductOption, ParentRoastingBatchRow } from "../actions";

interface RoastingClientProps {
  batches: ParentRoastingBatchRow[];
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
}

export function RoastingClient({ batches, gbOptions, rbOptions }: RoastingClientProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const kpi = useMemo(() => {
    const validBatches = batches.filter(b => b.status === "COMPLETED");
    const totalGB = validBatches.reduce((sum, b) => sum + b.targetWeightKg, 0);
    const totalRB = validBatches.reduce((sum, b) => sum + (b.actualOutputKg ?? 0), 0);
    const avgLoss = validBatches.length > 0 
      ? validBatches.reduce((sum, b) => sum + (b.totalShrinkagePercent ?? 0), 0) / validBatches.length
      : 0;
    
    return {
      count: batches.length,
      totalGB,
      totalRB,
      avgLoss
    };
  }, [batches]);

  return (
    <>
      <StandardPageLayout
        title="Roasting"
        description={`${batches.length} batch tercatat · stok GB & RB diupdate otomatis`}
        actionButton={
          <Button
            size="default"
            className="gap-2 rounded-lg bg-stone-900 px-5 font-semibold text-white shadow-none hover:bg-stone-800"
            onClick={() => setDrawerOpen(true)}
          >
            <Flame size={16} />
            Mulai Roasting
          </Button>
        }
        mobileFabAction={{
          label: "Mulai Roasting",
          icon: <Flame size={22} />,
          onClick: () => setDrawerOpen(true),
          "aria-label": "Mulai roasting",
        }}
      >
        <div className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-stone-200 bg-white xl:grid-cols-4">
          {[
            { label: "Total batch", value: kpi.count, icon: Flame, tone: "bg-orange-50 text-orange-700" },
            { label: "Green bean diproses", value: `${kpi.totalGB.toFixed(1)} kg`, icon: Scale, tone: "bg-emerald-50 text-emerald-700" },
            { label: "Roasted bean", value: `${kpi.totalRB.toFixed(1)} kg`, icon: Thermometer, tone: "bg-amber-50 text-amber-700" },
            { label: "Rata-rata roast loss", value: `${kpi.avgLoss.toFixed(1)}%`, icon: Percent, tone: "bg-rose-50 text-rose-700" },
          ].map((metric, index) => (
            <div key={metric.label} className={`min-w-0 p-4 sm:p-5 ${index % 2 === 0 ? "border-r border-stone-200" : ""} ${index < 2 ? "border-b border-stone-200 xl:border-b-0" : ""} ${index === 1 || index === 2 ? "xl:border-r" : ""}`}>
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
            className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 shadow-md rounded-xl font-bold disabled:opacity-60"
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
            batches={batches}
            onSuccess={() => { setDrawerOpen(false); router.refresh(); }}
            onPendingChange={setIsSubmitting}
          />
        )}
      </StandardDrawer>
    </>
  );
}
