"use client";

import { formatDate, formatRupiah } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { ExpenseRow } from "../actions";

const CATEGORY_LABEL: Record<string, string> = {
  GAJI:        "Gaji & Tunjangan",
  UTILITAS:    "Utilitas",
  OPERASIONAL: "Operasional",
  LAINNYA:     "Lain-lain",
};

const CATEGORY_COLOR: Record<string, string> = {
  GAJI:        "bg-blue-50 text-blue-700 border-blue-200",
  UTILITAS:    "bg-amber-50 text-amber-700 border-amber-200",
  OPERASIONAL: "bg-violet-50 text-violet-700 border-violet-200",
  LAINNYA:     "bg-zinc-100 text-zinc-600 border-zinc-200",
};

interface ExpenseTableProps {
  rows: ExpenseRow[];
}

export function ExpenseTable({ rows }: ExpenseTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-zinc-400">Belum ada pengeluaran tercatat.</p>
        <p className="text-xs text-zinc-300">Klik "Catat Pengeluaran" untuk mencatat OPEX.</p>
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/30 backdrop-blur-xl px-4 py-2.5 shadow-sm">
        <p className="text-xs text-zinc-500">{rows.length} pengeluaran tercatat</p>
        <p className="font-mono text-sm font-bold text-red-600">
          Total: {formatRupiah(total)}
        </p>
      </div>

      <div className="hidden md:block overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/40 border-b border-white/50 backdrop-blur-md hover:bg-white/40">
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Tanggal</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Keterangan</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nominal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                <TableCell  className="text-sm text-zinc-600">
                  {formatDate(row.date)}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${CATEGORY_COLOR[row.category] ?? "bg-zinc-100 text-zinc-500"}`}
                  >
                    {CATEGORY_LABEL[row.category] ?? row.category}
                  </Badge>
                </TableCell>
                <TableCell  className="text-sm text-zinc-500">
                  {row.description ?? <span className="italic text-zinc-300">â€”</span>}
                </TableCell>
                <TableCell  className="text-right font-mono text-sm font-semibold text-red-600">
                  {formatRupiah(row.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


