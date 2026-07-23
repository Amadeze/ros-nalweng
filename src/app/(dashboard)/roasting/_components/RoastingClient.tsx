"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Flame, Loader2, Plus, Scale, Thermometer, Percent } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { GlassPanel } from "@/components/ui/glass-panel";
import { SectionHeader } from "@/components/ui/section-header";
import { StandardDrawer } from "@/components/StandardDrawer";
import { RoastingHistoryTable } from "./RoastingHistoryTable";
import { RoastingForm } from "./RoastingForm";
import { formatKg } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GBStockOption, RBProductOption, ParentRoastingBatchRow, MachineOption } from "../actions";

interface RoastingClientProps {
  batches: ParentRoastingBatchRow[];
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
  machineOptions: MachineOption[];
}

function trendDirection(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  return values[values.length - 1] >= values[0] ? "up" : "down";
}

function trendData(values: number[]): { v: number }[] {
  return values.map((v) => ({ v }));
}

function KpiCard({
  label, value, trend, color, icon,
}: {
  label: string; value: string; trend: number[]; color: string;
  icon: React.ReactNode;
}) {
  const dir = trendDirection(trend);
  return (
    <div className="glass-card p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-tertiary)]">{label}</p>
        <span className="flex h-6 w-6 items-center justify-center rounded-md text-[var(--text-tertiary)]">{icon}</span>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div className="min-w-0">
          <p className="text-lg font-black tabular-nums leading-none text-[var(--text-primary)]">{value}</p>
          {trend.length >= 2 && (
            <p className={cn(
              "mt-1 text-[10px] font-semibold flex items-center gap-0.5",
              dir === "up" ? "text-emerald-600" : dir === "down" ? "text-red-500" : "text-[var(--text-tertiary)]",
            )}>
              {dir === "up" ? "\u2191" : dir === "down" ? "\u2193" : "\u2013"} 7 hari
            </p>
          )}
        </div>
        {trend.length >= 2 && (
          <div className="h-8 w-20 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData(trend)} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

export function RoastingClient({ batches, gbOptions, rbOptions, machineOptions }: RoastingClientProps) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { kpi, batchTrend, gbTrend, rbTrend, lossTrend } = useMemo(() => {
    const validBatches = batches.filter(b => b.status === "COMPLETED");
    const totalGB = validBatches.reduce((sum, b) => sum + b.targetWeightKg, 0);
    const totalRB = validBatches.reduce((sum, b) => sum + (b.actualOutputKg ?? 0), 0);
    const avgLoss = totalGB > 0
      ? ((totalGB - totalRB) / totalGB) * 100
      : 0;

    const dailyBatch = new Map<string, number>();
    const dailyGB = new Map<string, number>();
    const dailyRB = new Map<string, number>();
    for (const b of batches) {
      const date = b.createdAt.split("T")[0];
      dailyBatch.set(date, (dailyBatch.get(date) || 0) + 1);
      dailyGB.set(date, (dailyGB.get(date) || 0) + b.targetWeightKg);
      dailyRB.set(date, (dailyRB.get(date) || 0) + (b.actualOutputKg ?? 0));
    }
    const sortedDates = [...dailyBatch.keys()].sort().slice(-7);
    const bTrend = sortedDates.map((d) => dailyBatch.get(d) || 0);
    const gTrend = sortedDates.map((d) => dailyGB.get(d) || 0);
    const rTrend = sortedDates.map((d) => dailyRB.get(d) || 0);
    const lTrend = sortedDates.map((d) => {
      const dayBatches = batches.filter((b) => b.createdAt.split("T")[0] === d && b.status === "COMPLETED");
      const losses = dayBatches.map((b) => b.totalShrinkagePercent ?? 0).filter((l) => l > 0);
      return losses.length > 0 ? losses.reduce((s, l) => s + l, 0) / losses.length : avgLoss;
    });

    return {
      kpi: { count: batches.length, totalGB, totalRB, avgLoss },
      batchTrend: bTrend, gbTrend: gTrend, rbTrend: rTrend, lossTrend: lTrend,
    };
  }, [batches]);

  return (
    <>
      <div className="flex min-h-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg-hover)] shadow-[var(--glass-shadow)]">
          <div className="mx-auto flex min-h-[64px] w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-3 md:px-6 lg:px-8">
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-lg font-bold tracking-tight text-[var(--text-primary)] md:text-xl">Roasting</h1>
              <p className="mt-0.5 truncate text-xs text-[var(--text-secondary)]">{batches.length} batch tercatat</p>
            </div>
            <Button size="default" variant="default" className="gap-2 px-5" onClick={() => setDrawerOpen(true)}>
              <Flame size={16} />
              Mulai Roasting
            </Button>
          </div>
        </header>

        <div className="custom-scrollbar flex-1 overflow-auto">
          <div className="mx-auto max-w-[1600px] p-4 md:p-6 lg:p-8">

            {/* KPI row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <KpiCard label="Total Batch" value={String(kpi.count)} trend={batchTrend} color="var(--amber-deep)" icon={<Flame size={12} />} />
              <KpiCard label="GB Diproses" value={`${kpi.totalGB.toFixed(1)} kg`} trend={gbTrend} color="var(--moss)" icon={<Scale size={12} />} />
              <KpiCard label="RB Dihasilkan" value={`${kpi.totalRB.toFixed(1)} kg`} trend={rbTrend} color="var(--amber-warm)" icon={<Thermometer size={12} />} />
              <KpiCard label="Rata-rata Loss" value={`${kpi.avgLoss.toFixed(1)}%`} trend={lossTrend} color="var(--accent)" icon={<Percent size={12} />} />
            </div>

            {/* Table */}
            <GlassPanel padding="md">
              <RoastingHistoryTable batches={batches} machineOptions={machineOptions} />
            </GlassPanel>

          </div>
        </div>
      </div>

      <StandardDrawer
        open={drawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setDrawerOpen(open); }}
        title="Catat Roasting Batch"
        description="Stok Green Bean akan dipotong dan Roasted Bean bertambah otomatis."
        size="lg"
        submitButton={
          <Button type="submit" form="roasting-form" size="sm" disabled={isSubmitting || gbOptions.length === 0} className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 shadow-md rounded-xl font-bold disabled:opacity-60">
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Batch"}
          </Button>
        }
      >
        {gbOptions.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-zinc-200 py-12">
            <Plus size={24} className="text-zinc-300" />
            <p className="text-sm font-medium text-zinc-500">Tidak ada Green Bean tersedia</p>
            <p className="text-xs text-zinc-400">Catat Barang Datang di halaman Inventory terlebih dahulu.</p>
          </div>
        ) : (
          <RoastingForm
            id="roasting-form"
            gbOptions={gbOptions}
            rbOptions={rbOptions}
            machineOptions={machineOptions}
            batches={batches}
            onSuccess={() => { setDrawerOpen(false); router.refresh(); }}
            onPendingChange={setIsSubmitting}
          />
        )}
      </StandardDrawer>
    </>
  );
}
