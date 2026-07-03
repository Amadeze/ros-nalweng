"use client";

import { useState } from "react";
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { PiutangTable } from "./PiutangTable";
import { TerimaPaymentDialog } from "./TerimaPaymentDialog";
import { CatatPengeluaranDrawer } from "./CatatPengeluaranDrawer";
import { ExpenseTable } from "./ExpenseTable";
import { formatRupiah } from "@/lib/format";
import type { KeuanganPageData, PiutangRow, ExpenseRow } from "../actions";

// =============================================================================
// KPI Card
// =============================================================================

interface KpiCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: "default" | "amber" | "red" | "emerald";
  icon: React.ReactNode;
}

function KpiCard({ label, value, sub, accent = "default", icon }: KpiCardProps) {
  const accentCls = {
    default:  "text-zinc-900",
    amber:    "text-amber-700",
    red:      "text-red-600",
    emerald:  "text-emerald-700",
  }[accent];

  return (
    <div className="flex items-start gap-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="mt-0.5 shrink-0 rounded-lg bg-zinc-100 p-2 text-zinc-500">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-zinc-500">{label}</p>
        <p className={`mt-0.5 font-mono text-xl font-black tabular-nums ${accentCls}`}>{value}</p>
        {sub && <p className="mt-0.5 text-[11px] text-zinc-400">{sub}</p>}
      </div>
    </div>
  );
}

// =============================================================================
// Tab
// =============================================================================

type Tab = "piutang" | "pengeluaran";

// =============================================================================
// Main Client
// =============================================================================

interface KeuanganClientProps {
  data: KeuanganPageData;
  expenses: ExpenseRow[];
}

export function KeuanganClient({ data, expenses }: KeuanganClientProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<PiutangRow | null>(null);
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [expenseOpen,     setExpenseOpen]     = useState(false);
  const [activeTab,       setActiveTab]       = useState<Tab>("piutang");

  const { kpi, piutangRows } = data;

  const mtdTrend =
    kpi.revenueLastMonth > 0
      ? ((kpi.revenueMTD - kpi.revenueLastMonth) / kpi.revenueLastMonth) * 100
      : null;

  const handleTerimaPayment = (row: PiutangRow) => {
    setSelectedInvoice(row);
    setDialogOpen(true);
  };

  return (
    <>
      <StandardPageLayout
        title="Keuangan"
        description="Manajemen piutang & penerimaan pembayaran"
        actionButton={
          <Button
            variant="destructive"
            size="sm"
            className="h-8 gap-1.5 text-xs font-medium"
            onClick={() => setExpenseOpen(true)}
          >
            <Minus size={14} />
            Catat Pengeluaran
          </Button>
        }
      >
        {/* ── KPI Summary ── */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard
            label="Total Piutang Aktif"
            value={formatRupiah(kpi.totalPiutang)}
            sub={`${kpi.piutangCount} nota belum lunas`}
            accent={kpi.totalPiutang > 0 ? "amber" : "emerald"}
            icon={<Clock size={16} />}
          />
          <KpiCard
            label="Lewat Jatuh Tempo"
            value={`${kpi.overdueCount} nota`}
            sub={kpi.overdueCount > 0 ? "Segera tagih" : "Semua tepat waktu"}
            accent={kpi.overdueCount > 0 ? "red" : "default"}
            icon={<AlertTriangle size={16} />}
          />
          <KpiCard
            label="Revenue Bulan Ini"
            value={formatRupiah(kpi.revenueMTD)}
            sub={
              mtdTrend !== null
                ? `${mtdTrend >= 0 ? "+" : ""}${mtdTrend.toFixed(1)}% vs bulan lalu`
                : "Bulan ini"
            }
            accent="emerald"
            icon={<TrendingUp size={16} />}
          />
          <KpiCard
            label="Revenue Bulan Lalu"
            value={formatRupiah(kpi.revenueLastMonth)}
            sub="Nota berstatus PAID"
            accent="default"
            icon={<TrendingDown size={16} />}
          />
        </div>

        {/* ── Tabs ── */}
        <div className="mb-4 flex gap-1 rounded-xl border border-zinc-200 bg-zinc-50 p-1 w-fit">
          {([
            { id: "piutang",      label: `Piutang (${piutangRows.length})` },
            { id: "pengeluaran",  label: `Pengeluaran (${expenses.length})` },
          ] as { id: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white shadow-sm text-zinc-900"
                  : "text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {activeTab === "piutang" ? (
          <PiutangTable rows={piutangRows} onTerimaPayment={handleTerimaPayment} />
        ) : (
          <ExpenseTable rows={expenses} />
        )}
      </StandardPageLayout>

      {/* ── Payment Dialog ── */}
      <TerimaPaymentDialog
        invoice={selectedInvoice}
        open={dialogOpen}
        onOpenChange={(v) => {
          setDialogOpen(v);
          if (!v) setSelectedInvoice(null);
        }}
        onSuccess={() => {
          setDialogOpen(false);
          setSelectedInvoice(null);
        }}
      />

      {/* ── Catat Pengeluaran Drawer ── */}
      <CatatPengeluaranDrawer open={expenseOpen} onOpenChange={setExpenseOpen} />
    </>
  );
}

