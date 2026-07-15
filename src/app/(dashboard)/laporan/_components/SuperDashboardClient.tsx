"use client";

import { useState } from "react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { PnLReportClient } from "./PnLReportClient";
import { InventoryValuationClient } from "./InventoryValuationClient";
import { BalanceSheetClient } from "./BalanceSheetClient";
import type { PnLReport } from "../../keuangan/actions";
import type { InventoryValuationReport, BalanceSheetReport } from "../actions";
import { cn } from "@/lib/utils";
import { FileText, Database, Scale, Activity } from "lucide-react";
import { CoffeeFlowClient } from "./CoffeeFlowClient";

interface SuperDashboardClientProps {
  pnlReport: PnLReport;
  inventoryReport: InventoryValuationReport;
  balanceSheetReport: BalanceSheetReport;
  flowReport: any;
  userRole: string;
}

export function SuperDashboardClient({ pnlReport, inventoryReport, balanceSheetReport, flowReport, userRole }: SuperDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"pnl" | "inventory" | "balanceSheet" | "flow">("pnl");

  return (
    <StandardPageLayout
      title="Laporan Finansial"
      description="Super Dashboard Laba Rugi dan Valuasi Aset"
    >
      <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-sm backdrop-blur-md mb-6 w-fit mx-auto md:mx-0">
        <button
          onClick={() => setActiveTab("pnl")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "pnl" 
              ? "bg-white text-blue-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          <FileText size={18} /> Laba Rugi
        </button>
        <button
          onClick={() => setActiveTab("inventory")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "inventory" 
              ? "bg-white text-emerald-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          <Database size={18} /> Valuasi Aset
        </button>
        <button
          onClick={() => setActiveTab("balanceSheet")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "balanceSheet" 
              ? "bg-white text-indigo-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          <Scale size={18} /> Neraca
        </button>
        <button
          onClick={() => setActiveTab("flow")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "flow" 
              ? "bg-white text-rose-600 shadow-sm" 
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          <Activity size={18} /> Arus Kopi
        </button>
      </div>

      <div className="h-full flex flex-col">
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
        {activeTab === "balanceSheet" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <BalanceSheetClient report={balanceSheetReport} />
          </div>
        )}
        {activeTab === "flow" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <CoffeeFlowClient report={flowReport} />
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
