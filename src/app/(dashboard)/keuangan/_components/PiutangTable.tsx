import { AlertTriangle, Clock } from "lucide-react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatRupiah } from "@/lib/format";
import type { PiutangRow } from "../actions";

function OverdueBadge() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-red-600">
      <AlertTriangle size={9} />
      Lewat jatuh tempo
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  return status === "PARTIAL" ? (
    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[11px]">
      Sebagian
    </Badge>
  ) : (
    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[11px]">
      <Clock size={9} className="mr-1" />
      Tempo
    </Badge>
  );
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="py-16 text-center">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-emerald-50 p-3">
            <Clock size={20} className="text-emerald-500" />
          </div>
          <p className="text-sm font-medium text-zinc-500">Semua nota sudah lunas</p>
          <p className="text-xs text-zinc-400">Tidak ada piutang yang perlu ditagih saat ini.</p>
        </div>
      </TableCell>
    </TableRow>
  );
}

interface PiutangTableProps {
  rows: PiutangRow[];
  onTerimaPayment: (row: PiutangRow) => void;
}

export function PiutangTable({ rows, onTerimaPayment }: PiutangTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="w-36 text-xs font-semibold text-zinc-500">No. Nota</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Customer</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Item</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Total</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Terbayar</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Sisa Tagihan</TableHead>
            <TableHead className="w-24 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
            <TableHead className="w-36 text-center text-xs font-semibold text-zinc-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <EmptyState />
          ) : (
            rows.map((row) => (
              <TableRow
                key={row.id}
                className={row.isOverdue ? "bg-red-50/30 hover:bg-red-50/50" : "hover:bg-zinc-50/50"}
              >
                <TableCell>
                  <p className="font-mono text-xs font-semibold text-zinc-800">{row.code}</p>
                  <p className="text-[10px] text-zinc-400">{formatDate(row.issuedAt)}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm font-medium text-zinc-900">{row.customerName}</p>
                  {row.customerPhone && (
                    <p className="text-[11px] text-zinc-400">{row.customerPhone}</p>
                  )}
                </TableCell>
                <TableCell className="max-w-[180px]">
                  <p className="truncate text-xs text-zinc-500">{row.itemSummary}</p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-zinc-600">
                  {formatRupiah(row.grandTotal)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-emerald-700">
                  {row.paidAmount > 0 ? formatRupiah(row.paidAmount) : <span className="text-zinc-300">—</span>}
                </TableCell>
                <TableCell className="text-right">
                  <p className="font-mono text-sm font-bold text-zinc-900">
                    {formatRupiah(row.balance)}
                  </p>
                  {row.dueDate && (
                    <p className={`text-[10px] ${row.isOverdue ? "text-red-600 font-medium" : "text-zinc-400"}`}>
                      {row.isOverdue ? "" : "Jatuh tempo: "}
                      {formatDate(row.dueDate)}
                    </p>
                  )}
                  {row.isOverdue && <OverdueBadge />}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={row.status} />
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onTerimaPayment(row)}
                    className="h-7 border-zinc-300 px-3 text-xs font-medium text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    Terima Pembayaran
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
