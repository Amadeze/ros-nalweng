"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import type { TopProduct } from "../actions";

export function TopProductsChart({ data }: { data: TopProduct[] }) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[320px] rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 shadow-lg shadow-slate-200/30 backdrop-blur-xl p-5 text-center">
        <p className="text-sm font-semibold text-slate-500 mt-2">Belum ada data penjualan</p>
      </div>
    );
  }

  const colors = ["#8b5cf6", "#6366f1", "#0ea5e9", "#14b8a6", "#10b981"];

  return (
    <div className="flex flex-col h-[320px] rounded-[1.5rem] md:rounded-3xl border border-white/60 bg-white/40 shadow-lg shadow-slate-200/30 backdrop-blur-xl p-5">
      <div className="mb-4">
        <h2 className="text-sm font-bold text-slate-800 tracking-tight">Top Produk</h2>
        <p className="mt-0.5 text-[11px] font-medium text-slate-500">
          5 Terlaris Sepanjang Masa
        </p>
      </div>
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.4)" />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 10, fill: '#475569', fontWeight: 600 }}
              width={100}
            />
            <Tooltip
              cursor={{ fill: "rgba(255,255,255,0.4)" }}
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-white/60 bg-white/70 backdrop-blur-xl p-3 shadow-lg">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                        {payload[0].payload.name}
                      </p>
                      <p className="text-sm font-black text-indigo-600">
                        {payload[0].value} Terjual
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="sold" radius={[0, 4, 4, 0]} animationDuration={1000} barSize={24}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
