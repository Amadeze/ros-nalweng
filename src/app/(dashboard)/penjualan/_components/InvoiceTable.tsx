import { useState } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/format";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";
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

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={9} className="py-12 text-center">
        <p className="text-sm font-medium text-zinc-400">Belum ada nota penjualan.</p>
        <p className="mt-1 text-xs text-zinc-300">Klik "Nota Baru" untuk mencatat transaksi pertama.</p>
      </TableCell>
    </TableRow>
  );
}

export function InvoiceTable({ invoices }: { invoices: InvoiceRow[] }) {
  const [voidTarget, setVoidTarget] = useState<InvoiceRow | null>(null);

  return (
    <>
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="w-36 text-xs font-semibold text-zinc-500">No. Nota</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Customer</TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-500">Item</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Total</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Terbayar</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Sisa</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Tanggal</TableHead>
            <TableHead className="w-20 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
            <TableHead className="w-28 text-center text-xs font-semibold text-zinc-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.length === 0 ? (
            <EmptyState />
          ) : (
            invoices.map((inv) => (
              <TableRow key={inv.id} className="hover:bg-zinc-50/50">
                <TableCell>
                  <p className="font-mono text-xs font-semibold text-zinc-800">{inv.code}</p>
                </TableCell>
                <TableCell className="text-sm font-medium text-zinc-900">
                  {inv.customerName}
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-zinc-500">
                  {inv.itemCount}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-zinc-900">
                  {formatRupiah(inv.grandTotal)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-emerald-700">
                  {formatRupiah(inv.paidAmount)}
                </TableCell>
                <TableCell
                  className={`text-right font-mono text-sm font-semibold ${
                    inv.balance > 0 ? "text-amber-600" : "text-zinc-400"
                  }`}
                >
                  {inv.balance > 0 ? formatRupiah(inv.balance) : "—"}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  <p>{formatDate(inv.issuedAt)}</p>
                  {inv.dueDate && (
                    <p className="text-[10px] text-amber-600">
                      Jatuh tempo: {formatDate(inv.dueDate)}
                    </p>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={inv.status} />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Link
                      href={`/invoice/${inv.id}/print`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-2 py-1 text-[11px] font-medium text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50 hover:text-zinc-800 transition-colors"
                    >
                      <ExternalLink size={10} />
                      Print
                    </Link>
                    {inv.status !== "VOID" && inv.status !== "PAID" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[11px] text-red-500 hover:bg-red-50 hover:text-red-600"
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

    <VoidConfirmDialog
      open={!!voidTarget}
      onOpenChange={(v) => { if (!v) setVoidTarget(null); }}
      title={`Void Nota ${voidTarget?.code ?? ""}`}
      description="Stok Finished Goods akan dikembalikan. Nota yang sudah LUNAS tidak bisa di-void."
      onConfirm={async (reason) => voidInvoice(voidTarget!.id, reason)}
    />
    </>
  );
}
