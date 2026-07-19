"use client";
import { useEffect } from "react";

export function PrintTrigger() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get("print") === "true") {
        setTimeout(() => window.print(), 500);
      }
    }
  }, []);
  return null;
}

export function PrintActionBar() {
  return (
    <div className="flex justify-between items-center mb-8 print:hidden">
      <button
        onClick={() => window.close()}
        className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        &larr; Tutup
      </button>
      <button
        onClick={() => window.print()}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
      >
        Cetak Nota
      </button>
    </div>
  );
}

