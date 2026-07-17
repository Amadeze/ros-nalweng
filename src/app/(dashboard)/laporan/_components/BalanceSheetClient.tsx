"use client";

import { Scale } from "lucide-react";
import type { BalanceSheetReport } from "../actions";

interface BalanceSheetClientProps {
  report: BalanceSheetReport;
}

export function BalanceSheetClient({ report }: BalanceSheetClientProps) {
  const { assets, liabilities, equity } = report;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-indigo-500/20 text-indigo-600 rounded-lg">
          <Scale size={24} />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-800">Neraca (Balance Sheet)</h2>
          <p className="text-sm text-slate-500">Posisi Keuangan Aktual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AKTIVA (ASSETS) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 pb-2 border-b border-white/50">Aktiva (Aset)</h3>
          <div className="p-5 bg-white/40 backdrop-blur-md border-white/60 shadow-sm space-y-4 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Kas & Bank</span>
              <span className="font-semibold text-slate-800">{formatCurrency(assets.cashAndBank)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Piutang Usaha</span>
              <span className="font-semibold text-slate-800">{formatCurrency(assets.accountsReceivable)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Persediaan (Inventory)</span>
              <span className="font-semibold text-slate-800">{formatCurrency(assets.inventory)}</span>
            </div>
            
            <div className="pt-4 mt-2 border-t border-slate-200/50 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Aset</span>
              <span className="font-bold text-indigo-600 text-lg">{formatCurrency(assets.totalAssets)}</span>
            </div>
          </div>
        </div>

        {/* PASIVA (LIABILITIES & EQUITY) */}
        <div className="space-y-4">
          <h3 className="font-semibold text-slate-700 pb-2 border-b border-white/50">Pasiva (Kewajiban & Ekuitas)</h3>
          
          <div className="p-5 bg-white/40 backdrop-blur-md border-white/60 shadow-sm space-y-4 rounded-2xl mb-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Hutang Usaha</span>
              <span className="font-semibold text-slate-800">{formatCurrency(liabilities.accountsPayable)}</span>
            </div>
            <div className="space-y-1 border-t border-white/50 pt-3 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Belum jatuh tempo</span>
                <span>{formatCurrency(liabilities.aging.current)}</span>
              </div>
              <div className="flex justify-between text-amber-700">
                <span>Lewat 1-30 hari</span>
                <span>{formatCurrency(liabilities.aging.overdue1To30)}</span>
              </div>
              <div className="flex justify-between text-orange-700">
                <span>Lewat 31-60 hari</span>
                <span>{formatCurrency(liabilities.aging.overdue31To60)}</span>
              </div>
              <div className="flex justify-between text-red-700">
                <span>Lewat &gt;60 hari</span>
                <span>{formatCurrency(liabilities.aging.overdue61Plus)}</span>
              </div>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-200/50 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Kewajiban</span>
              <span className="font-bold text-red-500">{formatCurrency(liabilities.totalLiabilities)}</span>
            </div>
            <p className="text-xs leading-relaxed text-amber-700">{liabilities.trackingNote}</p>
          </div>

          <div className="p-5 bg-white/40 backdrop-blur-md border-white/60 shadow-sm space-y-4 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Modal Disetor Bersih</span>
              <span className="font-semibold text-slate-800">{formatCurrency(equity.contributedCapital)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Laba Ditahan</span>
              <span className="font-semibold text-slate-800">{formatCurrency(equity.retainedEarnings)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Bagi Hasil Terdistribusi</span>
              <span className="font-semibold text-slate-800">{formatCurrency(equity.distributedProfit)}</span>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-200/50 flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Ekuitas</span>
              <span className="font-bold text-emerald-600">{formatCurrency(equity.totalEquity)}</span>
            </div>
          </div>

          {/* GRAND TOTAL PASIVA */}
          <div className="p-5 bg-indigo-500/10 backdrop-blur-md border-indigo-500/20 shadow-sm rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="font-bold text-slate-800">Total Kewajiban & Ekuitas</span>
              <span className="font-bold text-indigo-600 text-lg">{formatCurrency(liabilities.totalLiabilities + equity.totalEquity)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
