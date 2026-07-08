"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { formatRupiah } from "@/lib/format";
import type { PnLReport } from "../../keuangan/actions";
import { TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const MONTHS = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

const CATEGORY_LABELS: Record<string, string> = {
  GAJI:        "Gaji & Tunjangan",
  UTILITAS:    "Utilitas",
  OPERASIONAL: "Operasional",
  LAINNYA:     "Lain-lain",
};

function pct(part: number, total: number): string {
  if (total === 0) return "â€“";
  return `${((part / total) * 100).toFixed(1)}%`;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// P&L Line Row
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface LineRowProps {
  label: string;
  value: number;
  indent?: 0 | 1 | 2;
  bold?: boolean;
  highlight?: "positive" | "negative" | "neutral";
  separator?: "top" | "double";
  percentage?: string;
  showSign?: boolean;
}

function LineRow({
  label, value, indent = 0, bold = false,
  highlight, separator, percentage, showSign = false,
}: LineRowProps) {
  const indentCls = ["pl-4", "pl-8", "pl-12"][indent];

  const valueCls = cn(
    "tabular-nums font-mono",
    bold ? "font-bold" : "font-medium",
    highlight === "positive" && "text-emerald-700",
    highlight === "negative" && "text-red-600",
    highlight === "neutral"  && "text-zinc-600",
    !highlight && "text-zinc-800",
  );

  const rowCls = cn(
    "grid grid-cols-[1fr_auto_auto] items-center gap-x-2 sm:gap-x-6 px-4 sm:px-5 py-2.5",
    separator === "double" && "border-t-2 border-double border-zinc-300 mt-1",
    separator === "top"    && "border-t border-zinc-200",
    bold ? "bg-zinc-50/70" : "hover:bg-zinc-50/50",
  );

  return (
    <div className={rowCls}>
      <span className={cn("text-sm", indentCls, bold ? "font-semibold text-zinc-800" : "text-zinc-600")}>
        {label}
      </span>
      <span className="text-xs text-zinc-400 text-right min-w-[40px] sm:min-w-[48px]">
        {percentage ?? ""}
      </span>
      <span className={cn("text-sm text-right min-w-[100px] sm:min-w-[160px]", valueCls)}>
        {showSign && value > 0 ? "+" : ""}
        {value < 0 ? `(${formatRupiah(Math.abs(value))})` : formatRupiah(value)}
      </span>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Section Header
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="bg-zinc-100/80 px-5 py-2 mt-3">
      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Month Navigator
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function MonthNavigator({ month, year }: { month: number; year: number }) {
  const router    = useRouter();
  const pathname  = usePathname();
  const sp        = useSearchParams();

  const navigate = (m: number, y: number) => {
    const params = new URLSearchParams(sp.toString());
    params.set("month", String(m));
    params.set("year",  String(y));
    router.push(`${pathname}?${params.toString()}`);
  };

  const prev = () => {
    if (month === 1) navigate(12, year - 1);
    else navigate(month - 1, year);
  };

  const next = () => {
    const now = new Date();
    const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();
    if (isCurrentMonth) return;
    if (month === 12) navigate(1, year + 1);
    else navigate(month + 1, year);
  };

  const now = new Date();
  const isCurrentMonth = month === now.getMonth() + 1 && year === now.getFullYear();

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" className="h-8 w-8" onClick={prev}>
        <ChevronLeft size={14} />
      </Button>
      <span className="min-w-[100px] sm:min-w-[130px] text-center text-sm font-semibold text-zinc-800">
        {MONTHS[month - 1]} {year}
      </span>
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8"
        onClick={next}
        disabled={isCurrentMonth}
      >
        <ChevronRight size={14} />
      </Button>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// KPI Summary Cards
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface KpiCardProps {
  label: string;
  value: number;
  subtitle?: string;
  variant: "emerald" | "rose" | "blue" | "violet";
  icon: React.ReactNode;
}

function KpiCard({ label, value, subtitle, variant, icon }: KpiCardProps) {
  const colors = {
    emerald: { bg: "bg-emerald-50",  text: "text-emerald-700",  icon: "bg-emerald-100 text-emerald-600" },
    rose:    { bg: "bg-rose-50",     text: "text-rose-700",     icon: "bg-rose-100 text-rose-600"       },
    blue:    { bg: "bg-blue-50",     text: "text-blue-700",     icon: "bg-blue-100 text-blue-600"       },
    violet:  { bg: "bg-violet-50",   text: "text-violet-700",   icon: "bg-violet-100 text-violet-600"   },
  }[variant];

  return (
    <div className={cn("rounded-2xl border border-white/60 p-4 backdrop-blur-sm shadow-sm", colors.bg)}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-zinc-500">{label}</p>
          <p className={cn("mt-1 font-mono text-lg font-black tabular-nums", colors.text)}>
            {value < 0 ? `(${formatRupiah(Math.abs(value))})` : formatRupiah(value)}
          </p>
          {subtitle && <p className="mt-0.5 text-[11px] text-zinc-400">{subtitle}</p>}
        </div>
        <div className={cn("shrink-0 rounded-xl p-2", colors.icon)}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main Client
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface PnLReportClientProps {
  report: PnLReport;
}

export function PnLReportClient({ report }: PnLReportClientProps) {
  const { month, year, revenue, cogs, grossProfit, opex, netProfit, opexBreakdown } = report;

  const grossMargin = pct(grossProfit, revenue);
  const netMargin   = pct(netProfit, revenue);
  const cogsRatio   = pct(cogs, revenue);
  const opexRatio   = pct(opex, revenue);

  return (
    <StandardPageLayout
      title="Laporan Laba Rugi"
      description={`Profit & Loss Statement Â· ${MONTHS[month - 1]} ${year}`}
      actionButton={<div className="flex items-center gap-2"><MonthNavigator month={month} year={year} /><Button onClick={() => window.print()} variant="outline" className="h-8 gap-1.5 border-white/60 bg-white/40 shadow-sm print:hidden"><FileText size={14} /> Cetak PDF</Button></div>}
    >
      {/* â”€â”€ KPI Summary Row â”€â”€ */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          label="Total Pendapatan"
          value={revenue}
          subtitle="Revenue dari nota terjual"
          variant="blue"
          icon={<TrendingUp size={16} />}
        />
        <KpiCard
          label="Laba Kotor"
          value={grossProfit}
          subtitle={`Gross Margin: ${grossMargin}`}
          variant="emerald"
          icon={<TrendingUp size={16} />}
        />
        <KpiCard
          label="Total Beban (OPEX)"
          value={opex}
          subtitle={`${opexRatio} dari revenue`}
          variant="rose"
          icon={<TrendingDown size={16} />}
        />
        <KpiCard
          label="Laba Bersih"
          value={netProfit}
          subtitle={`Net Margin: ${netMargin}`}
          variant={netProfit >= 0 ? "violet" : "rose"}
          icon={netProfit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
        />
      </div>

      {/* â”€â”€ P&L Statement â”€â”€ */}
      <div className="rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-lg shadow-slate-200/40 overflow-hidden">
        {/* Statement Header */}
        <div className="border-b border-zinc-100 bg-gradient-to-r from-zinc-50 to-white px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-zinc-100 p-2">
              <FileText size={16} className="text-zinc-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-zinc-800">
                Laporan Laba Rugi
              </h2>
              <p className="text-xs text-zinc-400">
                Periode: 1 {MONTHS[month - 1]} â€“ {new Date(year, month, 0).getDate()} {MONTHS[month - 1]} {year}
              </p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[11px] text-zinc-400 uppercase tracking-wide">Nalweng Roastery</p>
              <p className="text-[11px] text-zinc-400">Dalam Rupiah (IDR)</p>
            </div>
          </div>
        </div>

        {/* â”€â”€ PENDAPATAN â”€â”€ */}
        <SectionHeader label="I. Pendapatan (Revenue)" />
        <LineRow
          label="Penjualan Produk Jadi"
          value={revenue}
          indent={1}
          percentage={pct(revenue, revenue)}
        />
        <LineRow
          label="Total Pendapatan"
          value={revenue}
          bold
          separator="top"
          percentage="100%"
        />

        {/* â”€â”€ HPP / COGS â”€â”€ */}
        <SectionHeader label="II. Harga Pokok Penjualan (HPP / COGS)" />
        <LineRow
          label="HPP Produk Terjual (snapshot saat produksi)"
          value={cogs}
          indent={1}
          percentage={cogsRatio}
        />
        <LineRow
          label="Total HPP"
          value={cogs}
          bold
          separator="top"
          percentage={cogsRatio}
        />

        {/* â”€â”€ LABA KOTOR â”€â”€ */}
        <div className="bg-emerald-50/50 border-y border-emerald-100/80">
          <LineRow
            label="LABA KOTOR (Gross Profit)"
            value={grossProfit}
            bold
            highlight={grossProfit >= 0 ? "positive" : "negative"}
            percentage={grossMargin}
          />
        </div>

        {/* â”€â”€ BEBAN OPERASIONAL â”€â”€ */}
        <SectionHeader label="III. Beban Operasional (OPEX)" />
        {opexBreakdown.length === 0 ? (
          <div className="px-5 py-3">
            <span className="text-sm italic text-zinc-400">
              Tidak ada pengeluaran tercatat bulan ini.
            </span>
          </div>
        ) : (
          opexBreakdown.map((item) => (
            <LineRow
              key={item.category}
              label={CATEGORY_LABELS[item.category] ?? item.category}
              value={item.amount}
              indent={1}
              percentage={pct(item.amount, revenue)}
            />
          ))
        )}
        <LineRow
          label="Total Beban Operasional"
          value={opex}
          bold
          separator="top"
          percentage={opexRatio}
          highlight="negative"
        />

        {/* â”€â”€ LABA BERSIH â”€â”€ */}
        <div className={cn(
          "border-y",
          netProfit >= 0 ? "bg-violet-50/50 border-violet-100/80" : "bg-red-50/50 border-red-100/80"
        )}>
          <LineRow
            label="LABA BERSIH (Net Profit)"
            value={netProfit}
            bold
            separator="double"
            highlight={netProfit >= 0 ? "positive" : "negative"}
            percentage={netMargin}
          />
        </div>

        {/* Statement Footer */}
        <div className="border-t border-zinc-100 bg-zinc-50/60 px-5 py-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400">
            <span>
              Laporan ini digenerate otomatis oleh Roastery OS Â· Nalweng
            </span>
            <span className="tabular-nums">
              Dicetak: {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
        </div>
      </div>

      {/* â”€â”€ OPEX Breakdown Visual â”€â”€ */}
      {opexBreakdown.length > 0 && (
        <div className="mt-4 rounded-3xl border border-white/60 bg-white/80 backdrop-blur-md shadow-sm overflow-hidden">
          <div className="border-b border-zinc-100 px-5 py-3">
            <h3 className="text-sm font-semibold text-zinc-700">
              Rincian Beban Operasional
            </h3>
          </div>
          <div className="divide-y divide-zinc-100">
            {opexBreakdown.map((item) => {
              const ratio = opex > 0 ? (item.amount / opex) * 100 : 0;
              return (
                <div key={item.category} className="flex items-center gap-4 px-5 py-3">
                  <div className="min-w-[100px] sm:min-w-[160px] text-sm font-medium text-zinc-700">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </div>
                  <div className="flex-1">
                    <div className="h-2 rounded-full bg-zinc-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-rose-400 transition-all"
                        style={{ width: `${Math.max(ratio, 2)}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[80px] tabular-nums text-xs font-mono text-zinc-500">
                    {ratio.toFixed(1)}%
                  </div>
                  <div className="text-right min-w-[100px] sm:min-w-[140px] tabular-nums text-sm font-semibold text-zinc-800 font-mono">
                    {formatRupiah(item.amount)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* â”€â”€ Net Profit Summary â”€â”€ */}
      <div className={cn(
        "mt-4 rounded-3xl border p-5 flex items-center justify-between",
        netProfit >= 0
          ? "border-emerald-200/60 bg-emerald-50/60"
          : "border-red-200/60 bg-red-50/60"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "rounded-xl p-2.5",
            netProfit >= 0 ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600"
          )}>
            {netProfit >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          </div>
          <div>
            <p className="text-xs font-medium text-zinc-500">
              Laba Bersih Â· {MONTHS[month - 1]} {year}
            </p>
            <p className={cn(
              "text-xl font-black font-mono tabular-nums",
              netProfit >= 0 ? "text-emerald-700" : "text-red-600"
            )}>
              {netProfit < 0
                ? `(${formatRupiah(Math.abs(netProfit))})`
                : formatRupiah(netProfit)}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-zinc-400">Net Profit Margin</p>
          <p className={cn(
            "text-2xl font-black tabular-nums",
            netProfit >= 0 ? "text-emerald-600" : "text-red-500"
          )}>
            {netMargin}
          </p>
        </div>
      </div>
    </StandardPageLayout>
  );
}


