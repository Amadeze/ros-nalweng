"use client";

import { useState } from "react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { PnLReportClient } from "./PnLReportClient";
import { InventoryValuationClient } from "./InventoryValuationClient";
import type { PnLReport } from "../../keuangan/actions";
import type { InventoryValuationReport } from "../actions";
import { cn } from "@/lib/utils";
import { FileText, Database } from "lucide-react";

interface SuperDashboardClientProps {
  pnlReport: PnLReport;
  inventoryReport: InventoryValuationReport;
}

export function SuperDashboardClient({ pnlReport, inventoryReport }: SuperDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"pnl" | "inventory">("pnl");

  return (
    <StandardPageLayout
      title="Laporan Finansial"
      description="Super Dashboard Laba Rugi dan Valuasi Aset"
      actionButton={
        <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
          <button
            onClick={() => setActiveTab("pnl")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === "pnl" 
                ? "bg-white text-blue-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <FileText size={16} /> Laba Rugi
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all",
              activeTab === "inventory" 
                ? "bg-white text-emerald-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            <Database size={16} /> Valuasi Aset
          </button>
        </div>
      }
    >
      <div className="mt-2 h-full flex flex-col">
        {activeTab === "pnl" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PnLReportClient report={pnlReport} hideLayout />
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <InventoryValuationClient report={inventoryReport} hideLayout />
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
