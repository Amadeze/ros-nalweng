import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatKg, formatDate } from "@/lib/format";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";
import { voidRoastingBatch } from "../actions";
import type { RoastingBatchRow } from "../actions";

// ─────────────────────────────────────────────
// Shrinkage badge
// ─────────────────────────────────────────────

function ShrinkageBadge({ percent }: { percent: number }) {
  const label = `${percent.toFixed(1)}%`;
  const className =
    percent > 25
      ? "bg-red-50 text-red-600 border-red-200"
      : percent > 18
        ? "bg-amber-50 text-amber-700 border-amber-200"
        : "bg-zinc-50 text-zinc-600 border-zinc-200";
  return (
    <Badge variant="outline" className={`font-mono text-[11px] ${className}`}>
      -{label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// Status badge
// ─────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "Selesai", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PENDING:   { label: "Proses",  className: "bg-blue-50 text-blue-700 border-blue-200"          },
    VOID:      { label: "Void",    className: "bg-zinc-100 text-zinc-400 border-zinc-200"          },
  };
  const s = map[status] ?? { label: status, className: "bg-zinc-100 text-zinc-500 border-zinc-200" };
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${s.className}`}>
      {s.label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────

function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  return (
    <TableRow>
      <TableCell colSpan={9} className="py-12 text-center">
        <p className="text-sm font-medium text-zinc-400">
          {isFiltered ? "Tidak ada batch roasting yang cocok." : "Belum ada batch roasting."}
        </p>
        {!isFiltered && (
          <p className="mt-1 text-xs text-zinc-300">
            Klik "Mulai Roasting" di pojok kanan atas untuk mencatat batch pertama.
          </p>
        )}
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface RoastingHistoryTableProps {
  batches: RoastingBatchRow[];
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export function RoastingHistoryTable({ batches }: RoastingHistoryTableProps) {
  const [voidTarget, setVoidTarget] = useState<RoastingBatchRow | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredBatches = useMemo(() => {
    return batches.filter((b) => {
      const matchSearch =
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.inputProductName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.outputProductName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === "ALL" || b.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [batches, searchTerm, statusFilter]);

  return (
    <>
    <div className="mb-4 flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <Input
          placeholder="Cari kode atau nama beans..."
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
        <option value="COMPLETED">Selesai</option>
        <option value="PENDING">Proses</option>
        <option value="VOID">Void</option>
      </select>
    </div>

    <div className="hidden md:block overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30">
      <Table>
        <TableHeader>
          <TableRow className="bg-white/40 border-b border-white/50 backdrop-blur-md hover:bg-white/40">
            <TableHead className="w-36 text-xs font-bold uppercase tracking-widest text-slate-500">Kode Batch</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Green Bean</TableHead>
            <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Roasted Bean</TableHead>
            <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Masuk</TableHead>
            <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Keluar</TableHead>
            <TableHead className=" text-center text-xs font-bold uppercase tracking-widest text-slate-500">Susut</TableHead>
            <TableHead className=" text-xs font-bold uppercase tracking-widest text-slate-500">Tanggal</TableHead>
            <TableHead className="w-24 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
            <TableHead className="w-16 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredBatches.length === 0 ? (
            <EmptyState isFiltered={batches.length > 0} />
          ) : (
            filteredBatches.map((b) => (
              <TableRow key={b.id} className="hover:bg-white/40 transition-colors">
                <TableCell className="font-mono text-xs font-medium text-zinc-700">
                  {b.code}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-zinc-900">{b.inputProductName}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-zinc-900">{b.outputProductName}</p>
                </TableCell>
                <TableCell  className="text-right font-mono text-sm text-zinc-700">
                  {formatKg(b.inputWeightKg)}
                </TableCell>
                <TableCell  className="text-right font-mono text-sm font-semibold text-zinc-900">
                  {formatKg(b.outputWeightKg)}
                </TableCell>
                <TableCell className="text-center">
                  <ShrinkageBadge percent={b.roastLossPercent} />
                </TableCell>
                <TableCell className="text-sm text-zinc-500">
                  {formatDate(b.roastedAt)}
                  {b.roastDurationMin && (
                    <span className="ml-1 text-xs text-zinc-400">
                      ({b.roastDurationMin} min)
                    </span>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <StatusBadge status={b.status} />
                </TableCell>
                <TableCell className="text-center">
                  {b.status === "COMPLETED" && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg"
                      onClick={() => setVoidTarget(b)}
                    >
                      Void
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

    <div className="md:hidden flex flex-col gap-3">
      {filteredBatches.length === 0 ? (
        <div className="py-12 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl">
           <p className="text-sm font-medium text-zinc-400">Belum ada riwayat roasting.</p>
        </div>
      ) : (
        filteredBatches.map((b) => (
          <div key={b.id} className="flex flex-col gap-2 rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-900">{b.outputProductName}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-mono text-xs font-semibold text-slate-600">{b.code}</span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-[10px] uppercase font-bold text-slate-500">{b.inputProductName}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="font-mono text-sm font-black text-slate-900">{formatKg(b.outputWeightKg)}</p>
                <p className="font-mono text-[10px] font-bold text-slate-500 mt-0.5">Masuk: {formatKg(b.inputWeightKg)}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-end mt-2 pt-2 border-t border-white/40">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <StatusBadge status={b.status} />
                  <ShrinkageBadge percent={b.roastLossPercent} />
                </div>
                <span className="text-[10px] font-semibold text-slate-500">{formatDate(b.roastedAt)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {b.status === "COMPLETED" && (
                  <Button size="sm" variant="ghost" onClick={() => setVoidTarget(b)} className="h-7 px-2.5 text-[11px] font-bold uppercase text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg">
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
      title={`Void Batch ${voidTarget?.code ?? ""}`}
      description="Tindakan ini akan membalik mutasi stok Green Bean dan Roasted Bean. Tidak dapat dibatalkan."
      onConfirm={async (reason) => {
        const result = await voidRoastingBatch(voidTarget!.id, reason);
        return result;
      }}
    />
    </>
  );
}




