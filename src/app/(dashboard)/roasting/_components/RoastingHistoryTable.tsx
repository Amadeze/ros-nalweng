import { useState } from "react";
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
import { formatKg, formatDate } from "@/lib/format";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";
import { voidRoastingBatch } from "../actions";
import type { RoastingBatchRow } from "../actions";

// ─────────────────────────────────────────────
// Shrinkage badge
// ─────────────────────────────────────────────

function ShrinkageBadge({ percent }: { percent: number }) {
  const label = `${percent.toFixed(1)}%`;
  // Tipikal susut roasting: 10–25%. Lebih dari 25% aneh.
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

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="py-12 text-center">
        <p className="text-sm font-medium text-zinc-400">Belum ada batch roasting.</p>
        <p className="mt-1 text-xs text-zinc-300">
          Klik "Mulai Roasting" untuk mencatat batch pertama.
        </p>
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

  return (
    <>
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="w-36 text-xs font-semibold text-zinc-500">Kode Batch</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Green Bean</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Roasted Bean</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Masuk</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Keluar</TableHead>
            <TableHead className="text-center text-xs font-semibold text-zinc-500">Susut</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Tanggal</TableHead>
            <TableHead className="w-24 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
            <TableHead className="w-16 text-center text-xs font-semibold text-zinc-500">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {batches.length === 0 ? (
            <EmptyState />
          ) : (
            batches.map((b) => (
              <TableRow key={b.id} className="hover:bg-zinc-50/50">
                <TableCell className="font-mono text-xs font-medium text-zinc-700">
                  {b.code}
                </TableCell>
                <TableCell>
                  <p className="text-sm text-zinc-900">{b.inputProductName}</p>
                </TableCell>
                <TableCell>
                  <p className="text-sm text-zinc-900">{b.outputProductName}</p>
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-zinc-700">
                  {formatKg(b.inputWeightKg)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-zinc-900">
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
                      className="h-7 px-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
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
