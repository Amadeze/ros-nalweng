"use client";


import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CoffeeFlowReport } from "../actions";
import { Package, Coffee, Box, ArrowRight, Search, TrendingUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";

function exportCoffeeFlowCSV(report: CoffeeFlowReport) {
  const rows: string[][] = [
    ["Laporan Arus Kopi"],
    [`Periode: ${report.periodStart ? formatDate(report.periodStart) : "Awal"} - ${formatDate(report.periodEnd)}`],
    [],
    ["GREEN BEAN", "Beli (kg)", "Di-roast (kg)", "Opname Out (kg)", "Stok (kg)", "HPP Avg/kg"],
    ...report.greenBeans.map(gb => [
      gb.name, String(gb.boughtKg), String(gb.roastedKg), String(gb.adjustmentOutKg), String(gb.currentStockKg), String(gb.avgPurchasePrice)
    ]),
    [],
    ["ROASTED BEAN", "Produksi (kg)", "Susut (kg)", "Packaged (kg)", "Sample (kg)", "Opname Out (kg)", "Stok (kg)", "Nilai Susut"],
    ...report.roastedBeans.map(rb => [
      rb.name, String(rb.producedKg), String(rb.roastLossKg), String(rb.packagedKg), String(rb.sampleOutKg), String(rb.adjustmentOutKg), String(rb.currentStockKg), String(rb.roastLossValue)
    ]),
    [],
    ["FINISHED GOODS", "Produksi (unit)", "Terjual (unit)", "Sample (unit)", "Opname Out (unit)", "Stok (unit)", "Pendapatan", "HPP", "Laba Kotor"],
    ...report.finishedGoods.map(fg => [
      fg.name, String(fg.producedUnits), String(fg.soldUnits), String(fg.sampleOutUnits), String(fg.adjustmentOutUnits), String(fg.currentStockUnits), String(fg.salesRevenue), String(fg.cogs), String(fg.grossProfit)
    ]),
  ];

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(r => r.join(",")).join("\n");
  const link = document.createElement("a");
  link.setAttribute("href", encodeURI(csvContent));
  link.setAttribute("download", `Arus_Kopi_${new Date(report.periodEnd).toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


export function CoffeeFlowClient({ report }: { report: CoffeeFlowReport }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGB = useMemo(() => report.greenBeans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [report.greenBeans, searchQuery]);
  const filteredRB = useMemo(() => report.roastedBeans.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [report.roastedBeans, searchQuery]);
  const filteredFG = useMemo(() => report.finishedGoods.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())), [report.finishedGoods, searchQuery]);

  const totalKgSold = useMemo(() => report.finishedGoods.reduce((sum, item) => sum + item.soldEquivalentKg, 0), [report.finishedGoods]);
  const totalGBCurrent = useMemo(() => report.greenBeans.reduce((sum, item) => sum + item.currentStockKg, 0), [report.greenBeans]);
  const totalRBCurrent = useMemo(() => report.roastedBeans.reduce((sum, item) => sum + item.currentStockKg, 0), [report.roastedBeans]);

  return (
    <div className="space-y-6">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center bg-white/40 p-4 rounded-xl border border-white/60 shadow-sm backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg border border-emerald-100 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Stok GB Total</span>
            <span className="text-lg font-bold">{totalGBCurrent.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg</span>
          </div>
          <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-lg border border-amber-100 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Stok RB Total</span>
            <span className="text-lg font-bold">{totalRBCurrent.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg</span>
          </div>
          <div className="bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg border border-indigo-100 flex flex-col">
            <span className="text-xs font-semibold uppercase tracking-wider opacity-80">Kopi Terjual</span>
            <span className="text-lg font-bold">{totalKgSold.toLocaleString('id-ID', {maximumFractionDigits: 1})} kg</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-slate-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg leading-5 bg-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-700/20 focus:border-amber-700 sm:text-sm transition-all"
              placeholder="Cari nama kopi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button onClick={() => exportCoffeeFlowCSV(report)} variant="outline" className="h-9 gap-1.5 whitespace-nowrap">
            <Download size={14} /> Export CSV
          </Button>
        </div>
      </div>
      {/* GREEN BEAN */}
      <div className="border border-emerald-100 rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="bg-emerald-50/50 border-b border-emerald-100 p-6 pb-4">
          <h3 className="text-emerald-800 flex items-center gap-2 text-lg font-semibold m-0">
            <Package size={20} className="text-emerald-600" />
            Arus Green Bean (Kopi Mentah)
          </h3>
          <p className="text-sm text-emerald-600/80 mt-1">Pergerakan stok mentah dari hulu (dalam Kilogram)</p>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-emerald-50/30">
              <TableRow>
                <TableHead className="font-semibold text-emerald-900 w-[25%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Total Dibeli</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Harga Rata-Rata</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Masuk Roasting</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900 bg-emerald-50/50">Sisa Stok (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGB.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-6">Belum ada data Green Bean</TableCell></TableRow>
              )}
              {filteredGB.map(gb => (
                <TableRow key={gb.id} className="hover:bg-emerald-50/20">
                  <TableCell className="font-medium text-slate-700">{gb.name}</TableCell>
                  <TableCell className="text-right text-emerald-700 font-medium">+{gb.boughtKg.toLocaleString('id-ID')} kg</TableCell>
                  <TableCell className="text-right text-slate-600">
                    {gb.avgPurchasePrice > 0 ? (
                      <span className="text-xs">Rp {gb.avgPurchasePrice.toLocaleString('id-ID', { maximumFractionDigits: 0 })} /kg</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-right text-orange-600">-{gb.roastedKg.toLocaleString('id-ID')} kg</TableCell>
                  <TableCell className="text-right text-red-500">{gb.adjustmentOutKg > 0 ? `-${gb.adjustmentOutKg.toLocaleString('id-ID')} kg` : '-'}</TableCell>
                  <TableCell className="text-right font-bold text-slate-800 bg-emerald-50/30">{gb.currentStockKg.toLocaleString('id-ID')} kg</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ROASTED BEAN */}
      <div className="border border-amber-100 rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="bg-amber-50/50 border-b border-amber-100 p-6 pb-4">
          <h3 className="text-amber-900 flex items-center gap-2 text-lg font-semibold m-0">
            <Coffee size={20} className="text-amber-700" />
            Arus Roasted Bean (Kopi Sangrai)
          </h3>
          <p className="text-sm text-amber-700/80 mt-1">Pergerakan kopi setelah proses sangrai dan susutnya (dalam Kilogram)</p>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-amber-50/30">
              <TableRow>
                <TableHead className="font-semibold text-amber-900 w-[20%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Hasil Roasting</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Susut (Loss)</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Rugi Penyusutan</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Masuk Produksi</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Sample</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-amber-900 bg-amber-50/50">Sisa Stok (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRB.length === 0 && (
                <TableRow><TableCell colSpan={8} className="text-center text-slate-500 py-6">Belum ada data Roasted Bean</TableCell></TableRow>
              )}
              {filteredRB.map(rb => {
                const lossPct = rb.producedKg + rb.roastLossKg > 0 ? (rb.roastLossKg / (rb.producedKg + rb.roastLossKg)) * 100 : 0;
                return (
                  <TableRow key={rb.id} className="hover:bg-amber-50/20">
                    <TableCell className="font-medium text-slate-700">{rb.name}</TableCell>
                    <TableCell className="text-right text-emerald-700 font-medium">+{rb.producedKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</TableCell>
                    <TableCell className="text-right text-red-500">
                      {rb.roastLossKg > 0 ? (
                        <span>-{rb.roastLossKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg <span className="text-xs opacity-70">({lossPct.toFixed(1)}%)</span></span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-red-600">
                      {rb.roastLossValue > 0 ? (
                        <span className="text-xs font-medium">-Rp {rb.roastLossValue.toLocaleString('id-ID', { maximumFractionDigits: 0 })}</span>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-right text-orange-600">-{rb.packagedKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</TableCell>
                    <TableCell className="text-right text-fuchsia-600">{rb.sampleOutKg > 0 ? `-${rb.sampleOutKg.toLocaleString('id-ID', { maximumFractionDigits: 3 })} kg` : '-'}</TableCell>
                    <TableCell className="text-right text-red-500">{rb.adjustmentOutKg > 0 ? `-${rb.adjustmentOutKg.toLocaleString('id-ID')} kg` : '-'}</TableCell>
                    <TableCell className="text-right font-bold text-slate-800 bg-amber-50/30">{rb.currentStockKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* FINISHED GOODS */}
      <div className="border border-indigo-100 rounded-lg shadow-sm overflow-hidden bg-white">
        <div className="bg-indigo-50/50 border-b border-indigo-100 p-6 pb-4">
          <h3 className="text-indigo-900 flex items-center gap-2 text-lg font-semibold m-0">
            <Box size={20} className="text-indigo-600" />
            Arus Kopi Siap Jual (Finished Goods)
          </h3>
          <p className="text-sm text-indigo-600/80 mt-1">Penjualan barang jadi yang dikonversi kembali ke Kilogram kopi (berdasarkan resep)</p>
        </div>
        <div className="p-0">
          <Table>
            <TableHeader className="bg-indigo-50/30">
              <TableRow>
                <TableHead className="font-semibold text-indigo-900 w-[20%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Total Diproduksi</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Total Terjual</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Sample</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Laba Penjualan (Kotor)</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900 bg-indigo-50/50">Sisa Stok (Unit)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFG.length === 0 && (
                <TableRow><TableCell colSpan={7} className="text-center text-slate-500 py-6">Belum ada data Finished Goods</TableCell></TableRow>
              )}
              {filteredFG.map(fg => (
                <TableRow key={fg.id} className="hover:bg-indigo-50/20">
                  <TableCell className="font-medium text-slate-700">
                    <div className="flex flex-col">
                      <span>{fg.name}</span>
                      <span className="text-xs text-slate-400">Resep: {fg.weightPerUnitGrams}g per unit</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-emerald-700 font-medium">+{fg.producedUnits.toLocaleString('id-ID')} unit</span>
                      {fg.weightPerUnitGrams > 0 && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <ArrowRight size={10}/> {fg.producedEquivalentKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg kopi
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-indigo-700 font-medium">-{fg.soldUnits.toLocaleString('id-ID')} unit</span>
                      {fg.weightPerUnitGrams > 0 && (
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <ArrowRight size={10}/> {fg.soldEquivalentKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg kopi
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-fuchsia-600">
                    {fg.sampleOutUnits > 0 ? `-${fg.sampleOutUnits.toLocaleString('id-ID')} unit` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-col items-end">
                      <span className={fg.grossProfit >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                        {fg.grossProfit >= 0 ? '+' : '-'}Rp {Math.abs(fg.grossProfit).toLocaleString('id-ID', { maximumFractionDigits: 0 })}
                      </span>
                      <span className="text-xs text-slate-400">
                        Pndp: Rp{fg.salesRevenue.toLocaleString('id-ID')}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-red-500">
                    {fg.adjustmentOutUnits > 0 ? `-${fg.adjustmentOutUnits.toLocaleString('id-ID')} unit` : '-'}
                  </TableCell>
                  <TableCell className="text-right font-bold text-slate-800 bg-indigo-50/30">
                    {fg.currentStockUnits.toLocaleString('id-ID')} unit
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
