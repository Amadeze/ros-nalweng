"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
import type { PackagingStockRow, ProductStockRow, FGStockRow } from "../actions";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Status thresholds & badge helpers
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type StockStatus = "aman" | "rendah" | "habis";

function getProductStatus(stock: number, type: "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS"): StockStatus {
  const threshold = type === "GREEN_BEAN" ? 10 : 5;
  if (stock <= 0) return "habis";
  if (stock < threshold) return "rendah";
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Section header
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Empty state
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function EmptyRows({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="py-6 text-center text-sm text-zinc-400">
        {label}
      </TableCell>
    </TableRow>
  );
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Props
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface StockTableProps {
  gbStocks: ProductStockRow[];
  rbStocks: ProductStockRow[];
  fgStocks: FGStockRow[];
  pkgStocks: PackagingStockRow[];
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Main component
// ——————————————————————————————————————————————————————————————————————————

export function StockTable({ gbStocks, rbStocks, fgStocks, pkgStocks }: StockTableProps) {
  const [activeTab, setActiveTab] = useState<"gb" | "rb" | "fg" | "pkg">("gb");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab === "gb" || tab === "rb" || tab === "fg" || tab === "pkg") {
      setActiveTab(tab as "gb" | "rb" | "fg" | "pkg");
    }
  }, []);

  const tabs = [
    { id: "gb", label: "Green Bean", count: gbStocks.length, icon: "🌱" },
    { id: "rb", label: "Roasted Bean", count: rbStocks.length, icon: "☕" },
    { id: "fg", label: "Finished Goods", count: fgStocks?.length || 0, icon: "🛍️" },
    { id: "pkg", label: "Packaging", count: pkgStocks.length, icon: "📦" },
  ] as const;

  const glassCard = "hidden md:block overflow-hidden rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl shadow-lg shadow-slate-200/30";
  const glassHeader = "bg-white/40 border-b border-white/50 backdrop-blur-md";

  return (
    <div className="space-y-6">
      
      {/* â”€â”€ Tabs Navigation â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-white/20 p-2 rounded-2xl backdrop-blur-md border border-white/50">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 rounded-xl py-2 px-2 text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-sm text-center",
              activeTab === tab.id
                ? "bg-blue-500 text-white shadow-md ring-2 ring-blue-500/20 scale-[1.02]"
                : "bg-white/40 text-slate-600 border border-white/60 hover:bg-white/60 hover:text-slate-800 hover:scale-[1.02]"
            )}
          >
            <div className="flex items-center gap-1.5">
              <span>{tab.icon}</span>
              <span className="leading-tight">{tab.label}</span>
            </div>
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[9px] font-black tracking-wider",
              activeTab === tab.id ? "bg-white/20 text-white" : "bg-slate-900/10 text-slate-500"
            )}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* â”€â”€ Green Bean â”€â”€ */}
      {activeTab === "gb" && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionTitle icon="🌱" label="Green Bean" count={gbStocks.length} />
          <div className={glassCard}>
            <Table>
              <TableHeader>
                <TableRow className={glassHeader}>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama / Asal</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Stok</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">HPP /kg</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nilai (Rp)</TableHead>
                  <TableHead className="w-24 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gbStocks.length === 0 ? (
                  <EmptyRows colSpan={4} label="Belum ada Green Bean. Catat barang datang pertama." />
                ) : (
                  gbStocks.map((row) => (
                    <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                      <TableCell>
                        <p className="text-sm font-bold text-slate-900">{row.name}</p>
                        {row.origin && (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{row.origin}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-black tabular-nums ${row.stockKg <= 0 ? "text-slate-400" : "text-slate-900"}`}>
                          {formatKg(row.stockKg)}
                        </span>
                      </TableCell>
                      <TableCell  className="text-right text-sm font-semibold text-slate-600 tabular-nums">
                        {row.latestHppPerKg != null
                          ? formatRupiah(row.latestHppPerKg)
                          : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell  className="text-right text-sm font-black text-slate-900 tabular-nums">
                        {row.latestHppPerKg != null
                          ? formatRupiah(row.latestHppPerKg * Number(row.stockKg))
                          : <span className="text-slate-300">-</span>}
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
          
          <div className="md:hidden flex flex-col gap-2 mt-4">
            {gbStocks.length === 0 ? (
              <div className="py-8 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl"><p className="text-sm text-zinc-400">Belum ada Green Bean.</p></div>
            ) : (
              gbStocks.map((row) => (
                <div key={row.id} className="flex justify-between items-center rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-slate-900">{row.name}</p>
                    {row.origin && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{row.origin}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-mono text-sm font-black ${row.stockKg <= 0 ? 'text-slate-400' : 'text-emerald-700'}`}>{formatKg(row.stockKg)}</span>
                    <StatusBadge status={getProductStatus(row.stockKg, row.type)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* â”€â”€ Roasted Bean â”€â”€ */}
      {activeTab === "rb" && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionTitle icon="☕" label="Roasted Bean" count={rbStocks.length} />
          <div className={glassCard}>
            <Table>
              <TableHeader>
                <TableRow className={glassHeader}>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama / Roast Level</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Stok</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">HPP /kg</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nilai (Rp)</TableHead>
                  <TableHead className="w-24 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rbStocks.length === 0 ? (
                  <EmptyRows colSpan={4} label="Belum ada Roasted Bean. Catat batch roasting terlebih dahulu." />
                ) : (
                  rbStocks.map((row) => (
                    <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                      <TableCell>
                        <p className="text-sm font-bold text-slate-900">{row.name}</p>
                        {row.roastLevel && (
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{row.roastLevel.replace("_", " ")}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-black tabular-nums ${row.stockKg <= 0 ? "text-slate-400" : "text-slate-900"}`}>
                          {formatKg(row.stockKg)}
                        </span>
                      </TableCell>
                      <TableCell  className="text-right text-sm font-semibold text-slate-600 tabular-nums">
                        {row.latestHppPerKg != null
                          ? formatRupiah(row.latestHppPerKg)
                          : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell  className="text-right text-sm font-black text-slate-900 tabular-nums">
                        {row.latestHppPerKg != null
                          ? formatRupiah(row.latestHppPerKg * Number(row.stockKg))
                          : <span className="text-slate-300">-</span>}
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
          
          <div className="md:hidden flex flex-col gap-2 mt-4">
            {rbStocks.length === 0 ? (
              <div className="py-8 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl"><p className="text-sm text-zinc-400">Belum ada Roasted Bean.</p></div>
            ) : (
              rbStocks.map((row) => (
                <div key={row.id} className="flex justify-between items-center rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-slate-900">{row.name}</p>
                    {row.roastLevel && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] font-bold text-slate-500 uppercase">{row.roastLevel.replace("_", " ")}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-mono text-sm font-black ${row.stockKg <= 0 ? 'text-slate-400' : 'text-emerald-700'}`}>{formatKg(row.stockKg)}</span>
                    <StatusBadge status={getProductStatus(row.stockKg, row.type)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ——— Finished Goods ——— */}
      {activeTab === "fg" && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionTitle icon="🛍️" label="Finished Goods" count={fgStocks?.length || 0} />
          <div className={glassCard}>
            <Table>
              <TableHeader>
                <TableRow className={glassHeader}>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Produk</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Stok (Unit)</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">HPP /unit</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nilai (Rp)</TableHead>
                  <TableHead className="w-24 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {!fgStocks || fgStocks.length === 0 ? (
                  <EmptyRows colSpan={4} label="Belum ada Finished Goods. Lakukan produksi terlebih dahulu." />
                ) : (
                  fgStocks.map((row) => (
                    <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                      <TableCell>
                        <p className="text-sm font-bold text-slate-900">{row.name}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-black tabular-nums ${row.stockUnit <= 0 ? "text-slate-400" : "text-slate-900"}`}>
                          {row.stockUnit}
                        </span>
                      </TableCell>
                      <TableCell  className="text-right text-sm font-semibold text-slate-600 tabular-nums">
                        {row.latestHppPerUnit != null
                          ? formatRupiah(row.latestHppPerUnit)
                          : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell  className="text-right text-sm font-black text-slate-900 tabular-nums">
                        {row.latestHppPerUnit != null
                          ? formatRupiah(row.latestHppPerUnit * Number(row.stockUnit))
                          : <span className="text-slate-300">-</span>}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={getProductStatus(row.stockUnit, row.type)} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="md:hidden flex flex-col gap-2 mt-4">
            {!fgStocks || fgStocks.length === 0 ? (
              <div className="py-8 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl"><p className="text-sm text-zinc-400">Belum ada Finished Goods.</p></div>
            ) : (
              fgStocks.map((row) => (
                <div key={row.id} className="flex justify-between items-center rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-slate-900">{row.name}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-mono text-sm font-black ${row.stockUnit <= 0 ? 'text-slate-400' : 'text-emerald-700'}`}>{row.stockUnit} Unit</span>
                    <StatusBadge status={getProductStatus(row.stockUnit, row.type)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* ——— Packaging ——— */}
      {activeTab === "pkg" && (
        <section className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <SectionTitle icon="📦" label="Packaging" count={pkgStocks.length} />
          <div className={glassCard}>
            <Table>
              <TableHeader>
                <TableRow className={glassHeader}>
                  <TableHead className="text-xs font-bold uppercase tracking-widest text-slate-500">Nama Barang</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Berat Kemasan</TableHead>
                  <TableHead className="text-right text-xs font-bold uppercase tracking-widest text-slate-500">Stok</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">HPP /unit</TableHead>
                  <TableHead className=" text-right text-xs font-bold uppercase tracking-widest text-slate-500">Nilai (Rp)</TableHead>
                  <TableHead className="w-24 text-center text-xs font-bold uppercase tracking-widest text-slate-500">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pkgStocks.length === 0 ? (
                  <EmptyRows colSpan={4} label="Belum ada Kemasan. Catat pembelian kemasan terlebih dahulu." />
                ) : (
                  pkgStocks.map((row) => (
                    <TableRow key={row.id} className="hover:bg-white/40 transition-colors">
                      <TableCell className="text-sm font-bold text-slate-900">{row.name}</TableCell>
                      <TableCell  className="text-right text-[11px] font-bold text-slate-500">{row.weightGrams} g</TableCell>
                      <TableCell className="text-right">
                        <span className={`text-sm font-black tabular-nums ${row.stockUnit <= 0 ? "text-slate-400" : "text-slate-900"}`}>
                          {formatUnit(row.stockUnit)}
                        </span>
                      </TableCell>
                      <TableCell  className="text-right text-sm font-semibold text-slate-600 tabular-nums">
                        {formatRupiah(row.costPerUnit)}
                      </TableCell>
                      <TableCell  className="text-right text-sm font-black text-slate-900 tabular-nums">
                        {formatRupiah(row.costPerUnit * Number(row.stockUnit))}
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
          
          <div className="md:hidden flex flex-col gap-2 mt-4">
            {pkgStocks.length === 0 ? (
              <div className="py-8 text-center rounded-[1.25rem] border border-white/60 bg-white/30 backdrop-blur-xl"><p className="text-sm text-zinc-400">Belum ada packaging.</p></div>
            ) : (
              pkgStocks.map((row) => (
                <div key={row.id} className="flex justify-between items-center rounded-[1.25rem] border border-white/60 bg-white/30 p-4 shadow-sm backdrop-blur-xl">
                  <div className="flex flex-col gap-1">
                    <p className="font-bold text-slate-900">{row.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="font-mono text-[10px] font-semibold text-slate-600">{row.code}</span>
                      <span className="text-[10px] text-slate-400">•</span>
                      <span className="text-[10px] font-bold text-slate-500">{row.weightGrams}g</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`font-mono text-sm font-black ${row.stockUnit <= 0 ? 'text-slate-400' : 'text-emerald-700'}`}>{formatUnit(row.stockUnit)}</span>
                    <StatusBadge status={getPackagingStatus(row.stockUnit)} />
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
}



