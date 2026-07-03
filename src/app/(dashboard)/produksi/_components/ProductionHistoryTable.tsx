import { useState } from "react";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatKg, formatRupiah, formatUnit } from "@/lib/format";
import { VoidConfirmDialog } from "@/components/VoidConfirmDialog";
import { voidProductionBatch } from "../actions";
import type { ProductionBatchRow } from "../actions";

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string }> = {
    COMPLETED: { label: "Selesai", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    PENDING:   { label: "Proses",  className: "bg-blue-50 text-blue-700 border-blue-200"          },
    VOID:      { label: "Void",    className: "bg-zinc-100 text-zinc-400 border-zinc-200"          },
  };
  const s = map[status] ?? { label: status, className: "bg-zinc-100 text-zinc-500 border-zinc-200" };
  return <Badge variant="outline" className={`text-[11px] font-medium ${s.className}`}>{s.label}</Badge>;
}

function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={8} className="py-12 text-center">
        <p className="text-sm font-medium text-zinc-400">Belum ada batch produksi.</p>
        <p className="mt-1 text-xs text-zinc-300">Klik "Batch Baru" untuk mencatat produksi pertama.</p>
      </TableCell>
    </TableRow>
  );
}

export function ProductionHistoryTable({ batches }: { batches: ProductionBatchRow[] }) {
  const [voidTarget, setVoidTarget] = useState<ProductionBatchRow | null>(null);

  return (
    <>
    <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <Table>
        <TableHeader>
          <TableRow className="bg-zinc-50 hover:bg-zinc-50">
            <TableHead className="w-36 text-xs font-semibold text-zinc-500">Kode Batch</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Produk Jadi</TableHead>
            <TableHead className="text-xs font-semibold text-zinc-500">Kemasan</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">Unit</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">RB Terpakai</TableHead>
            <TableHead className="text-right text-xs font-semibold text-zinc-500">HPP/unit</TableHead>
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
                <TableCell>
                  <p className="font-mono text-xs font-medium text-zinc-700">{b.code}</p>
                  {b.recipeUsed && (
                    <p className="text-[10px] text-zinc-400">{b.recipeUsed}</p>
                  )}
                </TableCell>
                <TableCell className="text-sm text-zinc-900">{b.outputProductName}</TableCell>
                <TableCell className="text-sm text-zinc-600">{b.packagingName}</TableCell>
                <TableCell className="text-right font-mono text-sm font-semibold text-zinc-900">
                  {formatUnit(b.unitsProduced)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-zinc-600">
                  {formatKg(b.totalRbUsedKg)}
                </TableCell>
                <TableCell className="text-right font-mono text-sm text-zinc-700">
                  {formatRupiah(b.hppPerUnit)}
                </TableCell>
                <TableCell className="text-sm text-zinc-500">{formatDate(b.producedAt)}</TableCell>
                <TableCell className="text-center"><StatusBadge status={b.status} /></TableCell>
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
      description="Tindakan ini akan membalik semua mutasi stok Roasted Bean, Packaging, dan Finished Goods."
      onConfirm={async (reason) => voidProductionBatch(voidTarget!.id, reason)}
    />
    </>
  );
}
