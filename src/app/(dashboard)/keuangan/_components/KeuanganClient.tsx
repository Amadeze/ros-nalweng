"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  TrendingUp, TrendingDown, AlertTriangle, Clock, Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { PiutangTable } from "./PiutangTable";
import { TerimaPaymentDialog } from "./TerimaPaymentDialog";
import { CatatPengeluaranDrawer } from "./CatatPengeluaranDrawer";
import { ExpenseTable } from "./ExpenseTable";
import { PurchaseTable } from "./PurchaseTable";
import { PaymentTable } from "./PaymentTable";
import { SupplierPaymentDialog } from "./SupplierPaymentDialog";
import { SupplierPaymentTable } from "./SupplierPaymentTable";
import { formatRupiah } from "@/lib/format";
import type {
  ExpenseRow,
  KeuanganPageData,
  PaymentRow,
  PiutangRow,
  PurchaseRow,
  SupplierPaymentRow,
} from "../actions";
import {
  voidExpense,
  voidPayment,
  voidPurchase,
  voidSupplierPayment,
} from "../actions";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";

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
    <div className="flex items-start gap-4 rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30 p-4">
      <div className="mt-0.5 shrink-0 rounded-xl bg-white/50 border border-white/60 p-2 text-slate-500 shadow-sm">{icon}</div>
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

type Tab = "piutang" | "pembayaran" | "pengeluaran" | "pembelian" | "pembayaranSupplier";

// =============================================================================
// Main Client
// =============================================================================

interface KeuanganClientProps {
  data: KeuanganPageData;
  expenses: ExpenseRow[];
  purchases: PurchaseRow[];
  payments: PaymentRow[];
  supplierPayments: SupplierPaymentRow[];
}

export function KeuanganClient({
  data,
  expenses,
  purchases,
  payments,
  supplierPayments,
}: KeuanganClientProps) {
  const [selectedInvoice, setSelectedInvoice] = useState<PiutangRow | null>(null);
  const [dialogOpen,      setDialogOpen]      = useState(false);
  const [expenseOpen,     setExpenseOpen]     = useState(false);
  const [activeTab,       setActiveTab]       = useState<Tab>("piutang");
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseRow | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseRow | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentRow | null>(null);
  const [supplierPaymentPurchase, setSupplierPaymentPurchase] = useState<PurchaseRow | null>(null);
  const [selectedSupplierPayment, setSelectedSupplierPayment] = useState<SupplierPaymentRow | null>(null);

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
            value={formatRupiah(kpi.overdueTotal)}
            sub={
              kpi.overdueCount > 0
                ? `${kpi.overdueCount} nota belum terbayar`
                : "Semua tepat waktu"
            }
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
        <div className="mb-4 grid grid-cols-2 gap-2 bg-white/20 p-2 rounded-2xl backdrop-blur-md border border-white/50 w-fit md:grid-cols-5">
          {([
            { id: "piutang",      label: `Piutang (${piutangRows.length})` },
            { id: "pembayaran",   label: `Pembayaran (${payments.length})` },
            { id: "pengeluaran",  label: `Pengeluaran (${expenses.length})` },
            { id: "pembelian",    label: `Hutang Supplier (${purchases.filter((row) => row.balance > 0).length})` },
            { id: "pembayaranSupplier", label: `Bayar Supplier (${supplierPayments.length})` },
          ] as { id: Tab; label: string }[]).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "rounded-xl px-5 py-2 text-xs font-bold transition-all duration-300 shadow-sm",
                activeTab === tab.id
                  ? "bg-blue-500 text-white shadow-md scale-[1.02]"
                  : "bg-white/40 text-slate-600 border border-white/60 hover:bg-white/60 hover:text-slate-800"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        {activeTab === "piutang" && <PiutangTable rows={piutangRows} onTerimaPayment={handleTerimaPayment} />}
        {activeTab === "pembayaran" && (
          <PaymentTable rows={payments} onVoid={setSelectedPayment} />
        )}
        {activeTab === "pengeluaran" && (
          <ExpenseTable rows={expenses} onVoid={setSelectedExpense} />
        )}
        {activeTab === "pembelian" && (
          <PurchaseTable
            rows={purchases}
            onVoid={setSelectedPurchase}
            onPay={setSupplierPaymentPurchase}
          />
        )}
        {activeTab === "pembayaranSupplier" && (
          <SupplierPaymentTable rows={supplierPayments} onVoid={setSelectedSupplierPayment} />
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

      <SupplierPaymentDialog
        purchase={supplierPaymentPurchase}
        open={Boolean(supplierPaymentPurchase)}
        onOpenChange={(open) => {
          if (!open) setSupplierPaymentPurchase(null);
        }}
        onSuccess={() => setSupplierPaymentPurchase(null)}
      />

      <VoidConfirmDialog
        open={Boolean(selectedPurchase)}
        onOpenChange={(open) => {
          if (!open) setSelectedPurchase(null);
        }}
        title="Void Pembelian"
        description={`Stok dan biaya ${selectedPurchase?.code ?? ""} akan dibalik. Pembayaran supplier harus di-void lebih dahulu dan proses ditolak bila stok sudah digunakan.`}
        onConfirm={(reason) =>
          selectedPurchase
            ? voidPurchase(selectedPurchase.id, reason)
            : Promise.resolve({ success: false, error: "Pembelian tidak dipilih." })
        }
      />

      <VoidConfirmDialog
        open={Boolean(selectedPayment)}
        onOpenChange={(open) => {
          if (!open) setSelectedPayment(null);
        }}
        title="Void Pembayaran"
        description={`Pembayaran ${selectedPayment?.code ?? ""} akan dibatalkan dan invoice terkait kembali menjadi piutang.`}
        onConfirm={(reason) =>
          selectedPayment
            ? voidPayment(selectedPayment.id, reason)
            : Promise.resolve({ success: false, error: "Pembayaran tidak dipilih." })
        }
      />

      <VoidConfirmDialog
        open={Boolean(selectedSupplierPayment)}
        onOpenChange={(open) => {
          if (!open) setSelectedSupplierPayment(null);
        }}
        title="Void Pembayaran Supplier"
        description={`Pembayaran ${selectedSupplierPayment?.code ?? ""} akan dibatalkan dan saldo hutang pembelian terkait dipulihkan.`}
        onConfirm={(reason) =>
          selectedSupplierPayment
            ? voidSupplierPayment(selectedSupplierPayment.id, reason)
            : Promise.resolve({ success: false, error: "Pembayaran supplier tidak dipilih." })
        }
      />

      <VoidConfirmDialog
        open={Boolean(selectedExpense)}
        onOpenChange={(open) => {
          if (!open) setSelectedExpense(null);
        }}
        title="Void Pengeluaran"
        description="Pengeluaran akan dikeluarkan dari perhitungan arus kas dan Laba/Rugi, tetapi histori audit tetap tersimpan."
        onConfirm={(reason) =>
          selectedExpense
            ? voidExpense(selectedExpense.id, reason)
            : Promise.resolve({ success: false, error: "Pengeluaran tidak dipilih." })
        }
      />
    </>
  );
}

