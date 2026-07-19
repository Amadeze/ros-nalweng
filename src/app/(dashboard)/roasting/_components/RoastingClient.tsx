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
            className="gap-2 bg-amber-700 text-white hover:bg-amber-800 shadow-md hover:shadow-lg rounded-xl font-semibold px-5 transition-all group"
            onClick={() => setDrawerOpen(true)}
          >
            <Flame size={16} className="group-hover:scale-110 transition-transform" />
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
        <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-4">
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-orange-50 to-amber-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Flame size={48} className="text-orange-600" /></div>
            <p className="text-xs font-medium text-orange-600 relative z-10">Total Batch Roasting</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-orange-700 relative z-10">{kpi.count}</p>
          </div>
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-emerald-50 to-green-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Scale size={48} className="text-emerald-600" /></div>
            <p className="text-xs font-medium text-emerald-600 relative z-10">Green Bean Diproses</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-emerald-700 relative z-10">{kpi.totalGB.toFixed(1)} <span className="text-sm">kg</span></p>
          </div>
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-amber-50 to-yellow-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Thermometer size={48} className="text-amber-600" /></div>
            <p className="text-xs font-medium text-amber-600 relative z-10">Roasted Bean Dihasilkan</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-amber-700 relative z-10">{kpi.totalRB.toFixed(1)} <span className="text-sm">kg</span></p>
          </div>
          <div className="min-h-[108px] rounded-2xl border border-white/60 bg-gradient-to-br from-rose-50 to-red-50 p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity"><Percent size={48} className="text-rose-600" /></div>
            <p className="text-xs font-medium text-rose-600 relative z-10">Rata-rata Roast Loss</p>
            <p className="mt-1 font-mono text-2xl font-black tabular-nums text-rose-700 relative z-10">{kpi.avgLoss.toFixed(1)}%</p>
          </div>
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
