"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export function TenantGrowthChart({ data }: { data: any[] }) {
  if (!data || data.length === 0) return null;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="colorTenants" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#d4a373" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#d4a373" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
        <XAxis 
          dataKey="name" 
          stroke="#ffffff50" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
        />
        <YAxis 
          stroke="#ffffff50" 
          fontSize={12} 
          tickLine={false} 
          axisLine={false} 
          tickFormatter={(value) => `${value}`} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: "#17130f", 
            border: "1px solid rgba(255,255,255,0.1)", 
            borderRadius: "12px",
            color: "#fff"
          }}
          itemStyle={{ color: "#d4a373" }}
        />
        <Area 
          type="monotone" 
          dataKey="tenants" 
          stroke="#d4a373" 
          strokeWidth={3}
          fillOpacity={1} 
          fill="url(#colorTenants)" 
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
