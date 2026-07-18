"use client";

import type { LucideIcon } from "lucide-react";

interface InventoryMetricCardProps {
  label: string;
  value: number | string;
  unit?: string;
  icon: LucideIcon;
  tone: "green" | "blue" | "red" | "orange" | "neutral";
  helperText?: string;
  onClick?: () => void;
  active?: boolean;
}

const TONE_MAP = {
  green: {
    bg: "from-emerald-50 to-green-50",
    label: "text-emerald-600",
    value: "text-emerald-700",
    icon: "text-emerald-600",
    activeRing: "ring-2 ring-emerald-400",
  },
  blue: {
    bg: "from-blue-50 to-cyan-50",
    label: "text-blue-600",
    value: "text-blue-700",
    icon: "text-blue-600",
    activeRing: "ring-2 ring-blue-400",
  },
  red: {
    bg: "from-rose-50 to-red-50",
    label: "text-red-600",
    value: "text-red-700",
    icon: "text-red-500",
    activeRing: "ring-2 ring-red-400",
  },
  orange: {
    bg: "from-orange-50 to-amber-50",
    label: "text-orange-600",
    value: "text-orange-700",
    icon: "text-orange-500",
    activeRing: "ring-2 ring-orange-400",
  },
  neutral: {
    bg: "from-slate-50 to-gray-50",
    label: "text-slate-500",
    value: "text-slate-700",
    icon: "text-slate-400",
    activeRing: "ring-2 ring-slate-300",
  },
};

export function InventoryMetricCard({
  label,
  value,
  unit,
  icon: Icon,
  tone,
  helperText,
  onClick,
  active = false,
}: InventoryMetricCardProps) {
  const t = TONE_MAP[tone];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      className={`
        rounded-2xl border border-white/60 bg-gradient-to-br ${t.bg}
        p-4 shadow-sm backdrop-blur-sm relative overflow-hidden group
        text-left transition-all
        ${onClick ? "cursor-pointer hover:shadow-md active:scale-[0.98]" : "cursor-default"}
        ${active ? t.activeRing : ""}
      `}
    >
      <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-30 transition-opacity">
        <Icon size={48} className={t.icon} />
      </div>
      <p className={`text-xs font-medium ${t.label} relative z-10`}>{label}</p>
      <p className={`mt-1 font-mono text-2xl font-black tabular-nums ${t.value} relative z-10`}>
        {typeof value === "number" ? value.toLocaleString("id-ID") : value}
        {unit && <span className="text-sm font-semibold ml-0.5">{unit}</span>}
      </p>
      {helperText && (
        <p className="mt-1 text-[10px] text-slate-400 relative z-10">{helperText}</p>
      )}
    </button>
  );
}
