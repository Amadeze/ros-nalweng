"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatRupiah } from "@/lib/format";
import { getPOList } from "../po-actions";
import { InventoryEmptyState } from "./InventoryEmptyState";
import type { POStatus } from "@prisma/client";

type POListItem = {
  id: string;
  code: string;
  status: POStatus;
  supplierName: string;
  expectedDate: string | null;
  totalEstimate: number;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  itemCount: number;
};

function POStatusBadge({ status }: { status: POStatus }) {
  const map: Record<POStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-slate-100 text-slate-600 border-slate-200" },
    SENT: { label: "Terkirim", className: "bg-blue-50 text-blue-700 border-blue-200" },
    PARTIAL: { label: "Sebagian", className: "bg-amber-50 text-amber-700 border-amber-200" },
    RECEIVED: { label: "Diterima", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    CANCELLED: { label: "Dibatalkan", className: "bg-red-50 text-red-600 border-red-200" },
  };
  const { label, className } = map[status];
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${className}`}>
      {label}
    </Badge>
  );
}

interface POListProps {
  onSelectPO: (poId: string) => void;
  refreshKey?: number;
  metricFilter?: string | null;
}

export function POList({ onSelectPO, refreshKey, metricFilter }: POListProps) {
  const [items, setItems] = useState<POListItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Map metric filter to PO status
  const filter: POStatus | "ALL" = useMemo(() => {
    if (metricFilter === "active") return "ALL";
    if (metricFilter === "waiting") return "SENT";
    if (metricFilter === "partial") return "PARTIAL";
    return "ALL";
  }, [metricFilter]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const listData = await getPOList(filter === "ALL" ? {} : { status: filter });
        if (!cancelled) setItems(listData.items);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [refreshKey, filter]);

  const formatDate = (date: string | null) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="space-y-3">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200/60 bg-white/50">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Kode</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Supplier</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Status</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Item</TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">Total</TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">Tanggal</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-sm text-slate-400">
                  Memuat data...
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8">
                  <InventoryEmptyState
                    label="Belum ada Purchase Order"
                    description="Buat PO baru untuk memulai pengadaan."
                  />
                </TableCell>
              </TableRow>
            ) : (
              items.map((po) => (
                <TableRow
                  key={po.id}
                  className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                  onClick={() => onSelectPO(po.id)}
                >
                  <TableCell className="font-medium text-sm text-slate-900">{po.code}</TableCell>
                  <TableCell className="text-sm text-slate-700">{po.supplierName}</TableCell>
                  <TableCell><POStatusBadge status={po.status} /></TableCell>
                  <TableCell className="text-sm text-slate-600 tabular-nums">{po.itemCount} item</TableCell>
                  <TableCell className="text-sm font-semibold text-slate-900 tabular-nums text-right">{formatRupiah(po.totalEstimate)}</TableCell>
                  <TableCell className="text-xs text-slate-500">{formatDate(po.expectedDate)}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Order Cards */}
      <div className="md:hidden flex flex-col gap-1.5">
        {loading ? (
          <div className="py-8 text-center rounded-lg border border-slate-200/60 bg-white/50">
            <p className="text-sm text-slate-400">Memuat data...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="py-8 text-center rounded-lg border border-slate-200/60 bg-white/50" style={{ maxWidth: 280, margin: "0 auto" }}>
            <InventoryEmptyState label="Belum ada PO" />
          </div>
        ) : (
          items.map((po) => (
            <div
              key={po.id}
              onClick={() => onSelectPO(po.id)}
              className="rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2.5 cursor-pointer hover:bg-slate-50/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-slate-900">{po.code}</span>
                <POStatusBadge status={po.status} />
              </div>
              <div className="flex items-center justify-between mt-1 text-xs text-slate-500">
                <span>{po.supplierName} · {po.itemCount} item</span>
                <span className="font-semibold text-slate-900 tabular-nums">{formatRupiah(po.totalEstimate)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
