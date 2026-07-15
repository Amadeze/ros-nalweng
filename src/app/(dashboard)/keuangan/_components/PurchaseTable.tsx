"use client";

import { formatDate, formatRupiah } from "@/lib/format";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { PurchaseRow } from "../actions";

const CATEGORY_LABEL: Record<string, string> = {
  GREEN_BEAN: "Bahan Baku (Kopi)",
  PACKAGING: "Kemasan",
};

const CATEGORY_COLOR: Record<string, string> = {
  GREEN_BEAN: "bg-emerald-50 text-emerald-700 border-emerald-200",
  PACKAGING: "bg-amber-50 text-amber-700 border-amber-200",
};

interface PurchaseTableProps {
  rows: PurchaseRow[];
}

export function PurchaseTable({ rows }: PurchaseTableProps) {
  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-16 text-center">
        <p className="text-sm font-medium text-zinc-400">Belum ada riwayat pembelian tercatat.</p>
        <p className="text-xs text-zinc-300">Pembelian aset/bahan dari menu Inventory akan muncul di sini.</p>
      </div>
    );
  }

  const total = rows.reduce((s, r) => s + r.totalCost, 0);

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="flex items-center justify-between rounded-xl border border-white/60 bg-white/30 backdrop-blur-xl px-4 py-2.5 shadow-sm">
        <p className="text-xs text-zinc-500">{rows.length} pembelian tercatat</p>
        <p className="font-mono text-sm font-bold text-red-600">
          Total Keluar: {formatRupiah(total)}
        </p>
      </div>

      <div className="hidden md:block overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/40 border-b border-white/50 backdrop-blur-md hover:bg-white/40">
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Tanggal / Kode</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Kategori</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Item & Qty</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Supplier</TableHead>
              <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nominal Keluar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                <TableCell className="text-sm text-zinc-600">
                  <div>{formatDate(row.receivedAt)}</div>
                  <div className="text-[10px] text-zinc-400">{row.code}</div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[11px] font-medium ${CATEGORY_COLOR[row.type] ?? "bg-zinc-100 text-zinc-500"}`}
                  >
                    {CATEGORY_LABEL[row.type] ?? row.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm font-medium text-slate-700">
                  {row.itemName}
                  <div className="text-xs text-slate-400 font-normal">{row.quantity}</div>
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {row.supplierName}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-red-600">
                  {formatRupiah(row.totalCost)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* MOBILE VIEW */}
      <div className="md:hidden flex flex-col gap-3">
        {rows.map((row) => (
          <div key={row.id} className="p-4 rounded-xl border border-white/60 bg-white/30 backdrop-blur-md shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <Badge
                variant="outline"
                className={`text-[10px] font-bold ${CATEGORY_COLOR[row.type] ?? "bg-zinc-100 text-zinc-500"}`}
              >
                {CATEGORY_LABEL[row.type] ?? row.type}
              </Badge>
              <span className="text-xs font-semibold text-slate-500">{formatDate(row.receivedAt)}</span>
            </div>
            <div className="text-sm font-medium text-slate-800 mb-1">
              {row.itemName} <span className="font-normal text-slate-500">({row.quantity})</span>
            </div>
            <div className="text-xs text-slate-400 mb-2">
              {row.supplierName} • {row.code}
            </div>
            <div className="text-right">
              <span className="font-mono text-base font-bold text-red-600">{formatRupiah(row.totalCost)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
