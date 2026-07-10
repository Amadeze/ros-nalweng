"use client";

import { useState } from "react";
import { Wallet, PiggyBank, ArrowDownCircle, CheckCircle } from "lucide-react";
import { calculateFounderSalary, postFounderSalary, distributeDividends } from "../actions";

interface FounderDashboardClientProps {
  retainedEarnings: number;
}

export function FounderDashboardClient({ retainedEarnings }: FounderDashboardClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Formulir Gaji Bulanan
  const [salaryMonth, setSalaryMonth] = useState(new Date().getMonth() + 1);
  const [salaryYear, setSalaryYear] = useState(new Date().getFullYear());
  const [salaryResult, setSalaryResult] = useState<{ pool: number, perPerson: number, err?: string } | null>(null);

  // Formulir Dividen
  const [dividendAmount, setDividendAmount] = useState("");
  const [dividendResult, setDividendResult] = useState<{ success: boolean, err?: string } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
  };

  const handleCalculateSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSalaryResult(null);
    const result = await calculateFounderSalary(salaryMonth, salaryYear);
    if (!result.success) {
      setSalaryResult({ pool: 0, perPerson: 0, err: result.error as string });
      setIsSubmitting(false);
    } else {
      setSalaryResult({ pool: result.salaryPool as number, perPerson: result.salaryPerPerson as number });
      setIsSubmitting(false);
    }
  };

  const handlePostSalary = async () => {
    if (!salaryResult) return;
    setIsSubmitting(true);
    const result = await postFounderSalary(salaryMonth, salaryYear, salaryResult.perPerson);
    if (!result.success) {
      setSalaryResult({ ...salaryResult, err: "Gagal posting ke database" });
      setIsSubmitting(false);
    } else {
      alert("✅ Berhasil diposting sebagai Pengeluaran!");
      window.location.reload();
    }
  };

  const handleDistributeDividend = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setDividendResult(null);
    const amount = Number(dividendAmount);
    if (amount > retainedEarnings) {
      setDividendResult({ success: false, err: "Saldo Tabungan Profit tidak mencukupi!" });
      setIsSubmitting(false);
      return;
    }
    const result = await distributeDividends(amount);
    if (!result.success) {
      setDividendResult({ success: false, err: result.error as string });
      setIsSubmitting(false);
    } else {
      setDividendResult({ success: true });
      setIsSubmitting(false);
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto w-full">
      {/* KOLOM KIRI: Hitung Gaji */}
      <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md h-fit">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><Wallet size={24} className="text-emerald-600"/> Hitung Gaji Bulanan</h3>
        <p className="text-sm text-slate-500 mb-6">Mengambil max 40% dari laba bersih (mentok Rp 15.000.000), lalu dibagikan bertiga (Anda, Reza, Theo) sebagai biaya Pengeluaran.</p>
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
          <button disabled={isSubmitting} type="submit" className="w-full bg-slate-800 text-white py-3 rounded-xl text-sm font-bold hover:bg-slate-900 transition-colors mt-2">
            Hitung Gaji (Simulasi)
          </button>
        </form>
        
        {salaryResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
            {salaryResult.err ? (
              <p className="text-red-600 text-sm font-semibold text-center">{salaryResult.err}</p>
            ) : (
              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-200">
                  <span className="font-semibold text-slate-600">Pool Gaji (40% / max 15jt)</span>
                  <span className="font-bold text-indigo-600 text-base">{formatCurrency(salaryResult.pool)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="font-semibold text-slate-600">Gaji per Orang (dibagi 3)</span>
                  <span className="font-bold text-emerald-600 text-lg">{formatCurrency(salaryResult.perPerson)}</span>
                </div>
                <button onClick={handlePostSalary} disabled={isSubmitting} className="w-full bg-emerald-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2">
                  <CheckCircle size={18} /> Eksekusi & Posting ke Laporan
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* KOLOM KANAN: Tabungan Profit (60%) */}
      <div className="bg-white/40 p-6 rounded-2xl border border-white/60 shadow-sm backdrop-blur-md h-fit">
        <h3 className="font-bold flex items-center gap-2 mb-4 text-lg"><PiggyBank size={24} className="text-blue-600"/> Tabungan Profit (Sisa 60%)</h3>
        <p className="text-sm text-slate-500 mb-6">Ini adalah akumulasi seluruh sisa profit bersih bisnis Anda (Laba Ditahan) yang belum dibagikan.</p>
        
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-center mb-6">
          <p className="text-sm font-semibold text-blue-800 mb-2">Total Tabungan Saat Ini</p>
          <p className="text-4xl font-bold text-blue-600">{formatCurrency(retainedEarnings)}</p>
        </div>

        <form onSubmit={handleDistributeDividend} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 mb-1 block">Nominal Pencairan Bagi Hasil</label>
            <input type="number" required placeholder="Contoh: 15000000" value={dividendAmount} onChange={e => setDividendAmount(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 outline-none" />
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1"><ArrowDownCircle size={14}/> Pencairan akan memotong Laba Ditahan & Kas</p>
          </div>
          <button disabled={isSubmitting || retainedEarnings <= 0} type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors mt-2 disabled:bg-slate-300">
            Cairkan & Bagi 3 Sekarang
          </button>
        </form>

        {dividendResult && (
          <div className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 animate-in fade-in slide-in-from-bottom-2">
            {dividendResult.err ? (
              <p className="text-red-600 text-sm font-semibold text-center">{dividendResult.err}</p>
            ) : (
              <div className="space-y-3 text-sm">
                <p className="text-blue-700 font-semibold text-center bg-blue-100 p-3 rounded-lg">✅ Pencairan Berhasil!</p>
                <p className="text-center text-slate-600">Masing-masing orang mendapatkan: <span className="font-bold text-emerald-600 text-lg block mt-2">{formatCurrency(Number(dividendAmount) / 3)}</span></p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
