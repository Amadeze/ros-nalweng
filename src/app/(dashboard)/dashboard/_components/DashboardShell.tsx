import Link from "next/link";
import {
  Banknote, Clock, AlertTriangle, TrendingUp,
  Package, Flame, Factory, ReceiptText, Inbox,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatKg, formatUnit, formatDate } from "@/lib/format";
import type { DashboardData, ActivityItem, LowStockItem } from "../actions";
import { RevenueChart } from "./RevenueChart";
import { TopProductsChart } from "./TopProductsChart";

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
  accent?:     "zinc" | "emerald" | "amber" | "red";
  href?:       string;
}

function KpiCard({ label, value, sub, icon, accent = "zinc", href }: KpiCardProps) {
  const iconBg: Record<string, string> = {
    zinc:    "bg-slate-100/60  text-slate-600",
    emerald: "bg-emerald-100/60 text-emerald-700",
    amber:   "bg-amber-100/60   text-amber-700",
    red:     "bg-red-100/60     text-red-700",
  };
  const valueCls: Record<string, string> = {
    zinc:    "text-slate-800",
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    red:     "text-red-600",
  };

  const content = (
    <div className="group relative flex flex-col gap-4 rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 p-5 shadow-lg shadow-slate-200/30 backdrop-blur-xl transition-all hover:bg-white/50 hover:shadow-xl hover:shadow-slate-200/40">
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
        {sub && <div className="mt-2 text-xs text-slate-500">{sub}</div>}
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
  PACKAGING:     "bg-blue-100/80 text-blue-700",
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
          <p className="mt-2 text-xs text-slate-500">Tidak ada stok di bawah batas minimum</p>
        </div>
      ) : (
        <div>
          <p className={`font-mono text-2xl md:text-3xl font-black tabular-nums leading-none ${valueCls[accent]}`}>
            {items.length} item
          </p>
          <p className="mt-1.5 mb-3 text-xs text-slate-500">Perlu segera diisi ulang</p>
          <div className="space-y-2">
            {items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2 border-b border-white/30 pb-1.5 last:border-0 last:pb-0">
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
              </div>
            ))}
            {items.length > 4 && (
              <p className="text-[11px] text-slate-500 font-medium pt-1">+{items.length - 4} lainnya</p>
            )}
          </div>
        </div>
      )}
    </div>
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
    iconBg: "bg-blue-100 text-blue-600",
    href:   "/penjualan",
  },
};

const ACTIVITY_STATUS_CLS: Record<string, string> = {
  Selesai:  "bg-emerald-100/60 text-emerald-700 border-emerald-200/60",
  Lunas:    "bg-emerald-100/60 text-emerald-700 border-emerald-200/60",
  Proses:   "bg-blue-100/60 text-blue-700 border-blue-200/60",
  Tempo:    "bg-amber-100/60 text-amber-700 border-amber-200/60",
  Sebagian: "bg-blue-100/60 text-blue-700 border-blue-200/60",
  Draft:    "bg-white/40 text-slate-600 border-white/60",
  Void:     "bg-slate-100/60 text-slate-400 border-slate-200/60",
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
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
              title={formatTimestamp(item.timestamp)}
            >
              {formatTimeAgo(item.timestamp)}
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

  const todayLabel = new Intl.DateTimeFormat("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  }).format(new Date());

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* ── Header ── */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/20 px-4 md:px-6 backdrop-blur-md">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight">Dashboard</h1>
          <p className="mt-0.5 text-xs font-medium text-slate-500">{todayLabel}</p>
        </div>
        <p className="hidden sm:block text-[11px] font-medium text-slate-400 bg-white/40 px-2.5 py-1 rounded-full border border-white/50 shadow-sm backdrop-blur-sm">
          Diperbarui {formatTimeAgo(asOf)}
        </p>
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto p-4 md:p-6 space-y-6">

        {/* ── 4 KPI Cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">

          {/* Card 1 — Revenue */}
          <KpiCard
            label="Pendapatan Hari Ini"
            value={formatRupiah(kpi.revenueToday)}
            sub={
              kpi.revenueToday > 0
                ? "Nota PAID yang diterbitkan hari ini"
                : "Belum ada nota lunas hari ini"
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

          {/* Card 4 — Stok Tipis */}
          <LowStockCard items={lowStock} />

        </div>

        {/* ── Charts ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          <div className="lg:col-span-8">
            <RevenueChart data={data.revenueTrend} />
          </div>
          <div className="lg:col-span-4">
            <TopProductsChart data={data.topProducts} />
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
    </div>
  );
}