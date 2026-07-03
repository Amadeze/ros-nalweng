import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatKg, formatRupiah, formatUnit } from "@/lib/format";
import type { PackagingStockRow, ProductStockRow } from "../actions";

// ─────────────────────────────────────────────
// Status thresholds & badge helpers
// ─────────────────────────────────────────────

type StockStatus = "aman" | "rendah" | "habis";

function getProductStatus(stockKg: number, type: "GREEN_BEAN" | "ROASTED_BEAN"): StockStatus {
  const threshold = type === "GREEN_BEAN" ? 10 : 5;
  if (stockKg <= 0) return "habis";
  if (stockKg < threshold) return "rendah";
  return "aman";
}

function getPackagingStatus(stockUnit: number): StockStatus {
  if (stockUnit <= 0) return "habis";
  if (stockUnit < 50) return "rendah";
  return "aman";
}

function StatusBadge({ status }: { status: StockStatus }) {
  const map: Record<StockStatus, { label: string; className: string }> = {
    aman:   { label: "Aman",   className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    rendah: { label: "Rendah", className: "bg-amber-50 text-amber-700 border-amber-200"       },
    habis:  { label: "Habis",  className: "bg-red-50 text-red-600 border-red-200"             },
  };
  const { label, className } = map[status];
  return (
    <Badge variant="outline" className={`text-[11px] font-medium ${className}`}>
      {label}
    </Badge>
  );
}

// ─────────────────────────────────────────────
// Section header
// ─────────────────────────────────────────────

function SectionTitle({
  icon,
  label,
  count,
}: {
  icon: string;
  label: string;
  count: number;
}) {
  return (
    <div className="flex items-center gap-2 px-1 pb-2 pt-1">
      <span className="text-base">{icon}</span>
      <span className="text-sm font-semibold text-zinc-900">{label}</span>
      <span className="text-xs text-zinc-400">({count} SKU)</span>
    </div>
  );
}

// ─────────────────────────────────────────────
// Empty state
// ─────────────────────────────────────────────

function EmptyRows({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-6 text-center text-sm text-zinc-400">
        {label}
      </TableCell>
    </TableRow>
  );
}

// ─────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────

interface StockTableProps {
  gbStocks: ProductStockRow[];
  rbStocks: ProductStockRow[];
  pkgStocks: PackagingStockRow[];
}

// ─────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────

export function StockTable({ gbStocks, rbStocks, pkgStocks }: StockTableProps) {
  return (
    <div className="space-y-6">
      {/* ── Green Bean ── */}
      <section>
        <SectionTitle icon="🌿" label="Green Bean" count={gbStocks.length} />
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="w-32 text-xs font-semibold text-zinc-500">Kode</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Nama / Asal</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">Stok</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">HPP /kg</TableHead>
                <TableHead className="w-24 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {gbStocks.length === 0 ? (
                <EmptyRows colSpan={5} label="Belum ada Green Bean. Catat barang datang pertama." />
              ) : (
                gbStocks.map((row) => (
                  <TableRow key={row.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-mono text-xs text-zinc-500">{row.code}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-zinc-900">{row.name}</p>
                      {row.origin && (
                        <p className="text-xs text-zinc-400">{row.origin}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${row.stockKg <= 0 ? "text-zinc-400" : "text-zinc-900"}`}>
                        {formatKg(row.stockKg)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-600 tabular-nums">
                      {row.latestHppPerKg != null
                        ? formatRupiah(row.latestHppPerKg)
                        : <span className="text-zinc-300">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={getProductStatus(row.stockKg, row.type)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ── Roasted Bean ── */}
      <section>
        <SectionTitle icon="☕" label="Roasted Bean" count={rbStocks.length} />
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="w-32 text-xs font-semibold text-zinc-500">Kode</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Nama / Roast Level</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">Stok</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">HPP /kg</TableHead>
                <TableHead className="w-24 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rbStocks.length === 0 ? (
                <EmptyRows colSpan={5} label="Belum ada Roasted Bean. Catat batch roasting terlebih dahulu." />
              ) : (
                rbStocks.map((row) => (
                  <TableRow key={row.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-mono text-xs text-zinc-500">{row.code}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium text-zinc-900">{row.name}</p>
                      {row.roastLevel && (
                        <p className="text-xs text-zinc-400">{row.roastLevel.replace("_", " ")}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${row.stockKg <= 0 ? "text-zinc-400" : "text-zinc-900"}`}>
                        {formatKg(row.stockKg)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-600 tabular-nums">
                      {row.latestHppPerKg != null
                        ? formatRupiah(row.latestHppPerKg)
                        : <span className="text-zinc-300">—</span>}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={getProductStatus(row.stockKg, row.type)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ── Packaging ── */}
      <section>
        <SectionTitle icon="📦" label="Packaging" count={pkgStocks.length} />
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                <TableHead className="w-32 text-xs font-semibold text-zinc-500">Kode</TableHead>
                <TableHead className="text-xs font-semibold text-zinc-500">Nama</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">Berat Kemasan</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">Stok</TableHead>
                <TableHead className="text-right text-xs font-semibold text-zinc-500">HPP /unit</TableHead>
                <TableHead className="w-24 text-center text-xs font-semibold text-zinc-500">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pkgStocks.length === 0 ? (
                <EmptyRows colSpan={6} label="Belum ada packaging." />
              ) : (
                pkgStocks.map((row) => (
                  <TableRow key={row.id} className="hover:bg-zinc-50/50">
                    <TableCell className="font-mono text-xs text-zinc-500">{row.code}</TableCell>
                    <TableCell className="text-sm font-medium text-zinc-900">{row.name}</TableCell>
                    <TableCell className="text-right text-sm text-zinc-600">{row.weightGrams} g</TableCell>
                    <TableCell className="text-right">
                      <span className={`text-sm font-semibold tabular-nums ${row.stockUnit <= 0 ? "text-zinc-400" : "text-zinc-900"}`}>
                        {formatUnit(row.stockUnit)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm text-zinc-600 tabular-nums">
                      {formatRupiah(row.costPerUnit)}
                    </TableCell>
                    <TableCell className="text-center">
                      <StatusBadge status={getPackagingStatus(row.stockUnit)} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}
