"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 text-center">
      <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-200">
        <AlertTriangle size={32} />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">Terjadi Kesalahan Sistem</h2>
      <p className="text-slate-500 mb-8 max-w-md">
        Maaf, terjadi kesalahan saat memuat data. Silakan coba muat ulang halaman ini atau hubungi tim dukungan jika masalah berlanjut.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => reset()}
          className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <RefreshCcw size={18} />
          Muat Ulang
        </button>
        <button
          onClick={() => window.location.href = "/dashboard"}
          className="inline-flex items-center justify-center gap-2 bg-white/60 text-slate-700 border border-slate-300 px-6 py-3 rounded-xl font-bold hover:bg-white hover:text-slate-900 transition-colors shadow-sm backdrop-blur-md"
        >
          Kembali ke Dashboard
        </button>
      </div>

      {process.env.NODE_ENV === "development" && (
        <div className="mt-12 p-4 bg-red-50 text-red-900 rounded-xl border border-red-200 text-left w-full max-w-2xl overflow-auto text-xs font-mono">
          <p className="font-bold mb-2">Error Details (Development Only):</p>
          <p>{error.message}</p>
          {error.stack && <pre className="mt-2 text-[10px] opacity-70 whitespace-pre-wrap">{error.stack}</pre>}
        </div>
      )}
    </div>
  );
}
