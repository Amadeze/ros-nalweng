"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Boxes, History, ClipboardList, Download, FileText, FileSpreadsheet, Loader2, MoreHorizontal, Package, Plus, Settings2, Truck, ArrowDownCircle, ArrowUpCircle, AlertTriangle, XCircle, Clock, CheckCircle2, Ban, CircleDot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { StockTable } from "./StockTable";
import { PurchaseForm } from "./PurchaseForm";
import { PackagingPurchaseForm } from "./PackagingPurchaseForm";
import { StockAdjustmentDrawer } from "./StockAdjustmentDrawer";
import { LedgerHistoryTable } from "./LedgerHistoryTable";
import { POList } from "./POList";
import { PODetail } from "./PODetail";
import { POForm } from "./POForm";
import { ReceivingList } from "./ReceivingList";
import { InventoryMetricCard } from "./InventoryMetricCard";
import { SupplierForm } from "../../master-data/_components/SupplierForm";
import type {
  GBProductOption,
  LedgerHistoryRow,
  PackagingStockRow,
  ProductStockRow,
  FGStockRow,
  SupplierOption,
} from "../actions";
import type { ReorderSummary } from "@/lib/reorder";
import { calcInventoryMetrics, isReorderConfigured } from "@/lib/inventory-utils";
import { formatRupiah } from "@/lib/format";

interface PackagingOption { id: string; name: string; code: string; costPerUnit: number; }

interface InventoryClientProps {
  gbStocks:   ProductStockRow[];
  rbStocks:   ProductStockRow[];
  fgStocks:   FGStockRow[];
  pkgStocks:  PackagingStockRow[];
  ledgerEntries: LedgerHistoryRow[];
  suppliers:  SupplierOption[];
  gbProducts: GBProductOption[];
  packagings: PackagingOption[];
  productReorderSummaries?: ReorderSummary[];
  packagingReorderSummaries?: ReorderSummary[];
  poSummary?: {
    draft: number;
    sent: number;
    partial: number;
    received: number;
    cancelled: number;
    total: number;
  };
}

// ── Export helpers ──

function exportPDF(isLedger: boolean, gbStocks: ProductStockRow[], filteredLedger: LedgerHistoryRow[]) {
  import('jspdf').then(({ jsPDF }) => {
    import('jspdf-autotable').then(({ default: autoTable }) => {
      const doc = new jsPDF();
      doc.text(isLedger ? "Riwayat Mutasi Stok" : "Laporan Stok Green Bean", 14, 15);
      const tableData = isLedger
        ? filteredLedger.map((entry) => [
            new Date(entry.createdAt).toLocaleString("id-ID"),
            entry.itemCode,
            entry.itemName,
            entry.entryType,
            entry.quantity,
            entry.unit,
            entry.refType,
          ])
        : gbStocks.map(i => [i.name, i.stockKg, i.latestHppPerKg || 0]);
      autoTable(doc, {
        head: isLedger
          ? [["Waktu", "Kode", "Item", "Arah", "Jumlah", "Unit", "Referensi"]]
          : [['Nama Green Bean', 'Stok (Kg)', 'HPP/Kg']],
        body: tableData,
        startY: 20
      });
      doc.save(isLedger ? "Mutasi_Stok.pdf" : "Laporan_Stok.pdf");
    });
  });
}

async function exportExcel(isLedger: boolean, gbStocks: ProductStockRow[], filteredLedger: LedgerHistoryRow[]) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const rows = isLedger
    ? [
        ["Waktu", "Kode", "Item", "Arah", "Jumlah", "Unit", "Referensi", "ID Referensi", "Catatan", "Operator"],
        ...filteredLedger.map((entry) => [
          new Date(entry.createdAt).toLocaleString("id-ID"),
          entry.itemCode,
          entry.itemName,
          entry.entryType,
          entry.quantity,
          entry.unit,
          entry.refType,
          entry.refId,
          entry.notes ?? "",
          entry.createdByName,
        ]),
      ]
    : [
        ["Nama", "Stok (Kg)", "HPP/Kg"],
        ...gbStocks.map((item) => [
          item.name,
          item.stockKg,
          item.latestHppPerKg || 0,
        ]),
      ];
  await writeXlsxFile(rows, {
    sheet: isLedger ? "Ledger" : "Stok GB",
  }).toFile(isLedger ? "Mutasi_Stok.xlsx" : "Laporan_Stok.xlsx");
}

// ── Export dropdown ──

function ExportMenu({ onExportPDF, onExportExcel }: { onExportPDF: () => void; onExportExcel: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200/60 bg-white/50 text-slate-600 hover:bg-white/70 transition-colors" aria-label="Export">
        <Download size={14} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-36 rounded-lg border border-slate-200 bg-white shadow-lg py-0.5">
          <button onClick={() => { onExportPDF(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <FileText size={12} className="text-slate-400" /> PDF
          </button>
          <button onClick={() => { onExportExcel(); setOpen(false); }} className="flex w-full items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <FileSpreadsheet size={12} className="text-slate-400" /> Excel
          </button>
        </div>
      )}
    </div>
  );
}

// ── Actions dropdown ──

function ActionsDropdown({ onStockOpname, onKemasanDatang }: { onStockOpname: () => void; onKemasanDatang: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const handleKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => { document.removeEventListener("mousedown", handleClick); document.removeEventListener("keydown", handleKey); };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((p) => !p)} className="flex h-8 items-center gap-1 rounded-lg border border-slate-200/60 bg-white/50 px-2.5 text-xs font-medium text-slate-600 hover:bg-white/70 transition-colors" aria-label="Aksi lainnya">
        <MoreHorizontal size={14} />
        <span className="hidden sm:inline">Aksi</span>
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-slate-200 bg-white shadow-lg py-0.5">
          <button onClick={() => { onStockOpname(); setOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Settings2 size={12} className="text-slate-400" /> Stock Opname
          </button>
          <button onClick={() => { onKemasanDatang(); setOpen(false); }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            <Package size={12} className="text-slate-400" /> Kemasan Datang
          </button>
        </div>
      )}
    </div>
  );
}

// ── Workspace tabs ──

type WorkspaceTab = "stock" | "po" | "receiving" | "mutations";

const WORKSPACE_TABS: Array<{ id: WorkspaceTab; label: string; icon: typeof Boxes }> = [
  { id: "stock", label: "Stok", icon: Boxes },
  { id: "po", label: "Purchase Order", icon: ClipboardList },
  { id: "receiving", label: "Penerimaan", icon: Truck },
  { id: "mutations", label: "Mutasi Stok", icon: History },
];

// ── Main component ──

export function InventoryClient({
  gbStocks, rbStocks, fgStocks, pkgStocks, ledgerEntries, suppliers, gbProducts, packagings,
  productReorderSummaries, packagingReorderSummaries, poSummary,
}: InventoryClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [gbDrawerOpen,  setGbDrawerOpen]  = useState(false);
  const [pkgDrawerOpen, setPkgDrawerOpen] = useState(false);
  const [adjDrawerOpen, setAdjDrawerOpen] = useState(false);
  const [poDrawerOpen, setPoDrawerOpen] = useState(false);
  const [poDetailOpen, setPoDetailOpen] = useState(false);
  const [supplierDrawerOpen, setSupplierDrawerOpen] = useState(false);
  const [supplierTarget, setSupplierTarget] = useState<"purchase" | "packaging" | "po" | null>(null);
  const [preferredSupplierId, setPreferredSupplierId] = useState<string | null>(null);
  const [supplierOptions, setSupplierOptions] = useState(suppliers);
  const [selectedPoId, setSelectedPoId] = useState<string | null>(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);
  const [isSupplierSubmitting, setIsSupplierSubmitting] = useState(false);
  const [filteredLedger, setFilteredLedger] = useState(ledgerEntries);
  const [poRefreshKey, setPoRefreshKey] = useState(0);

  useEffect(() => {
    setSupplierOptions(suppliers);
  }, [suppliers]);

  const openSupplierQuickAdd = (target: "purchase" | "packaging" | "po") => {
    setSupplierTarget(target);
    setPreferredSupplierId(null);
    setSupplierDrawerOpen(true);
  };

  const finishSupplierFlow = () => {
    setSupplierTarget(null);
    setPreferredSupplierId(null);
  };

  // URL-synced workspace tab
  const viewParam = searchParams.get("view");
  const metricParam = searchParams.get("metric");
  const activeView: WorkspaceTab =
    viewParam === "po" || viewParam === "receiving" || viewParam === "mutations" ? viewParam : "stock";

  const setActiveView = useCallback((view: WorkspaceTab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", view);
    params.delete("metric");
    params.delete("category");
    params.delete("status");
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const toggleMetric = useCallback((metric: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get("metric") === metric) {
      params.delete("metric");
    } else {
      params.set("metric", metric);
    }
    router.push(`?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const adjustmentItems = [
    ...gbStocks.map(i => ({ id: i.id, label: i.name, type: "GREEN_BEAN" as const, currentStock: Number(i.stockKg) })),
    ...rbStocks.map(i => ({ id: i.id, label: i.name, type: "ROASTED_BEAN" as const, currentStock: Number(i.stockKg) })),
    ...fgStocks.map(i => ({ id: i.id, label: i.name, type: "FINISHED_GOODS" as const, currentStock: Number(i.stockUnit) })),
    ...pkgStocks.map(i => ({ id: i.id, label: i.name, type: "PACKAGING" as const, currentStock: Number(i.stockUnit) })),
  ];

  const handlePORefresh = () => setPoRefreshKey((k) => k + 1);

  // ── Metrics per workspace ──

  const stockMetrics = useMemo(() => calcInventoryMetrics(gbStocks, rbStocks, fgStocks, pkgStocks, productReorderSummaries, packagingReorderSummaries), [gbStocks, rbStocks, fgStocks, pkgStocks, productReorderSummaries, packagingReorderSummaries]);

  const notConfiguredCount = useMemo(() => {
    let count = 0;
    const allProducts = [...gbStocks, ...rbStocks];
    const productMap = new Map<string, ReorderSummary>();
    for (const s of productReorderSummaries ?? []) productMap.set(s.skuId, s);
    const pkgMap = new Map<string, ReorderSummary>();
    for (const s of packagingReorderSummaries ?? []) pkgMap.set(s.skuId, s);
    for (const p of allProducts) { if (!isReorderConfigured(productMap.get(p.id))) count++; }
    for (const fg of fgStocks) { if (!isReorderConfigured(productMap.get(fg.id))) count++; }
    for (const pkg of pkgStocks) { if (!isReorderConfigured(pkgMap.get(pkg.id))) count++; }
    return count;
  }, [gbStocks, rbStocks, fgStocks, pkgStocks, productReorderSummaries, packagingReorderSummaries]);

  const poMetrics = useMemo(() => {
    if (!poSummary) return { active: 0, waiting: 0, partial: 0, overdue: 0 };
    return {
      active: (poSummary.sent ?? 0) + (poSummary.partial ?? 0),
      waiting: poSummary.sent ?? 0,
      partial: poSummary.partial ?? 0,
      overdue: 0, // will be computed from data if available
    };
  }, [poSummary]);

  const receivingMetrics = useMemo(() => {
    const sent = poSummary?.sent ?? 0;
    const partial = poSummary?.partial ?? 0;
    return {
      waitingToReceive: sent + partial,
      receivedToday: 0, // computed from ledger if needed
      withDiscrepancy: 0, // not available yet
      withoutPO: 0, // not available yet
    };
  }, [poSummary]);

  const mutationMetrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayEntries = ledgerEntries.filter((e) => new Date(e.createdAt) >= today);
    const inbound = todayEntries.filter((e) => e.entryType === "IN").length;
    const outbound = todayEntries.filter((e) => e.entryType === "OUT").length;
    const opname = todayEntries.filter((e) => e.refType === "ADJUSTMENT_IN" || e.refType === "ADJUSTMENT_OUT").length;
    return { inbound, outbound, opname, total: todayEntries.length };
  }, [ledgerEntries]);

  // ── Context-aware primary action ──

  const primaryAction = useMemo(() => {
    switch (activeView) {
      case "stock": return { label: "Barang Datang", icon: <Plus size={14} />, onClick: () => setGbDrawerOpen(true) };
      case "po": return { label: "Buat PO", icon: <Plus size={14} />, onClick: () => setPoDrawerOpen(true) };
      case "receiving": return { label: "Catat Penerimaan", icon: <Truck size={14} />, onClick: () => setAdjDrawerOpen(true) };
      case "mutations": return null;
    }
  }, [activeView]);

  const mobileFabItems = useMemo(() => {
    switch (activeView) {
      case "stock": return [
        { label: "Stock Opname", icon: <Settings2 size={16} />, onClick: () => setAdjDrawerOpen(true), variant: "secondary" as const },
        { label: "Kemasan Datang", icon: <Package size={16} />, onClick: () => setPkgDrawerOpen(true), variant: "secondary" as const },
        { label: "Barang Datang", icon: <Plus size={16} />, onClick: () => setGbDrawerOpen(true), variant: "primary" as const },
      ];
      case "po": return [
        { label: "Buat PO", icon: <ClipboardList size={16} />, onClick: () => setPoDrawerOpen(true), variant: "primary" as const },
      ];
      case "receiving": return undefined; // no FAB for receiving
      case "mutations": return undefined; // no FAB for mutations
    }
  }, [activeView]);

  // ── Export context ──
  const isMutations = activeView === "mutations";

  return (
    <>
      <StandardPageLayout
        title="Inventory"
        description="Pusat kendali persediaan — stok real-time dari agregasi mutasi transaksi"
        actionButton={
          <div className="flex items-center gap-1.5">
            <ExportMenu
              onExportPDF={() => exportPDF(isMutations, gbStocks, filteredLedger)}
              onExportExcel={() => exportExcel(isMutations, gbStocks, filteredLedger)}
            />
            <ActionsDropdown onStockOpname={() => setAdjDrawerOpen(true)} onKemasanDatang={() => setPkgDrawerOpen(true)} />
            {primaryAction && (
              <Button size="sm" className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 font-semibold rounded-lg h-8 text-xs" onClick={primaryAction.onClick}>
                {primaryAction.icon}
                {primaryAction.label}
              </Button>
            )}
          </div>
        }
        mobileSpeedDialItems={mobileFabItems}
        mobileHeaderActions={
          <ExportMenu
            onExportPDF={() => exportPDF(isMutations, gbStocks, filteredLedger)}
            onExportExcel={() => exportExcel(isMutations, gbStocks, filteredLedger)}
          />
        }
      >
        {/* ── Workspace Tabs ── */}
        <div className="flex items-center gap-0 border-b border-slate-200/60">
          {WORKSPACE_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeView === tab.id;
            return (
              <button key={tab.id} type="button" onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-1.5 px-3 py-2 text-sm font-semibold transition-colors ${isActive ? "text-amber-800" : "text-slate-500 hover:text-slate-700"}`}>
                <Icon size={14} />
                {tab.label}
                {isActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-700 rounded-t" />}
              </button>
            );
          })}
        </div>

        {/* ── Metric Cards ── */}
        <div className="mt-4 mb-2 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {activeView === "stock" && (
            <>
              <InventoryMetricCard label="Nilai Persediaan" value={formatRupiah(stockMetrics.totalValue)} icon={Package} tone="blue" />
              <InventoryMetricCard label="Stok Habis" value={stockMetrics.outOfStockCount} icon={XCircle} tone="red" onClick={() => toggleMetric("out-of-stock")} active={metricParam === "out-of-stock"} />
              <InventoryMetricCard label="Perlu Dipesan" value={stockMetrics.needsOrderCount} icon={AlertTriangle} tone="orange" onClick={() => toggleMetric("needs-reorder")} active={metricParam === "needs-reorder"} />
              <InventoryMetricCard label="Belum Disetel Manual" value={notConfiguredCount} icon={CircleDot} tone="neutral" helperText="Status stok tetap dihitung otomatis" onClick={() => toggleMetric("not-configured")} active={metricParam === "not-configured"} />
            </>
          )}
          {activeView === "po" && (
            <>
              <InventoryMetricCard label="PO Aktif" value={poMetrics.active} icon={ClipboardList} tone="blue" onClick={() => toggleMetric("active")} active={metricParam === "active"} />
              <InventoryMetricCard label="Menunggu Supplier" value={poMetrics.waiting} icon={Clock} tone="orange" onClick={() => toggleMetric("waiting")} active={metricParam === "waiting"} />
              <InventoryMetricCard label="Diterima Sebagian" value={poMetrics.partial} icon={CheckCircle2} tone="orange" onClick={() => toggleMetric("partial")} active={metricParam === "partial"} />
              <InventoryMetricCard label="Lewat Estimasi" value={poMetrics.overdue} icon={Ban} tone="red" />
            </>
          )}
          {activeView === "receiving" && (
            <>
              <InventoryMetricCard label="Menunggu Diterima" value={receivingMetrics.waitingToReceive} icon={Truck} tone="blue" onClick={() => toggleMetric("waiting")} active={metricParam === "waiting"} />
              <InventoryMetricCard label="Diterima Hari Ini" value={receivingMetrics.receivedToday} icon={CheckCircle2} tone="green" onClick={() => toggleMetric("received-today")} active={metricParam === "received-today"} />
              <InventoryMetricCard label="Penerimaan Berselisih" value={receivingMetrics.withDiscrepancy} icon={AlertTriangle} tone="orange" helperText="Belum tersedia" />
              <InventoryMetricCard label="Penerimaan Tanpa PO" value={receivingMetrics.withoutPO} icon={CircleDot} tone="neutral" helperText="Belum tersedia" />
            </>
          )}
          {activeView === "mutations" && (
            <>
              <InventoryMetricCard label="Stok Masuk Hari Ini" value={mutationMetrics.inbound} icon={ArrowDownCircle} tone="green" onClick={() => toggleMetric("inbound-today")} active={metricParam === "inbound-today"} />
              <InventoryMetricCard label="Stok Keluar Hari Ini" value={mutationMetrics.outbound} icon={ArrowUpCircle} tone="red" onClick={() => toggleMetric("outbound-today")} active={metricParam === "outbound-today"} />
              <InventoryMetricCard label="Stock Opname Hari Ini" value={mutationMetrics.opname} icon={Settings2} tone="orange" onClick={() => toggleMetric("opname-today")} active={metricParam === "opname-today"} />
              <InventoryMetricCard label="Total Mutasi Hari Ini" value={mutationMetrics.total} icon={History} tone="blue" />
            </>
          )}
        </div>

        {/* ── Workspace Content ── */}
        <div>
          {activeView === "stock" && (
            <StockTable
              gbStocks={gbStocks}
              rbStocks={rbStocks}
              fgStocks={fgStocks}
              pkgStocks={pkgStocks}
              productReorderSummaries={productReorderSummaries}
              packagingReorderSummaries={packagingReorderSummaries}
              metricFilter={metricParam}
            />
          )}
          {activeView === "po" && (
            <POList
              refreshKey={poRefreshKey}
              onSelectPO={(poId) => { setSelectedPoId(poId); setPoDetailOpen(true); }}
              metricFilter={metricParam}
            />
          )}
          {activeView === "receiving" && (
            <ReceivingList
              refreshKey={poRefreshKey}
              onSelectPO={(poId) => { setSelectedPoId(poId); setPoDetailOpen(true); }}
            />
          )}
          {activeView === "mutations" && (
            <LedgerHistoryTable entries={ledgerEntries} onFilteredEntriesChange={setFilteredLedger} />
          )}
        </div>
      </StandardPageLayout>

      {/* ── Drawers ── */}
      <StandardDrawer open={gbDrawerOpen} onOpenChange={(open) => { if (!isSubmitting) setGbDrawerOpen(open); }} title="Catat Barang Datang (Green Bean)" description="Stok Green Bean akan bertambah otomatis setelah disimpan." size="lg"
        submitButton={<Button type="submit" form="purchase-form" size="sm" disabled={isSubmitting} className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 font-semibold rounded-lg disabled:opacity-60">{isSubmitting && <Loader2 size={13} className="animate-spin" />}{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>}>
        <PurchaseForm id="purchase-form" suppliers={supplierOptions} gbProducts={gbProducts} onSuccess={() => { setGbDrawerOpen(false); finishSupplierFlow(); router.refresh(); }} onPendingChange={setIsSubmitting} onAddSupplier={() => openSupplierQuickAdd("purchase")} preferredSupplierId={supplierTarget === "purchase" ? preferredSupplierId : null} />
      </StandardDrawer>

      <StandardDrawer open={pkgDrawerOpen} onOpenChange={(open) => { if (!isSubmitting) setPkgDrawerOpen(open); }} title="Catat Kemasan Datang" description="Stok Kemasan akan bertambah otomatis setelah disimpan." size="md"
        submitButton={<Button type="submit" form="pkg-purchase-form" size="sm" disabled={isSubmitting} className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 font-semibold rounded-lg disabled:opacity-60">{isSubmitting && <Loader2 size={13} className="animate-spin" />}{isSubmitting ? "Menyimpan..." : "Simpan"}</Button>}>
        <PackagingPurchaseForm suppliers={supplierOptions} packagings={packagings} onPendingChange={setIsSubmitting} onAddSupplier={() => openSupplierQuickAdd("packaging")} preferredSupplierId={supplierTarget === "packaging" ? preferredSupplierId : null} onSuccess={() => { setPkgDrawerOpen(false); setIsSubmitting(false); finishSupplierFlow(); router.refresh(); }} />
      </StandardDrawer>

      <StandardDrawer open={adjDrawerOpen} onOpenChange={(open) => { if (!isSubmitting) setAdjDrawerOpen(open); }} title="Penyesuaian Stok (Opname)" description="Gunakan fitur ini untuk menyamakan stok digital dengan fisik." size="md"
        submitButton={<Button type="submit" form="adjustment-form" size="sm" disabled={isSubmitting} className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 font-semibold rounded-lg disabled:opacity-60">{isSubmitting && <Loader2 size={13} className="animate-spin" />}{isSubmitting ? "Menyimpan..." : "Simpan Opname"}</Button>}>
        <StockAdjustmentDrawer id="adjustment-form" items={adjustmentItems} onSuccess={() => setAdjDrawerOpen(false)} onPendingChange={setIsSubmitting} />
      </StandardDrawer>

      <StandardDrawer open={poDrawerOpen} onOpenChange={(open) => { if (!isSubmitting) setPoDrawerOpen(open); }} title="Buat Purchase Order" description="Buat PO baru untuk supplier." size="lg">
        <POForm id="po-form" suppliers={supplierOptions.map((s) => ({ id: s.id, name: s.name }))} products={gbStocks.map((p) => ({ id: p.id, name: p.name, type: p.type, stockKg: p.stockKg }))} packagings={packagings.map((p) => ({ id: p.id, name: p.name, stockUnit: 0 }))} onAddSupplier={() => openSupplierQuickAdd("po")} preferredSupplierId={supplierTarget === "po" ? preferredSupplierId : null} onSuccess={() => { setPoDrawerOpen(false); handlePORefresh(); finishSupplierFlow(); }} onCancel={() => { setPoDrawerOpen(false); finishSupplierFlow(); }} />
      </StandardDrawer>

      <StandardDrawer open={poDetailOpen} onOpenChange={setPoDetailOpen} title="Detail Purchase Order" size="lg">
        {selectedPoId && (
          <PODetail poId={selectedPoId} onClose={() => setPoDetailOpen(false)} onUpdate={handlePORefresh} suppliers={suppliers.map((s) => ({ id: s.id, name: s.name }))} products={gbStocks.map((p) => ({ id: p.id, name: p.name, type: p.type, stockKg: p.stockKg }))} packagings={packagings.map((p) => ({ id: p.id, name: p.name, stockUnit: 0 }))} />
        )}
      </StandardDrawer>

      <StandardDrawer
        open={supplierDrawerOpen}
        onOpenChange={(open) => { if (!isSupplierSubmitting) setSupplierDrawerOpen(open); }}
        title="Tambah Supplier"
        description="Cukup isi nama. Supplier langsung dipilih di transaksi ini."
        size="sm"
        submitButton={
          <Button type="submit" form="quick-supplier-form" size="sm" disabled={isSupplierSubmitting} className="gap-1.5 bg-amber-700 text-white hover:bg-amber-800 font-semibold rounded-lg disabled:opacity-60">
            {isSupplierSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSupplierSubmitting ? "Menyimpan..." : "Simpan & pilih"}
          </Button>
        }
      >
        <SupplierForm
          id="quick-supplier-form"
          onPendingChange={setIsSupplierSubmitting}
          onSuccess={(supplier) => {
            if (supplier) {
              setSupplierOptions((current) => [
                supplier,
                ...current.filter((item) => item.id !== supplier.id),
              ]);
              setPreferredSupplierId(supplier.id);
            }
            setSupplierDrawerOpen(false);
          }}
        />
      </StandardDrawer>
    </>
  );
}
