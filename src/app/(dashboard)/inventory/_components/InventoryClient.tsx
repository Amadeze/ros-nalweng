"use client";

import { useState } from "react";
import { Plus, Loader2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { StandardDrawer } from "@/components/StandardDrawer";
import { StockTable } from "./StockTable";
import { PurchaseForm } from "./PurchaseForm";
import { PackagingPurchaseForm } from "./PackagingPurchaseForm";
import { StockAdjustmentDrawer } from "./StockAdjustmentDrawer";
import type {
  GBProductOption,
  PackagingStockRow,
  ProductStockRow,
  FGStockRow,
  SupplierOption,
} from "../actions";

interface PackagingOption { id: string; name: string; code: string; costPerUnit: number; }

interface InventoryClientProps {
  gbStocks:   ProductStockRow[];
  rbStocks:   ProductStockRow[];
  fgStocks:   FGStockRow[];
  pkgStocks:  PackagingStockRow[];
  suppliers:  SupplierOption[];
  gbProducts: GBProductOption[];
  packagings: PackagingOption[];
}

export function InventoryClient({
  gbStocks, rbStocks, fgStocks, pkgStocks, suppliers, gbProducts, packagings,
}: InventoryClientProps) {
  const [gbDrawerOpen,  setGbDrawerOpen]  = useState(false);
  const [pkgDrawerOpen, setPkgDrawerOpen] = useState(false);
  const [adjDrawerOpen, setAdjDrawerOpen] = useState(false);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const adjustmentItems = [
    ...gbStocks.map(i => ({ id: i.id, label: i.name, type: "GREEN_BEAN" as const, currentStock: Number(i.stockKg) })),
    ...rbStocks.map(i => ({ id: i.id, label: i.name, type: "ROASTED_BEAN" as const, currentStock: Number(i.stockKg) })),
    ...fgStocks.map(i => ({ id: i.id, label: i.name, type: "FINISHED_GOODS" as const, currentStock: Number(i.stockUnit) })),
    ...pkgStocks.map(i => ({ id: i.id, label: i.name, type: "PACKAGING" as const, currentStock: Number(i.stockUnit) })),
  ];

  return (
    <>
      <StandardPageLayout
        title="Inventory"
        description="Stok realtime — dihitung dari agregasi semua mutasi transaksi"
        actionButton={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="gap-2 bg-white/50 border-white/60 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white/70"
              onClick={() => {
                import('jspdf').then(({ jsPDF }) => {
                  import('jspdf-autotable').then(({ default: autoTable }) => {
                    const doc = new jsPDF();
                    doc.text("Laporan Stok Green Bean", 14, 15);
                    const tableData = gbStocks.map(i => [
                      i.name, i.stockKg, i.latestHppPerKg || 0
                    ]);
                    autoTable(doc, {
                      head: [['Nama Green Bean', 'Stok (Kg)', 'HPP/Kg']],
                      body: tableData,
                      startY: 20
                    });
                    doc.save("Laporan_Stok.pdf");
                  });
                });
              }}
            >
              Export PDF
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/50 border-white/60 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white/70"
              onClick={() => {
                import('xlsx').then((XLSX) => {
                  const ws = XLSX.utils.json_to_sheet(gbStocks.map(i => ({
                    'Nama': i.name,
                    'Stok (Kg)': i.stockKg,
                    'HPP/Kg': i.latestHppPerKg || 0
                  })));
                  const wb = XLSX.utils.book_new();
                  XLSX.utils.book_append_sheet(wb, ws, "Stok GB");
                  XLSX.writeFile(wb, "Laporan_Stok.xlsx");
                });
              }}
            >
              Export Excel
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-orange-50/50 border-orange-200 text-orange-700 shadow-sm backdrop-blur-md hover:bg-orange-100"
              onClick={() => setAdjDrawerOpen(true)}
            >
              Stock Opname
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-white/50 border-white/60 text-slate-700 shadow-sm backdrop-blur-md hover:bg-white/70"
              onClick={() => setPkgDrawerOpen(true)}
            >
              <Package size={13} />
              Kemasan Datang
            </Button>
            <Button
              size="sm"
              className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl"
              onClick={() => setGbDrawerOpen(true)}
            >
              <Plus size={14} />
              Barang Datang
            </Button>
          </div>
        }
      >
        <StockTable gbStocks={gbStocks} rbStocks={rbStocks} fgStocks={fgStocks} pkgStocks={pkgStocks} />
      </StandardPageLayout>

      {/* ── Green Bean Drawer ── */}
      <StandardDrawer
        open={gbDrawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setGbDrawerOpen(open); }}
        title="Catat Barang Datang (Green Bean)"
        description="Stok Green Bean akan bertambah otomatis setelah disimpan."
        size="lg"
        submitButton={
          <Button
            type="submit"
            form="purchase-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        }
      >
        <PurchaseForm
          id="purchase-form"
          suppliers={suppliers}
          gbProducts={gbProducts}
          onSuccess={() => setGbDrawerOpen(false)}
          onPendingChange={setIsSubmitting}
        />
      </StandardDrawer>

      {/* ── Packaging Drawer ── */}
      <StandardDrawer
        open={pkgDrawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setPkgDrawerOpen(open); }}
        title="Catat Kemasan Datang"
        description="Stok Packaging akan bertambah otomatis setelah disimpan."
        size="md"
        submitButton={
          <Button
            type="submit"
            form="pkg-purchase-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan"}
          </Button>
        }
      >
        <PackagingPurchaseForm
          suppliers={suppliers}
          packagings={packagings}
          onPendingChange={setIsSubmitting}
          onSuccess={() => { setPkgDrawerOpen(false); setIsSubmitting(false); }}
        />
      </StandardDrawer>

      {/* ── Adjustment Drawer ── */}
      <StandardDrawer
        open={adjDrawerOpen}
        onOpenChange={(open) => { if (!isSubmitting) setAdjDrawerOpen(open); }}
        title="Penyesuaian Stok (Opname)"
        description="Gunakan fitur ini untuk menyamakan stok digital dengan fisik."
        size="md"
        submitButton={
          <Button
            type="submit"
            form="adjustment-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-1.5 bg-blue-500 text-white hover:bg-blue-600 font-bold shadow-md rounded-xl disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={13} className="animate-spin" />}
            {isSubmitting ? "Menyimpan..." : "Simpan Opname"}
          </Button>
        }
      >
        <StockAdjustmentDrawer
          id="adjustment-form"
          items={adjustmentItems}
          onSuccess={() => setAdjDrawerOpen(false)}
          onPendingChange={setIsSubmitting}
        />
      </StandardDrawer>
    </>
  );
}

