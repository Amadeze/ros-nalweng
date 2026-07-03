import Link from "next/link";
import {
  Banknote, Clock, AlertTriangle, TrendingUp,
  Package, Flame, Factory, ReceiptText, Inbox,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatRupiah, formatKg, formatUnit, formatDate } from "@/lib/format";
import type { DashboardData, ActivityItem, LowStockItem } from "../actions";

// =============================================================================
// Helpers
// =============================================================================

function formatTimeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return "Baru saja";
  if (mins  < 60)  return `${mins}m lalu`;
  if (hours < 24)  return `${hours}j lalu`;
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
    zinc:    "bg-slate-100/80  text-slate-500",
    emerald: "bg-emerald-100/80 text-emerald-600",
    amber:   "bg-amber-100/80   text-amber-600",
    red:     "bg-red-100/80     text-red-600",
  };
  const valueCls: Record<string, string> = {
    zinc:    "text-slate-800",
    emerald: "text-emerald-700",
    amber:   "text-amber-700",
    red:     "text-red-600",
  };

  const content = (
    <div className="group relative flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-md transition-shadow hover:shadow-xl hover:shadow-slate-200/50">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none">
          {label}
        </p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${iconBg[accent]}`}>
          {icon}
        </span>
      </div>
      <div>
        <p className={`font-mono text-2xl font-black tabular-nums leading-none ${valueCls[accent]}`}>
          {value}
        </p>
        {sub && <div className="mt-1.5 text-xs text-slate-400">{sub}</div>}
      </div>
      {href && (
        <ArrowRight
          size={13}
          className="absolute bottom-4 right-4 text-slate-200 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-400"
        />
      )}
    </div>
  );

  return href ? <Link href={href} className="block">{content}</Link> : content;
}

// =============================================================================
// Low Stock Alert Panel (inside card slot 4)
// =============================================================================

const TYPE_LABEL: Record<string, string> = {
  GREEN_BEAN:    "GB",
  ROASTED_BEAN:  "RB",
  FINISHED_GOODS:"FG",
  PACKAGING:     "PKG",
};
const TYPE_COLOR: Record<string, string> = {
  GREEN_BEAN:    "bg-lime-100 text-lime-700",
  ROASTED_BEAN:  "bg-amber-100 text-amber-700",
  FINISHED_GOODS:"bg-violet-100 text-violet-700",
  PACKAGING:     "bg-blue-100 text-blue-700",
};

function LowStockCard({ items }: { items: LowStockItem[] }) {
  const accent = items.length === 0 ? "zinc" : items.length <= 2 ? "amber" : "red";
  const iconBg: Record<string, string> = {
    zinc:  "bg-slate-100/80 text-slate-500",
    amber: "bg-amber-100/80 text-amber-600",
    red:   "bg-red-100/80 text-red-600",
  };
  const valueCls: Record<string, string> = {
    zinc:  "text-slate-800",
    amber: "text-amber-700",
    red:   "text-red-600",
  };

  return (
    <div className="flex flex-col gap-3 rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg shadow-slate-200/40 backdrop-blur-md">
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide leading-none">
          Peringatan Stok Tipis
        </p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-xl ${iconBg[accent]}`}>
          <AlertTriangle size={13} />
        </span>
      </div>

      {items.length === 0 ? (
        <div>
          <p className="font-mono text-2xl font-black tabular-nums text-slate-800 leading-none">
            Semua aman
          </p>
          <p className="mt-1.5 text-xs text-slate-400">Tidak ada stok di bawah batas minimum</p>
        </div>
      ) : (
        <div>
          <p className={`font-mono text-2xl font-black tabular-nums leading-none ${valueCls[accent]}`}>
            {items.length} item
          </p>
          <p className="mt-1.5 mb-2.5 text-xs text-slate-400">Perlu segera diisi ulang</p>
          <div className="space-y-1.5">
            {items.slice(0, 4).map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`shrink-0 rounded px-1 py-0.5 text-[9px] font-bold uppercase ${TYPE_COLOR[item.type]}`}>
                    {TYPE_LABEL[item.type]}
                  </span>
                  <span className="truncate text-xs text-slate-600">{item.name}</span>
                </div>
                <span className="shrink-0 font-mono text-xs font-semibold text-red-600">
                  {item.unit === "kg"
                    ? formatKg(item.stock)
                    : formatUnit(item.stock)}
                </span>
              </div>
            ))}
            {items.length > 4 && (
              <p className="text-[11px] text-slate-400">+{items.length - 4} lainnya</p>
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
  Selesai:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  Lunas:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  Proses:   "bg-blue-50 text-blue-700 border-blue-200",
  Tempo:    "bg-amber-50 text-amber-700 border-amber-200",
  Sebagian: "bg-blue-50 text-blue-700 border-blue-200",
  Draft:    "bg-zinc-100 text-zinc-500 border-zinc-200",
  Void:     "bg-zinc-100 text-zinc-400 border-zinc-200",
};

function ActivityFeed({ items }: { items: ActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-12 text-center">
        <span className="rounded-full bg-slate-100/80 p-3"><Inbox size={18} className="text-slate-400" /></span>
        <p className="text-sm font-medium text-slate-400">Belum ada aktivitas</p>
        <p className="text-xs text-slate-300">Mulai catat transaksi pertama via modul di sidebar.</p>
      </div>
    );
  }

  return (
    <div>
      {items.map((item, i) => {
        const meta     = ACTIVITY_META[item.type];
        const statusCls = ACTIVITY_STATUS_CLS[item.status] ?? "bg-slate-100 text-slate-500 border-slate-200";

        return (
          <div
            key={`${item.type}-${item.id}`}
            className={`flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/40 ${
              i < items.length - 1 ? "border-b border-white/40" : ""
            }`}
          >
            {/* Type icon */}
            <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${meta.iconBg}`}>
              {meta.icon}
            </span>

            {/* Code */}
            <span className="w-32 shrink-0 font-mono text-xs font-semibold text-slate-700 tabular-nums">
              {item.code}
            </span>

            {/* Description */}
            <span className="min-w-0 flex-1 truncate text-xs text-slate-500">
              {item.description}
            </span>

            {/* Amount (if any) */}
            <span className="w-28 shrink-0 text-right font-mono text-xs font-semibold text-slate-800 tabular-nums">
              {item.amount !== null ? formatRupiah(item.amount) : "—"}
            </span>

            {/* Status badge */}
            <span className="w-20 shrink-0 text-right">
              <Badge
                variant="outline"
                className={`text-[10px] font-medium ${statusCls}`}
              >
                {item.status}
              </Badge>
            </span>

            {/* Time ago */}
            <span
              className="w-16 shrink-0 text-right text-[10px] text-slate-400"
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
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/40 bg-white/30 px-6 backdrop-blur-sm">
        <div>
          <h1 className="text-base font-semibold text-slate-800">Dashboard</h1>
          <p className="mt-0.5 text-xs text-slate-400">{todayLabel}</p>
        </div>
        <p className="text-[11px] text-slate-400">
          Diperbarui {formatTimeAgo(asOf)}
        </p>
      </header>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto p-6 space-y-6">

        {/* ── 4 KPI Cards ── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">

          {/* Card 1 — Revenue hari ini */}
          <KpiCard
            label="Pendapatan Hari Ini"
            value={formatRupiah(kpi.revenueToday)}
            sub={
              kpi.revenueToday > 0
                ? "Nota PAID yang diterbitkan hari ini"
                : "Belum ada nota lunas hari ini"
            }
            icon={<TrendingUp size={13} />}
            accent={kpi.revenueToday > 0 ? "emerald" : "zinc"}
            href="/penjualan"
          />

          {/* Card 2 — Kas masuk hari ini */}
          <KpiCard
            label="Kas Masuk Hari Ini"
            value={formatRupiah(kpi.kasToday)}
            sub={
              kpi.kasToday > 0
                ? "Total pembayaran diterima hari ini"
                : "Belum ada pembayaran hari ini"
            }
            icon={<Banknote size={13} />}
            accent={kpi.kasToday > 0 ? "emerald" : "zinc"}
            href="/keuangan"
          />

          {/* Card 3 — Total Piutang */}
          <KpiCard
            label="Total Piutang"
            value={formatRupiah(kpi.totalPiutang)}
            sub={
              kpi.piutangCount > 0
                ? <span>{kpi.piutangCount} nota belum lunas</span>
                : "Tidak ada piutang outstanding"
            }
            icon={<Clock size={13} />}
            accent={kpi.totalPiutang > 0 ? "amber" : "zinc"}
            href="/keuangan"
          />

          {/* Card 4 — Stok Tipis (custom card) */}
          <LowStockCard items={lowStock} />

        </div>

        {/* ── Activity Feed ── */}
        <div className="overflow-hidden rounded-3xl border border-white/50 bg-white/80 shadow-lg shadow-slate-200/40 backdrop-blur-md">
          {/* Section header */}
          <div className="flex items-center justify-between border-b border-white/40 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">Aktivitas Terakhir</h2>
              <p className="text-[11px] text-slate-400">
                Gabungan log Barang Datang · Roasting · Produksi · Penjualan
              </p>
            </div>

            {/* Legend */}
            <div className="hidden items-center gap-3 lg:flex">
              {(Object.entries(ACTIVITY_META) as [ActivityItem["type"], typeof ACTIVITY_META[ActivityItem["type"]]][]).map(([type, meta]) => (
                <Link
                  key={type}
                  href={meta.href}
                  className="flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className={`flex h-4 w-4 items-center justify-center rounded ${meta.iconBg}`}>
                    {meta.icon}
                  </span>
                  {meta.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Column headers */}
          <div className="flex items-center gap-3 border-b border-white/30 bg-white/30 px-5 py-2">
            <span className="w-6 shrink-0" />
            <span className="w-32 shrink-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Kode</span>
            <span className="flex-1 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Keterangan</span>
            <span className="w-28 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Nilai</span>
            <span className="w-20 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</span>
            <span className="w-16 shrink-0 text-right text-[10px] font-semibold uppercase tracking-wide text-slate-400">Waktu</span>
          </div>

          <ActivityFeed items={activity} />
        </div>

      </div>
    </div>
  );
}
