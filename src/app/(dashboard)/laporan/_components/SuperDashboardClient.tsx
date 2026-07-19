"use client";

import { useState, useTransition } from "react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { PnLReportClient } from "./PnLReportClient";
import { InventoryValuationClient } from "./InventoryValuationClient";
import { BalanceSheetClient } from "./BalanceSheetClient";
import type { PnLReport } from "../../keuangan/actions";
import {
  getBalanceSheetReport,
  getCoffeeFlowReport,
  getInventoryValuationReport,
  type BalanceSheetReport,
  type CoffeeFlowReport,
  type InventoryValuationReport,
} from "../actions";
import { cn } from "@/lib/utils";
import { FileText, Database, Scale, Activity } from "lucide-react";
import { CoffeeFlowClient } from "./CoffeeFlowClient";
import { Skeleton } from "@/components/ui/skeleton";

interface SuperDashboardClientProps {
  pnlReport: PnLReport;
}

type ReportTab = "pnl" | "inventory" | "balanceSheet" | "flow";

function ReportPanelSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="rounded-2xl border border-white/60 bg-white/50 p-4">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="mt-3 h-7 w-32" />
            <Skeleton className="mt-2 h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="rounded-3xl border border-white/60 bg-white/70 p-5">
        <Skeleton className="h-5 w-44" />
        <div className="mt-5 space-y-3">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function SuperDashboardClient({ pnlReport }: SuperDashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"pnl" | "inventory" | "balanceSheet" | "flow">("pnl");
  const [isPending, startTransition] = useTransition();
  const [inventoryReport, setInventoryReport] = useState<InventoryValuationReport | null>(null);
  const [balanceSheetReport, setBalanceSheetReport] = useState<BalanceSheetReport | null>(null);
  const [flowReport, setFlowReport] = useState<CoffeeFlowReport | null>(null);
  const reportAsOf = new Date(new Date(pnlReport.periodEnd).getTime() - 1);
  const reportStart = new Date(pnlReport.periodStart);
  const [loadError, setLoadError] = useState<string | null>(null);

  const openTab = (tab: ReportTab) => {
    setActiveTab(tab);
    setLoadError(null);

    if (tab === "inventory" && !inventoryReport) {
      startTransition(async () => {
        try {
          setInventoryReport(await getInventoryValuationReport(reportAsOf));
        } catch {
          setLoadError("Gagal memuat valuasi aset.");
        }
      });
    }

    if (tab === "balanceSheet" && !balanceSheetReport) {
      startTransition(async () => {
        try {
          const inventory = inventoryReport ?? await getInventoryValuationReport(reportAsOf);
          setInventoryReport(inventory);
          setBalanceSheetReport(await getBalanceSheetReport(inventory.grandTotalValue, reportAsOf));
        } catch {
          setLoadError("Gagal memuat neraca.");
        }
      });
    }

    if (tab === "flow" && !flowReport) {
      startTransition(async () => {
        try {
          setFlowReport(await getCoffeeFlowReport(reportStart, new Date(pnlReport.periodEnd)));
        } catch {
          setLoadError("Gagal memuat arus kopi.");
        }
      });
    }
  };

  return (
    <StandardPageLayout
      title="Laporan Finansial"
      description="Super Dashboard Laba Rugi dan Valuasi Aset"
    >
      <div className="flex bg-white/40 p-1 rounded-xl border border-white/60 shadow-sm backdrop-blur-md mb-6 w-fit mx-auto md:mx-0">
        <button
          onClick={() => openTab("pnl")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all",
            activeTab === "pnl" 
              ? "bg-white text-amber-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
          )}
        >
          <FileText size={18} /> Laba Rugi
        </button>
        <button
          onClick={() => openTab("inventory")}
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
          onClick={() => openTab("balanceSheet")}
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
          onClick={() => openTab("flow")}
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
        {loadError && (
          <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {loadError}
          </div>
        )}
        {activeTab === "pnl" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <PnLReportClient report={pnlReport} hideLayout />
          </div>
        )}
        {activeTab === "inventory" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {inventoryReport && !isPending ? (
              <InventoryValuationClient report={inventoryReport} hideLayout />
            ) : (
              <ReportPanelSkeleton />
            )}
          </div>
        )}
        {activeTab === "balanceSheet" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {balanceSheetReport && !isPending ? (
              <BalanceSheetClient report={balanceSheetReport} />
            ) : (
              <ReportPanelSkeleton />
            )}
          </div>
        )}
        {activeTab === "flow" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            {flowReport && !isPending ? (
              <CoffeeFlowClient report={flowReport} />
            ) : (
              <ReportPanelSkeleton />
            )}
          </div>
        )}
      </div>
    </StandardPageLayout>
  );
}
