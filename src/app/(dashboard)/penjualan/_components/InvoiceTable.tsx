import { useState, useMemo } from "react";
import Link from "next/link";
import { ExternalLink, Search, Banknote } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate, formatRupiah } from "@/lib/format";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";
import { TerimaPaymentDialog } from "../../keuangan/_components/TerimaPaymentDialog";
import { voidInvoice } from "../actions";
import type { InvoiceRow } from "../actions";

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  DRAFT:   { label: "Draft",    className: "bg-zinc-100 text-zinc-500 border-zinc-200" },
  ISSUED:  { label: "Tempo",    className: "bg-amber-50 text-amber-700 border-amber-200" },
  PARTIAL: { label: "Sebagian", className: "bg-blue-50 text-blue-700 border-blue-200" },
  PAID:    { label: "Lunas",    className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  VOID:    { label: "Void",     className: "bg-zinc-100 text-zinc-400 border-zinc-200" },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] ?? STATUS_MAP.DRAFT;
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${s.className}`}>
      {s.label}
    </Badge>
  );
}

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={9} className="py-12 text-center">
        <p className="text-sm font-medium text-zinc-400">
          {isFiltered ? "Tidak ada nota yang cocok dengan filter." : "Belum ada nota penjualan."}
        </p>
        {!isFiltered && (
          <p className="mt-1 text-xs text-zinc-300">Klik "Nota Baru" untuk mencatat transaksi pertama.</p>
        )}
      </TableCell>
    </TableRow>
  );
}

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [voidTarget, setVoidTarget] = useState<InvoiceRow | null>(null);
  const [payTarget, setPayTarget] = useState<InvoiceRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchSearch =
        inv.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || inv.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [invoices, searchTerm, statusFilter]);

  const mappedPayTarget = payTarget ? {
    id: payTarget.id,
    code: payTarget.code,
    customerName: payTarget.customerName,
    customerPhone: null,
    grandTotal: payTarget.grandTotal,
    paidAmount: payTarget.paidAmount,
    balance: payTarget.balance,
    status: payTarget.status as "ISSUED" | "PARTIAL",
    issuedAt: payTarget.issuedAt,
    dueDate: payTarget.dueDate,
    isOverdue: false,
    itemSummary: `${payTarget.itemCount} item`,
  } : null;

  return (
    <>
    <div className="mb-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari kode atau nama customer..."
          className="pl-9 h-10 bg-white/40 border-white/60 backdrop-blur-md rounded-xl focus-visible:ring-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-10 px-3 rounded-xl border border-white/60 bg-white/40 backdrop-blur-md text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-slate-400"
      >
        <option value="ALL">Semua Status</option>
        <option value="DRAFT">Draft</option>
        <option value="ISSUED">Tempo</option>
        <option value="PARTIAL">Sebagian</option>
        <option value="PAID">Lunas</option>
        <option value="VOID">Void</option>
      </select>
    </div>

    <div className="hidden md:block overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/40 border-b border-white/50 backdrop-blur-md">
            <TableHead className="w-36 text-xs font-bold uppercase tracking-widest text-slate-500">No. Nota</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Customer</TableHead>
            <TableHead className=" text-center text-xs font-bold uppercase tracking-widest text-slate-500">Item</TableHead>
            <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Total</TableHead>
            <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Terbayar</TableHead>
            <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Sisa</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Tanggal</TableHead>
            <TableHead className="w-20 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
            <TableHead className=" text-center text-xs font-bold uppercase tracking-widest text-slate-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredInvoices.length === 0 ? (
            <EmptyState isFiltered={invoices.length > 0} />
          ) : (
            filteredInvoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-white/40 transition-colors">
                <TableCell >
                  <p className="font-mono text-xs font-semibold text-slate-600">{inv.code}</p>
                </TableCell>
                <TableCell className="text-sm font-bold text-slate-900">
                  {inv.customerName}
                </TableCell>
                <TableCell  className="text-center font-mono text-sm text-slate-500">
                  {inv.itemCount}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-black text-slate-900">
                  {formatRupiah(inv.grandTotal)}
                </TableCell>
                <TableCell  className="text-right font-mono text-sm font-bold text-emerald-700">
                  {formatRupiah(inv.paidAmount)}
                </TableCell>
                <TableCell
                  className={`hidden md:table-cell text-right font-mono text-sm font-black ${
                    inv.balance > 0 ? "text-amber-600" : "text-slate-400"
                  }`}
                >
                  {inv.balance > 0 ? formatRupiah(inv.balance) : "â€”"}
                </TableCell>
                <TableCell className="text-sm font-semibold text-slate-500">
                  <p>{formatDate(inv.issuedAt)}</p>
                  {inv.dueDate && (
                    <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-0.5">
                      Tempo: {formatDate(inv.dueDate)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {(inv.status === "ISSUED" || inv.status === "PARTIAL") && (
                      <Button
                        size="sm"
                        onClick={() => setPayTarget(inv)}
                        className="h-7 gap-1 px-2.5 text-[11px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border border-emerald-200 rounded-lg shadow-sm"
                      >
                        <Banknote size={12} />
                        Bayar
                      </Button>
                    )}
                    <Link
                      href={`/invoice/${inv.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 h-7 rounded-lg border border-white/60 bg-white/40 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-slate-600 hover:bg-slate-900 hover:text-white hover:border-slate-800 transition-all shadow-sm"
                    >
                      <ExternalLink size={12} />
                      Print
                    </Link>
                    {inv.status !== "VOID" && inv.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2.5 text-[11px] font-bold uppercase tracking-wide text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                        onClick={() => setVoidTarget(inv)}
                      >
                        Void
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

        <div className="md:hidden flex flex-col gap-3">
      {filteredInvoices.length === 0 ? (
        <div className="py-12 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl">
           <p className="text-sm font-medium text-zinc-400">
             {invoices.length > 0 ? "Tidak ada nota yang cocok." : "Belum ada nota."}
           </p>
        </div>
      ) : (
        filteredInvoices.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-2 rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900">{inv.customerName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-slate-600">{inv.code}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs text-slate-500">{inv.itemCount} Item</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-black text-slate-900">{formatRupiah(inv.grandTotal)}</p>
                {inv.balance > 0 && (
                  <p className="font-mono text-[10px] font-bold text-amber-600 mt-0.5">Sisa: {formatRupiah(inv.balance)}</p>
                )}
              </div>
            </div>
            
            <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/40">
              <div className="flex flex-col gap-1">
                <StatusBadge status={inv.status} />
                <span className="text-[10px] font-semibold text-slate-500">{formatDate(inv.issuedAt)}</span>
              </div>
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                {(inv.status === "ISSUED" || inv.status === "PARTIAL") && (
                  <Button size="sm" onClick={() => setPayTarget(inv)} className="h-7 px-2.5 text-[11px] font-bold uppercase bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                    Bayar
                  </Button>
                )}
                <Link href={`/invoice/${inv.id}/print`} className="inline-flex items-center justify-center h-7 px-2.5 rounded-lg border border-slate-300 text-[11px] font-bold uppercase text-slate-600 hover:bg-slate-900 hover:text-white bg-white/40 shadow-sm">
                  Print
                </Link>
                {inv.status !== "VOID" && inv.status !== "PAID" && (
                  <Button size="sm" variant="ghost" onClick={() => setVoidTarget(inv)} className="h-7 px-2.5 text-[11px] font-bold uppercase text-red-500 hover:bg-red-50 hover:text-red-600">
                    Void
                  </Button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>

    <VoidConfirmDialog
      open={!!voidTarget}
      onOpenChange={(v) => { if (!v) setVoidTarget(null); }}
      title={`Void Nota ${voidTarget?.code ?? ""}`}
      description="Stok Finished Goods akan dikembalikan. Nota yang sudah LUNAS tidak bisa di-void."
      onConfirm={async (reason) => voidInvoice(voidTarget!.id, reason)}
    />

    <TerimaPaymentDialog
      invoice={mappedPayTarget}
      open={!!payTarget}
      onOpenChange={(v) => { if (!v) setPayTarget(null); }}
      onSuccess={() => setPayTarget(null)}
    />
    </>
  );
}



