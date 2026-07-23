"use client";

import React, { useId } from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export function KpiRibbon({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-4 sm:px-6 lg:px-8 py-6", className)}>
      {children}
    </div>
  );
}

interface KpiCardProps {
  label: string;
  value: string | number;
  sub?: React.ReactNode;
  trend?: number[];
  color?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
}

export function KpiCard({ label, value, sub, trend, color = "#10b981", icon, onClick, active }: KpiCardProps) {
  const trendData = trend ? trend.map(v => ({ v })) : [];
  const isUp = trendData.length > 1 && trendData[trendData.length - 1].v >= trendData[0].v;
  const uid = useId();
  const gradientId = `sparkline-gradient-${uid.replace(/:/g, "")}`;

  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-white border border-stone-200 rounded-xl shadow-sm p-5 flex flex-col relative overflow-hidden group transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        active && "ring-2 ring-stone-900 border-transparent shadow-md"
      )}
    >
      <div className="flex justify-between items-start mb-4 relative z-10">
        <p className="text-sm font-medium text-stone-500 tracking-tight">{label}</p>
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-stone-50 text-stone-600 border border-stone-100 group-hover:scale-110 transition-transform">
            {icon}
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-2xl font-bold text-stone-900 tracking-tight">{value}</h3>
        {sub && <p className="text-xs text-stone-500 mt-1">{sub}</p>}
      </div>
      
      {trendData.length > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-16 opacity-30 group-hover:opacity-60 transition-opacity pointer-events-none">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={color} stopOpacity={0.8}/>
                  <stop offset="95%" stopColor={color} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area 
                type="monotone" 
                dataKey="v" 
                stroke={color} 
                strokeWidth={2}
                fillOpacity={1} 
                fill={`url(#${gradientId})`} 
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
