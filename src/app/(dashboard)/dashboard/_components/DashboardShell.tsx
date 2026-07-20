"use client";

import Link from "next/link";
import {
  Banknote, Clock, AlertTriangle, TrendingUp,
  Package, Flame, Factory, ReceiptText, Inbox,
  ArrowRight, ShoppingCart, Beaker
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatKg, formatUnit } from "@/lib/format";
import type { DashboardData, ActivityItem, LowStockItem } from "../actions";
import { RevenueChart } from "./RevenueChart";
import { TopProductsChart } from "./TopProductsChart";
import { TopCustomersChart } from "./TopCustomersChart";
import { useState, useEffect } from "react";
import { getCurrentDate } from "@/lib/date-utils";
import { StandardPageLayout } from "@/components/StandardPageLayout";

// =============================================================================
// Helpers
// =============================================================================

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)  return "Baru saja";
  if (mins  < 60) return `${mins}m lalu`;
  if (hours < 24) return `${hours}j lalu`;
  return `${days}h lalu`;
}

function formatTimestamp(iso: string): string {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  }).format(new Date(iso));
}

// =============================================================================
// KPI Card
// =============================================================================

interface KpiCardProps {
  label:       string;
  value:       string;
  sub?:        React.ReactNode;
  icon:        React.ReactNode;
  accent?:     "zinc" | "emerald" | "amber" | "red" | "violet";
  href?:       string;
}

function KpiCard({ label, value, sub, icon, accent = "zinc", href }: KpiCardProps) {
  const iconBg: Record<string, string> = {
    zinc:    "bg-slate-100/60  text-slate-600",
    emerald: "bg-emerald-100/60 text-emerald-700",
    amber:   "bg-amber-100/60   text-amber-700",
    red:     "bg-red-100/60     text-red-700",
    violet:  "bg-violet-100/60  text-violet-700",
  };
  const valueCls: Record<string, string> = {
    zinc:    "text-slate-800",
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    red:     "text-red-600",
    violet:  "text-violet-700",
  };

  const content = (
    <div className="group relative flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-5 transition-colors hover:border-stone-300">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none">
          {label}
        </p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm border border-white/50 backdrop-blur-md ${iconBg[accent]}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className={`font-mono text-2xl md:text-3xl font-black tabular-nums leading-none ${valueCls[accent]}`}>
          {value}
        </p>
        {sub && <div className="mt-2 text-xs text-slate-600">{sub}</div>}
      </div>
      {href && (
        <ArrowRight
          size={14}
          className="absolute bottom-5 right-5 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-slate-500"
        />
      )}
    </div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

// =============================================================================
// Low Stock Alert Panel
// =============================================================================

const TYPE_LABEL: Record<string, string> = {
  GREEN_BEAN:    "GB",
  ROASTED_BEAN:  "RB",
  FINISHED_GOODS:"FG",
  PACKAGING:     "PKG",
};
const TYPE_COLOR: Record<string, string> = {
  GREEN_BEAN:    "bg-lime-100/80 text-lime-700",
  ROASTED_BEAN:  "bg-amber-100/80 text-amber-700",
  FINISHED_GOODS:"bg-violet-100/80 text-violet-700",
  PACKAGING:     "bg-stone-100/80 text-stone-700",
};

function LowStockCard({ items }: { items: LowStockItem[] }) {
  const accent = items.length === 0 ? "zinc" : items.length <= 2 ? "amber" : "red";
  const iconBg: Record<string, string> = {
    zinc:  "bg-slate-100/60 text-slate-600",
    amber: "bg-amber-100/60 text-amber-700",
    red:   "bg-red-100/60 text-red-700",
  };
  const valueCls: Record<string, string> = {
    zinc:  "text-slate-800",
    amber: "text-amber-700",
    red:   "text-red-600",
  };

  return (
    <div className="flex flex-col gap-3 rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-xl">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide leading-none">
          Peringatan Stok Tipis
        </p>
        <span className={`flex h-8 w-8 items-center justify-center rounded-xl shadow-sm border border-white/50 backdrop-blur-md ${iconBg[accent]}`}>
          <AlertTriangle size={14} />
        </span>
      </div>

      {items.length === 0 ? (
        <div className="mt-1">
          <p className="font-mono text-2xl md:text-3xl font-black tabular-nums text-slate-800 leading-none">
            Semua aman
          </p>
          <p className="mt-2 text-xs text-slate-600">Tidak ada stok di bawah batas minimum</p>
        </div>
      ) : (
        <div>
          <p className={`font-mono text-2xl md:text-3xl font-black tabular-nums leading-none ${valueCls[accent]}`}>
            {items.length} item
          </p>
          <p className="mt-1.5 mb-3 text-xs text-slate-600">Perlu segera diisi ulang</p>
          <div className="space-y-2">
            {items.slice(0, 4).map((item) => (
              <Link 
                key={item.id} 
                href={`/inventory?tab=${item.type === 'GREEN_BEAN' ? 'gb' : item.type === 'ROASTED_BEAN' ? 'rb' : item.type === 'FINISHED_GOODS' ? 'fg' : 'pkg'}`}
                className="flex items-center justify-between gap-2 border-b border-white/30 pb-1.5 last:border-0 last:pb-0 hover:bg-white/40 rounded px-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase ${TYPE_COLOR[item.type]}`}>
                    {TYPE_LABEL[item.type]}
                  </span>
                  <span className="truncate text-xs font-medium text-slate-700">{item.name}</span>
                </div>
                <span className="shrink-0 font-mono text-xs font-bold text-red-600">
                  {item.unit === "kg"
                    ? formatKg(item.stock)
                    : formatUnit(item.stock)}
                </span>
              </Link>
            ))}
            {items.length > 4 && (
              <p className="text-[11px] text-slate-600 font-medium pt-1">+{items.length - 4} lainnya</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function DailyBriefCard({ brief }: { brief: NonNullable<DashboardData["dailyBrief"]> }) {
  const dateLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${brief.reportDate}T00:00:00.000Z`));

  return (
    <section className="overflow-hidden rounded-[1.5rem] border border-amber-200/60 bg-gradient-to-br from-amber-50/90 via-white/70 to-emerald-50/70 shadow-lg shadow-amber-900/5 backdrop-blur-xl md:rounded-3xl">
      <div className="flex flex-col gap-3 border-b border-amber-200/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">Morning brief</p>
          <h2 className="mt-1 text-base font-bold text-slate-900">Ringkasan {dateLabel}</h2>
        </div>
        <Badge variant="outline" className="w-fit border-emerald-200 bg-emerald-50 text-emerald-700">
          Snapshot tersimpan · {brief.timezone}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-px bg-amber-200/40 lg:grid-cols-5">
        {[
          ["Penjualan akrual", formatRupiah(brief.salesAccrued), `${brief.invoiceCount} nota`],
          ["Kas diterima", formatRupiah(brief.cashCollected), "Pembayaran aktual"],
          ["Roasting", `${brief.roasting.yieldPercent.toFixed(1)}%`, `${brief.roasting.batchCount} batch · ${formatKg(brief.roasting.outputKg)}`],
          ["Produksi", formatUnit(brief.production.unitsProduced), `${brief.production.batchCount} batch selesai`],
          ["Sample", `${brief.samples?.packCount ?? 0} pack`, `${(brief.samples?.totalGrams ?? 0).toLocaleString("id-ID")} g · ${formatRupiah(brief.samples?.totalCost ?? 0)}`],
        ].map(([label, value, detail]) => (
          <div key={label} className="bg-white/65 px-5 py-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-2 font-mono text-xl font-black tabular-nums text-slate-900">{value}</p>
            <p className="mt-1 text-xs text-slate-500">{detail}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 px-5 py-4 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-wrap gap-2">
          {brief.actions.map((action) => (
            <Link
              key={`${action.href}-${action.label}`}
              href={action.href}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-white ${
                action.severity === "CRITICAL"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : action.severity === "WARNING"
                    ? "border-amber-200 bg-amber-50 text-amber-800"
                    : "border-emerald-200 bg-emerald-50 text-emerald-700"
              }`}
            >
              <AlertTriangle size={12} />
              {action.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-4 text-xs font-semibold text-slate-600">
          <span>Piutang lewat tempo: {formatRupiah(brief.receivables.overdueTotal)}</span>
          <span>Hutang lewat tempo: {formatRupiah(brief.payables.overdueTotal)}</span>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// Activity Feed
// =============================================================================

const ACTIVITY_META: Record<ActivityItem["type"], {
  label: string;
  icon: React.ReactNode;
  iconBg: string;
  href: string;
}> = {
  PURCHASE:   {
    label:  "Barang Datang",
    icon:   <Package size={12} />,
    iconBg: "bg-lime-100 text-lime-700",
    href:   "/inventory",
  },
  ROASTING:   {
    label:  "Roasting",
    icon:   <Flame size={12} />,
    iconBg: "bg-orange-100 text-orange-600",
    href:   "/roasting",
  },
  PRODUCTION: {
    label:  "Produksi",
    icon:   <Factory size={12} />,
    iconBg: "bg-violet-100 text-violet-600",
    href:   "/produksi",
  },
  SALE:       {
    label:  "Penjualan",
    icon:   <ReceiptText size={12} />,
    iconBg: "bg-blue-100 text-amber-800",
    href:   "/penjualan",
  },
};

const ACTIVITY_STATUS_CLS: Record<string, string> = {
  Selesai:  "bg-emerald-100/60 text-emerald-700 border-emerald-200/60",
  Lunas:    "bg-emerald-100/60 text-emerald-700 border-emerald-200/60",
  Proses:   "bg-blue-100/60 text-amber-800 border-blue-200/60",
  Tempo:    "bg-amber-100/60 text-amber-700 border-amber-200/60",
  Sebagian: "bg-blue-100/60 text-amber-800 border-blue-200/60",
  Draft:    "bg-white/40 text-slate-600 border-white/60",
  Void:     "bg-slate-100/60 text-slate-400 border-slate-200/60",
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center bg-white/20">
        <span className="rounded-full bg-white/50 border border-white/60 shadow-sm p-3">
          <Inbox size={20} className="text-slate-400" />
        </span>
        <p className="text-sm font-semibold text-slate-500 mt-2">Belum ada aktivitas</p>
        <p className="text-xs text-slate-400">Mulai catat transaksi pertama via modul di sidebar.</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10">
      {items.map((item, i) => {
        const meta      = ACTIVITY_META[item.type];
        const statusCls = ACTIVITY_STATUS_CLS[item.status] ?? "bg-white/40 text-slate-500 border-white/60";

        return (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center gap-4 px-4 md:px-5 py-3.5 transition-colors hover:bg-white/40 ${
              i < items.length - 1 ? "border-b border-white/30" : ""
            }`}
          >
            {/* Type icon */}
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg shadow-sm border border-white/50 backdrop-blur-sm ${meta.iconBg}`}>
              {meta.icon}
            </span>

            {/* Code */}
            <span className="w-28 md:w-32 shrink-0 font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {item.code}
            </span>

            {/* Description */}
            <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-600">
              {item.description}
            </span>

            {/* Amount */}
            <span className="w-24 md:w-28 shrink-0 text-right font-mono text-xs font-bold text-slate-800 tabular-nums">
              {item.amount !== null ? formatRupiah(item.amount) : "—"}
            </span>

            {/* Status badge */}
            <span className="w-20 shrink-0 text-right">
              <Badge
                variant="outline"
                className={`text-[10px] font-semibold backdrop-blur-sm ${statusCls}`}
              >
                {item.status}
              </Badge>
            </span>

            {/* Time ago */}
            <span
              className="w-16 shrink-0 text-right text-[10px] font-medium text-slate-400"
              title={mounted ? formatTimestamp(item.timestamp) : ""}
            >
              {mounted ? formatTimeAgo(item.timestamp) : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================================================
// Main Shell
// =============================================================================

export function DashboardShell({ data }: { data: DashboardData }) {
  const { kpi, lowStock, activity, asOf } = data;
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => setMounted(true), []);

  const todayLabel = mounted ? new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(getCurrentDate()) : "";

  return (
    <StandardPageLayout
      title="Dashboard"
      description={todayLabel}
      actionButton={
        <p className="rounded-full border border-stone-200 bg-white/70 px-3 py-1.5 text-[11px] font-medium text-stone-500 shadow-sm">
          Diperbarui {mounted ? formatTimeAgo(asOf) : ""}
        </p>
      }
    >
      {/* ── Header ── */}
      {/* ── Scrollable content ── */}
      <div className="space-y-6">

        {/* ── Quick Actions ── */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/penjualan" className="flex items-center gap-2 rounded-full bg-amber-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-950/20 transition-all hover:bg-amber-800 hover:shadow-lg active:scale-95">
            <ReceiptText size={16} />
            Buat Nota
          </Link>
          <Link href="/penjualan?action=sample" className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-900 shadow-sm transition-all hover:bg-amber-100">
            <Beaker size={14} />
            Kasih Sample
          </Link>
          <Link href="/roasting" className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:text-slate-900">
            <Flame size={14} />
            Roasting
          </Link>
          <Link href="/produksi" className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:text-slate-900">
            <Factory size={14} />
            Produksi
          </Link>
          <Link href="/inventory" className="flex items-center gap-2 rounded-full border border-white/60 bg-white/40 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/60 hover:text-slate-900">
            <Package size={14} />
            Terima Barang
          </Link>
        </div>

        {/* ── KPI Cards ── */}
        {/* ── KPI Cards ── */}
        {data.dailyBrief && <DailyBriefCard brief={data.dailyBrief} />}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 md:gap-5">

          {/* Card 1 — Revenue */}
          <KpiCard
            label="Pendapatan Hari Ini"
            value={formatRupiah(kpi.revenueToday)}
            sub={
              kpi.revenueToday > 0
                ? "Penjualan akrual yang diterbitkan hari ini"
                : "Belum ada penjualan diterbitkan hari ini"
            }
            icon={<TrendingUp size={14} />}
            accent={kpi.revenueToday > 0 ? "emerald" : "zinc"}
            href="/penjualan"
          />

          {/* Card 2 — Kas Masuk */}
          <KpiCard
            label="Kas Masuk Hari Ini"
            value={formatRupiah(kpi.kasToday)}
            sub={
              kpi.kasToday > 0
                ? "Total pembayaran diterima hari ini"
                : "Belum ada pembayaran hari ini"
            }
            icon={<Banknote size={14} />}
            accent={kpi.kasToday > 0 ? "emerald" : "zinc"}
            href="/keuangan"
          />

          {/* Card 3 — Total Piutang */}
          <KpiCard
            label="Total Piutang"
            value={formatRupiah(kpi.totalPiutang)}
            sub={
              kpi.piutangCount > 0
                ? <span className="font-medium text-amber-600">{kpi.piutangCount} nota belum lunas</span>
                : "Tidak ada piutang outstanding"
            }
            icon={<Clock size={14} />}
            accent={kpi.totalPiutang > 0 ? "amber" : "zinc"}
            href="/keuangan"
          />

          {/* Card 4 — Total Kopi Terjual */}
          <KpiCard
            label="Total Kopi Terjual"
            value={formatKg(kpi.totalKopiTerjual)}
            sub="Total penjualan sepanjang waktu"
            icon={<ShoppingCart size={14} />}
            accent="emerald"
            href="/laporan"
          />

          {/* Card 5 — Average Roast Yield */}
          <KpiCard
            label="Rata-rata Hasil Roasting"
            value={`${kpi.averageRoastYield.toFixed(1)}%`}
            sub="Rata-rata output roasting (30 jam terakhir)"
            icon={<Flame size={14} />}
            accent={kpi.averageRoastYield >= 80 ? "emerald" : "amber"}
            href="/roasting"
          />

          {/* Card 6 — Gross Margin */}
          <KpiCard
            label="Estimasi Margin Kotor"
            value={`${kpi.averageGrossMargin.toFixed(1)}%`}
            sub="Estimasi profit margin kotor"
            icon={<TrendingUp size={14} />}
            accent="emerald"
            href="/laporan"
          />

          {/* Card 7 — Sample Bulan Ini */}
          <KpiCard
            label="Sample Bulan Ini"
            value={kpi.samplePacksMonth > 0 ? `${kpi.samplePacksMonth} pack` : "0 pack"}
            sub={kpi.sampleCostMonth > 0
              ? `Total biaya: ${formatRupiah(kpi.sampleCostMonth)}`
              : "Belum ada sample bulan ini"
            }
            icon={<Beaker size={14} />}
            accent={kpi.samplePacksMonth > 0 ? "violet" : "zinc"}
            href="/penjualan?action=sample"
          />

          {/* Card 8 — Stok Tipis */}
          <div className="lg:col-span-3 sm:col-span-2">
            <LowStockCard items={lowStock} />
          </div>

        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          <div className="lg:col-span-6 xl:col-span-6">
            <RevenueChart data={data.revenueTrend} />
          </div>
          <div className="lg:col-span-6 xl:col-span-3">
            <TopProductsChart data={data.topProducts} />
          </div>
          <div className="lg:col-span-6 xl:col-span-3">
            <TopCustomersChart data={data.topCustomers} />
          </div>
        </div>

        {/* ── Activity Feed ── */}
        <div className="overflow-hidden rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 shadow-lg shadow-slate-200/30 backdrop-blur-xl flex flex-col">
          
          {/* Section header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/40 bg-white/20 px-4 md:px-5 py-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 tracking-tight">Aktivitas Terakhir</h2>
              <p className="mt-0.5 text-[11px] font-medium text-slate-500">
                Gabungan log Barang Datang · Roasting · Produksi · Penjualan
              </p>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3">
              {(Object.entries(ACTIVITY_META) as [ActivityItem["type"], typeof ACTIVITY_META[ActivityItem["type"]]][]).map(([type, meta]) => (
                <Link
                  key={type}
                  href={meta.href}
                  className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-500 hover:text-slate-800 transition-colors bg-white/40 px-2 py-1.5 rounded-lg border border-white/50 shadow-sm"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded-lg ${meta.iconBg}`}>
                    {meta.icon}
                  </span>
                  {meta.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Responsive column layout — no horizontal scroll */}
          <div>
            {/* Column headers */}
            <div className="flex items-center gap-4 border-b border-white/30 bg-white/20 px-4 md:px-5 py-2.5">
              <span className="w-7 shrink-0" />
              <span className="w-28 md:w-32 shrink-0 text-[10px] font-bold uppercase tracking-widest text-slate-500">Kode</span>
              <span className="flex-1 text-[10px] font-bold uppercase tracking-widest text-slate-500">Keterangan</span>
              <span className="w-24 md:w-28 shrink-0 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500">Nilai</span>
              <span className="w-20 shrink-0 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden sm:block">Status</span>
              <span className="w-16 shrink-0 text-right text-[10px] font-bold uppercase tracking-widest text-slate-500 hidden md:block">Waktu</span>
            </div>

            {/* Feed Data */}
            <ActivityFeed items={activity} />
          </div>

          {/* Footer — Lihat Semua */}
          <div className="border-t border-white/30 bg-white/10 px-4 md:px-5 py-3 flex justify-end">
            <Link
              href="/penjualan"
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1"
            >
              Lihat semua
              <ArrowRight size={11} />
            </Link>
          </div>

        </div>

      </div>
    </StandardPageLayout>
  );
}
