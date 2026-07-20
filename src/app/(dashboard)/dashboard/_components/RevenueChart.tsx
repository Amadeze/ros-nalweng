"use client";


import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatRupiah } from "@/lib/format";
import type { RevenueTrend } from "../actions";

export function RevenueChart({ data }: { data: RevenueTrend[] }) {
  return (
    <div className="flex flex-col h-[320px] rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 shadow-lg shadow-slate-200/30 backdrop-blur-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Tren Pendapatan</h2>
        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          7 Hari Terakhir
        </p>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.4)" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#64748b', fontWeight: 600 }}
              dy={10}
            />
            <YAxis 
              hide={true}
              domain={['dataMin - 100000', 'dataMax + 100000']}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-xl p-3 shadow-lg">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{label}</p>
                      <p className="text-sm font-black text-emerald-700">
                        {formatRupiah(payload[0].value as number)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#10b981"
              strokeWidth={4}
              fillOpacity={1}
              fill="url(#colorRev)"
              animationDuration={1000}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
