"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, ArrowUpDown, ChevronDown } from "lucide-react";
import { formatKg, formatRupiah, formatUnit } from "@/lib/format";
import type { PackagingStockRow, ProductStockRow, FGStockRow } from "../actions";
import type { ReorderSummary } from "@/lib/reorder";
import { CategoryTabs, type CategoryId } from "./CategoryTabs";
import { InventoryStatusBadge } from "./InventoryStatusBadge";
import { InventoryEmptyState } from "./InventoryEmptyState";
import {
  getDisplayStatus,
  calcInventoryValue,
  formatInventoryValue,
  type DisplayStatus,
} from "@/lib/inventory-utils";

// ─── Unified row type ───

type UnifiedRow = {
  id: string;
  code: string;
  name: string;
  _type: "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  _unit: "kg" | "unit";
  _stockValue: number;
  _hpp: number | null;
  _meta: string | null;
  _reorderPoint?: number | null;
  _status: DisplayStatus;
};

// ─── Sort ───

type SortKey = "name" | "stock" | "hpp" | "value" | "status";

const STATUS_ORDER: Record<DisplayStatus, number> = {
  habis: 0,
  rendah: 1,
  belum_dikonfigurasi: 2,
  aman: 3,
};

// ─── Props ───

interface StockTableProps {
  gbStocks: ProductStockRow[];
  rbStocks: ProductStockRow[];
  fgStocks: FGStockRow[];
  pkgStocks: PackagingStockRow[];
  productReorderSummaries?: ReorderSummary[];
  packagingReorderSummaries?: ReorderSummary[];
  metricFilter?: string | null;
}

// ─── Main component ───

export function StockTable({
  gbStocks,
  rbStocks,
  fgStocks,
  pkgStocks,
  productReorderSummaries,
  packagingReorderSummaries,
  metricFilter,
}: StockTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial state from URL
  const categoryParam = searchParams.get("category");
  const statusParam = searchParams.get("status");
  const initialTab: CategoryId =
    categoryParam === "rb" || categoryParam === "fg" || categoryParam === "pkg" ? categoryParam : "gb";
  const initialStatus: "all" | DisplayStatus =
    statusParam === "aman" || statusParam === "rendah" || statusParam === "habis" || statusParam === "belum_dikonfigurasi"
      ? statusParam : "all";

  const [activeTab, setActiveTab] = useState<CategoryId>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | DisplayStatus>(initialStatus);
  const [sortKey, setSortKey] = useState<SortKey>("status");
  const [sortAsc, setSortAsc] = useState(true);

  // Sync URL → state on param change (e.g. browser back/forward)
  useEffect(() => {
    const cat = searchParams.get("category");
    if (cat === "gb" || cat === "rb" || cat === "fg" || cat === "pkg") setActiveTab(cat);
    const st = searchParams.get("status");
    if (st === "aman" || st === "rendah" || st === "habis" || st === "belum_dikonfigurasi") setStatusFilter(st);
    else if (!st) setStatusFilter("all");
  }, [searchParams]);

  const updateUrl = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null) params.delete(key);
      else params.set(key, value);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const productReorderMap = useMemo(() => {
    const map = new Map<string, ReorderSummary>();
    for (const s of productReorderSummaries ?? []) map.set(s.skuId, s);
    return map;
  }, [productReorderSummaries]);

  const packagingReorderMap = useMemo(() => {
    const map = new Map<string, ReorderSummary>();
    for (const s of packagingReorderSummaries ?? []) map.set(s.skuId, s);
    return map;
  }, [packagingReorderSummaries]);

  // Build unified rows with status — uses shared getDisplayStatus
  const allRows = useMemo(() => {
    const reorderMap = activeTab === "pkg" ? packagingReorderMap : productReorderMap;
    const rows: UnifiedRow[] = [];

    function makeRow(
      id: string, code: string, name: string,
      _type: UnifiedRow["_type"], _unit: UnifiedRow["_unit"],
      _stockValue: number, _hpp: number | null, _meta: string | null
    ): UnifiedRow {
      const summary = reorderMap.get(id);
      const status = getDisplayStatus(_stockValue, _type, summary);
      return { id, code, name, _type, _unit, _stockValue, _hpp, _meta, _status: status, _reorderPoint: summary?.reorderPoint };
    }

    if (activeTab === "gb") {
      for (const s of gbStocks) rows.push(makeRow(s.id, s.code, s.name, "GREEN_BEAN", "kg", Number(s.stockKg), s.latestHppPerKg, s.origin));
    } else if (activeTab === "rb") {
      for (const s of rbStocks) rows.push(makeRow(s.id, s.code, s.name, "ROASTED_BEAN", "kg", Number(s.stockKg), s.latestHppPerKg, s.roastLevel?.replace("_", " ") ?? null));
    } else if (activeTab === "fg") {
      for (const s of fgStocks) rows.push(makeRow(s.id, s.code, s.name, "FINISHED_GOODS", "unit", Number(s.stockUnit), s.latestHppPerUnit, null));
    } else {
      for (const s of pkgStocks) rows.push(makeRow(s.id, s.code, s.name, "PACKAGING", "unit", Number(s.stockUnit), s.costPerUnit, `${s.weightGrams}g`));
    }

    return rows;
  }, [activeTab, gbStocks, rbStocks, fgStocks, pkgStocks, productReorderMap, packagingReorderMap]);

  // Filter + sort
  const rows = useMemo(() => {
    let result = allRows;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((r) =>
        r.name.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r._meta && r._meta.toLowerCase().includes(q))
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((r) => r._status === statusFilter);
    }

    // Metric card filter
    if (metricFilter === "out-of-stock") {
      result = result.filter((r) => r._status === "habis");
    } else if (metricFilter === "needs-reorder") {
      result = result.filter((r) => r._status === "rendah");
    } else if (metricFilter === "not-configured") {
      result = result.filter((r) => r._status === "belum_dikonfigurasi");
    }

    result = [...result].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name": cmp = a.name.localeCompare(b.name); break;
        case "stock": cmp = a._stockValue - b._stockValue; break;
        case "hpp": cmp = (a._hpp ?? 0) - (b._hpp ?? 0); break;
        case "value": cmp = (calcInventoryValue(a._stockValue, a._hpp) ?? 0) - (calcInventoryValue(b._stockValue, b._hpp) ?? 0); break;
        case "status": cmp = STATUS_ORDER[a._status] - STATUS_ORDER[b._status]; break;
      }
      return sortAsc ? cmp : -cmp;
    });

    return result;
  }, [allRows, searchQuery, statusFilter, metricFilter, sortKey, sortAsc]);

  // Category tabs — uses same getDisplayStatus as table rows
  const categoryTabs = useMemo(() => {
    const hasIssue = (status: DisplayStatus) => status === "habis" || status === "rendah";
    return [
      { id: "gb" as const, label: "Green Bean", count: gbStocks.length, hasIssues: gbStocks.some((s) => hasIssue(getDisplayStatus(Number(s.stockKg), s.type, productReorderMap.get(s.id)))) },
      { id: "rb" as const, label: "Roasted Bean", count: rbStocks.length, hasIssues: rbStocks.some((s) => hasIssue(getDisplayStatus(Number(s.stockKg), s.type, productReorderMap.get(s.id)))) },
      { id: "fg" as const, label: "Produk Jadi", count: fgStocks.length, hasIssues: fgStocks.some((s) => hasIssue(getDisplayStatus(Number(s.stockUnit), s.type, productReorderMap.get(s.id)))) },
      { id: "pkg" as const, label: "Kemasan", count: pkgStocks.length, hasIssues: pkgStocks.some((s) => hasIssue(getDisplayStatus(Number(s.stockUnit), "PACKAGING", packagingReorderMap.get(s.id)))) },
    ];
  }, [gbStocks, rbStocks, fgStocks, pkgStocks, productReorderMap, packagingReorderMap]);

  const isKg = activeTab === "gb" || activeTab === "rb";

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="space-y-0">
      {/* Category Tabs */}
      <CategoryTabs tabs={categoryTabs} active={activeTab} onChange={(tab) => { setActiveTab(tab); setSearchQuery(""); setStatusFilter("all"); updateUrl({ category: tab, status: null }); }} />

      {/* Toolbar */}
      <div className="flex items-center gap-2 py-3">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari item..."
            className="h-8 pl-8 text-xs bg-white/60 border-slate-200"
          />
        </div>
        <div className="relative">
          <select
            value={statusFilter}
            onChange={(e) => { const v = e.target.value as typeof statusFilter; setStatusFilter(v); updateUrl({ status: v === "all" ? null : v }); }}
            className="h-8 appearance-none rounded-lg border border-slate-200 bg-white/60 pl-2.5 pr-7 text-xs font-medium text-slate-600 outline-none focus:border-blue-400"
          >
            <option value="all">Semua Status</option>
            <option value="aman">Aman</option>
            <option value="rendah">Menipis</option>
            <option value="habis">Habis</option>
            <option value="belum_dikonfigurasi">Belum Diatur</option>
          </select>
          <ChevronDown size={12} className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-hidden rounded-lg border border-slate-200/60 bg-white/50">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-slate-100">
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <button onClick={() => toggleSort("name")} className="flex items-center gap-1 hover:text-slate-700">
                  Item <ArrowUpDown size={10} />
                </button>
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <button onClick={() => toggleSort("stock")} className="flex items-center gap-1 hover:text-slate-700 ml-auto">
                  Stok <ArrowUpDown size={10} />
                </button>
              </TableHead>
              <TableHead className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <button onClick={() => toggleSort("status")} className="flex items-center gap-1 hover:text-slate-700">
                  Status <ArrowUpDown size={10} />
                </button>
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <button onClick={() => toggleSort("hpp")} className="flex items-center gap-1 hover:text-slate-700 ml-auto">
                  HPP <ArrowUpDown size={10} />
                </button>
              </TableHead>
              <TableHead className="text-right text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <button onClick={() => toggleSort("value")} className="flex items-center gap-1 hover:text-slate-700 ml-auto">
                  Nilai <ArrowUpDown size={10} />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8">
                  <InventoryEmptyState
                    label={searchQuery || statusFilter !== "all" ? "Tidak ada item yang cocok" : "Belum ada data"}
                    description={searchQuery || statusFilter !== "all" ? "Coba ubah filter atau pencarian." : "Belum ada item di kategori ini."}
                  />
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row) => {
                const valueInfo = formatInventoryValue(row._stockValue, row._hpp);
                return (
                  <TableRow key={row.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <p className="text-sm font-medium text-slate-900">{row.name}</p>
                      {row._meta && (
                        <p className="text-[10px] text-slate-500">{row._meta}</p>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn("text-sm font-semibold tabular-nums", row._stockValue <= 0 ? "text-slate-400" : "text-slate-900")}>
                        {isKg ? formatKg(row._stockValue) : formatUnit(row._stockValue)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <InventoryStatusBadge status={row._status} />
                    </TableCell>
                    <TableCell className="text-right text-xs text-slate-600 tabular-nums">
                      {row._hpp != null ? formatRupiah(row._hpp) : <span className="text-slate-300" title="HPP belum tersedia">—</span>}
                    </TableCell>
                    <TableCell className="text-right text-xs font-semibold text-slate-900 tabular-nums">
                      <span title={valueInfo.unavailable ? "HPP belum tersedia" : undefined}>
                        {valueInfo.text}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-1.5">
        {rows.length === 0 ? (
          <div className="py-8 text-center rounded-lg border border-slate-200/60 bg-white/50">
            <InventoryEmptyState
              label={searchQuery || statusFilter !== "all" ? "Tidak ada item yang cocok" : "Belum ada data"}
            />
          </div>
        ) : (
          rows.map((row) => {
            const valueInfo = formatInventoryValue(row._stockValue, row._hpp);
            return (
              <div
                key={row.id}
                className="flex justify-between items-center rounded-lg border border-slate-200/60 bg-white/50 px-3 py-2.5"
              >
                <div className="min-w-0 flex-1 mr-3">
                  <p className="text-sm font-medium text-slate-900 truncate">{row.name}</p>
                  {row._meta && (
                    <p className="text-[10px] text-slate-500 truncate">{row._meta}</p>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <InventoryStatusBadge status={row._status} />
                    <span className="text-[10px] text-slate-500 tabular-nums" title={valueInfo.unavailable ? "HPP belum tersedia" : undefined}>
                      {valueInfo.text}
                    </span>
                  </div>
                </div>
                <span className={cn("text-sm font-semibold tabular-nums shrink-0", row._stockValue <= 0 ? "text-slate-400" : "text-slate-900")}>
                  {isKg ? formatKg(row._stockValue) : formatUnit(row._stockValue)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
