import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full items-center justify-center p-8">
      <div className="flex flex-col items-center gap-4 rounded-3xl bg-white/40 p-8 backdrop-blur-xl border border-white/60 shadow-xl">
        <Loader2 className="h-10 w-10 animate-spin text-slate-800" />
        <p className="text-sm font-semibold text-slate-600 animate-pulse">Memuat data...</p>
      </div>
    </div>
  );
}
