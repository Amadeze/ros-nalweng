"use client";

import { useState } from "react";
import { StandardPageLayout } from "@/components/StandardPageLayout";
import { Wallet } from "lucide-react";
import { calculateAndPostFounderSalary } from "./actions";

export function MitraClient({ partnersCount = 3 }: { partnersCount?: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulir Gaji Bulanan
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryResult, setSalaryResult] = useState<{ pool: number, perPerson: number, err?: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };



  const handleCalculateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSalaryResult(null);
    const result = await calculateAndPostFounderSalary(salaryMonth, salaryYear);
    if (!result.success) {
      setSalaryResult({ pool: 0, perPerson: 0, err: result.error as string });
      setIsSubmitting(false);
    } else {
      setSalaryResult({ pool: result.salaryPool as number, perPerson: result.salaryPerPerson as number });
      setIsSubmitting(false);
      // Wait a moment then reload to refresh data
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <StandardPageLayout title="Mitra & Bagi Hasil" description="Manajemen Modal, Prive, dan Distribusi Dividen">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* KOLOM TUNGGAL: Hitung Gaji */}
        <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md">
          <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><Wallet size={24} className="text-emerald-600"/> Hitung & Posting Gaji Founder</h3>
          <p className="text-sm text-slate-500 mb-6">Menarik otomatis Laba Bersih bulan terkait (sebelum gaji), mengambil max 40% atau Rp 15.000.000, lalu membaginya secara merata kepada seluruh mitra/partner terdaftar ({partnersCount} orang) sebagai pencatatan Pengeluaran.</p>
          <form onSubmit={handleCalculateSalary} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-1/2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Bulan (1-12)</label>
                <input type="number" required value={salaryMonth} onChange={e => setSalaryMonth(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
              <div className="w-1/2">
                <label className="text-xs font-semibold text-slate-500 mb-1 block">Tahun</label>
                <input type="number" required value={salaryYear} onChange={e => setSalaryYear(Number(e.target.value))} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 outline-none" />
              </div>
            </div>
            <button disabled={isSubmitting} type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors mt-2">
              Hitung & Eksekusi Gaji
            </button>
          </form>
          
          {salaryResult && (
            <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
              {salaryResult.err ? (
                <p className="text-red-600 text-sm font-semibold text-center">{salaryResult.err}</p>
              ) : (
                <div className="space-y-3 text-sm">
                  <p className="text-emerald-700 font-semibold mb-4 text-center bg-emerald-100 p-2 rounded-lg">✅ Berhasil diposting sebagai Pengeluaran!</p>
                  <div className="flex justify-between items-center py-2 border-b border-slate-200">
                    <span className="font-semibold text-slate-600">Pool Gaji (40% / max 15jt)</span>
                    <span className="font-bold text-indigo-600 text-base">{formatCurrency(salaryResult.pool)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-semibold text-slate-600">Gaji per Orang (dibagi {partnersCount})</span>
                    <span className="font-bold text-emerald-600 text-lg">{formatCurrency(salaryResult.perPerson)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </StandardPageLayout>
  );
}
