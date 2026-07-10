"use client";


import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CoffeeFlowReport } from "../actions";
import { Package, Coffee, Box, ArrowRight } from "lucide-react";

export function CoffeeFlowClient({ report }: { report: CoffeeFlowReport }) {
  return (
    <div className="space-y-6">
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
                <TableHead className="font-semibold text-emerald-900 w-[30%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Total Dibeli</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Masuk Roasting</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-emerald-900 bg-emerald-50/50">Sisa Stok (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.greenBeans.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">Belum ada data Green Bean</TableCell></TableRow>
              )}
              {report.greenBeans.map(gb => (
                <TableRow key={gb.id} className="hover:bg-emerald-50/20">
                  <TableCell className="font-medium text-slate-700">{gb.name}</TableCell>
                  <TableCell className="text-right text-emerald-700 font-medium">+{gb.boughtKg.toLocaleString('id-ID')} kg</TableCell>
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
                <TableHead className="font-semibold text-amber-900 w-[25%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Hasil Roasting</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Susut (Loss)</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Masuk Produksi</TableHead>
                <TableHead className="text-right font-semibold text-amber-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-amber-900 bg-amber-50/50">Sisa Stok (kg)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.roastedBeans.length === 0 && (
                <TableRow><TableCell colSpan={6} className="text-center text-slate-500 py-6">Belum ada data Roasted Bean</TableCell></TableRow>
              )}
              {report.roastedBeans.map(rb => {
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
                    <TableCell className="text-right text-orange-600">-{rb.packagedKg.toLocaleString('id-ID', { maximumFractionDigits: 2 })} kg</TableCell>
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
                <TableHead className="font-semibold text-indigo-900 w-[25%]">Produk</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Total Diproduksi</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Total Terjual</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900">Koreksi/Hilang</TableHead>
                <TableHead className="text-right font-semibold text-indigo-900 bg-indigo-50/50">Sisa Stok (Unit)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.finishedGoods.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center text-slate-500 py-6">Belum ada data Finished Goods</TableCell></TableRow>
              )}
              {report.finishedGoods.map(fg => (
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
