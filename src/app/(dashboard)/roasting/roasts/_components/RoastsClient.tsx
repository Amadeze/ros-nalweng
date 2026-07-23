"use client";

import { useState } from "react";
import { Flame, Clock, Thermometer, ArrowDown, ChevronDown, ChevronUp } from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";

type Roast = {
  id: string;
  title: string | null;
  roastDate: string | null;
  duration: number | null;
  chargeTemperature: number | null;
  dropTemperature: number | null;
  firstCrackStartTime: number | null;
  firstCrackEndTime: number | null;
  greenWeightGrams: number | null;
  roastedWeightGrams: number | null;
  lossPercent: number | null;
  metadata: Record<string, unknown> | null;
  beanTemperatureSeries: Array<{ second: number; value: number }> | null;
  environmentalTemperatureSeries: Array<{ second: number; value: number }> | null;
  events: Array<{ second: number; type: string; value?: string | number; label?: string }> | null;
  machine: { name: string };
  createdAt: string;
};

function formatDuration(seconds: number | null): string {
  if (!seconds) return "-";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "-";
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function MiniChart({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 120;
  const height = 32;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className="opacity-60">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RoastsClient({ roasts }: { roasts: Roast[] }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (roasts.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <Flame className="mx-auto mb-4 h-12 w-12 text-[var(--text-tertiary)]" />
        <p className="text-[var(--text-secondary)]">
          Belum ada data roast. Upload file .alog melalui Artisan Sync untuk memulai.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {roasts.map((roast) => {
        const isExpanded = expandedId === roast.id;
        const btSeries = (roast as any).beanTemperatureSeries as number[] | undefined;
        const tempData = Array.isArray(btSeries)
          ? btSeries.map((p: any) => p.value ?? p)
          : [];

        return (
          <div key={roast.id} className="glass-card rounded-2xl overflow-hidden transition hover:shadow-md">
            {/* Summary Row */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : roast.id)}
              className="w-full flex items-center gap-4 p-4 text-left"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--amber-warm)]/10">
                <Flame className="h-5 w-5 text-[var(--amber-warm)]" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-[var(--text-primary)] truncate">
                    {roast.title || "Untitled Roast"}
                  </p>
                  <span className="text-xs text-[var(--text-tertiary)]">
                    {roast.machine.name}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                  <span>{formatDate(roast.roastDate)}</span>
                  {roast.duration && (
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDuration(roast.duration)}
                    </span>
                  )}
                  {roast.lossPercent != null && (
                    <span className="flex items-center gap-1">
                      <ArrowDown size={12} />
                      {roast.lossPercent.toFixed(1)}% loss
                    </span>
                  )}
                </div>
              </div>
              {tempData.length > 0 && (
                <div className="hidden md:block">
                  <MiniChart data={tempData} color="#d97706" />
                </div>
              )}
              <div className="shrink-0 text-[var(--text-tertiary)]">
                {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-[var(--glass-border)] p-4 space-y-4">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <StatCard
                    icon={<Thermometer size={14} />}
                    label="Charge Temp"
                    value={roast.chargeTemperature ? `${roast.chargeTemperature}°C` : "-"}
                  />
                  <StatCard
                    icon={<Thermometer size={14} />}
                    label="Drop Temp"
                    value={roast.dropTemperature ? `${roast.dropTemperature}°C` : "-"}
                  />
                  <StatCard
                    icon={<Clock size={14} />}
                    label="First Crack"
                    value={roast.firstCrackStartTime ? formatDuration(roast.firstCrackStartTime) : "-"}
                  />
                  <StatCard
                    icon={<Flame size={14} />}
                    label="Duration"
                    value={formatDuration(roast.duration)}
                  />
                </div>

                {/* Weight */}
                {(roast.greenWeightGrams || roast.roastedWeightGrams) && (
                  <div className="flex gap-4 text-sm">
                    {roast.greenWeightGrams && (
                      <span className="text-[var(--text-secondary)]">
                        Green: <strong>{roast.greenWeightGrams}g</strong>
                      </span>
                    )}
                    {roast.roastedWeightGrams && (
                      <span className="text-[var(--text-secondary)]">
                        Roasted: <strong>{roast.roastedWeightGrams}g</strong>
                      </span>
                    )}
                    {roast.lossPercent != null && (
                      <span className="text-[var(--text-secondary)]">
                        Loss: <strong className="text-amber-600">{roast.lossPercent.toFixed(1)}%</strong>
                      </span>
                    )}
                  </div>
                )}

                {/* Metadata */}
                {roast.metadata && Object.keys(roast.metadata).length > 0 && (
                  <div className="text-xs text-[var(--text-tertiary)] space-y-1">
                    <MetadataField meta={roast.metadata} key_="roaster" label="Roaster" />
                    <MetadataField meta={roast.metadata} key_="profile" label="Profile" />
                    <MetadataField meta={roast.metadata} key_="beans" label="Beans" />
                  </div>
                )}

                {/* Link to Batch Button */}
                <LinkToBatchButton roastId={roast.id} roastTitle={roast.title || "Untitled"} />

                {/* Temperature Curve Chart */}
                {roast.beanTemperatureSeries && roast.beanTemperatureSeries.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">
                      Temperature Curve
                    </h4>
                    <TemperatureChart
                      btData={roast.beanTemperatureSeries}
                      etData={roast.environmentalTemperatureSeries}
                      events={roast.events}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--glass-border)] p-3">
      <div className="flex items-center gap-1.5 text-[var(--text-tertiary)] mb-1">
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-sm font-bold text-[var(--text-primary)]">{value}</p>
    </div>
  );
}

function MetadataField({
  meta,
  key_,
  label,
}: {
  meta: Record<string, unknown>;
  key_: string;
  label: string;
}) {
  const val = meta[key_];
  if (val == null || val === "") return null;
  return (
    <p>
      {label}: <strong>{String(val)}</strong>
    </p>
  );
}

function TemperatureChart({
  btData,
  etData,
  events,
}: {
  btData: Array<{ second: number; value: number }>;
  etData: Array<{ second: number; value: number }> | null;
  events: Array<{ second: number; type: string }> | null;
}) {
  // Merge BT and ET data by second
  const chartData = btData.map((bt) => {
    const et = etData?.find((e) => e.second === bt.second);
    return {
      time: bt.second,
      timeLabel: `${Math.floor(bt.second / 60)}:${String(bt.second % 60).padStart(2, "0")}`,
      BT: bt.value,
      ET: et?.value ?? null,
    };
  });

  // Find event positions
  const eventMarkers = events?.filter((e) =>
    ["CHARGE", "FCs", "FCe", "SCs", "DROP"].includes(e.type),
  ) ?? [];

  const eventColors: Record<string, string> = {
    CHARGE: "#3b82f6",
    FCs: "#f59e0b",
    FCe: "#f59e0b",
    SCs: "#ef4444",
    DROP: "#10b981",
  };

  return (
    <div className="rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4">
      <div className="flex items-center gap-4 mb-3 text-[10px]">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-amber-500 rounded" />
          <span className="text-[var(--text-tertiary)]">BT (Bean Temp)</span>
        </span>
        {etData && etData.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-3 h-0.5 bg-blue-400 rounded" />
            <span className="text-[var(--text-tertiary)]">ET (Env Temp)</span>
          </span>
        )}
        {eventMarkers.map((e) => (
          <span key={`${e.type}-${e.second}`} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: eventColors[e.type] || "#999" }} />
            <span className="text-[var(--text-tertiary)]">{e.type}</span>
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--glass-border)" />
          <XAxis
            dataKey="time"
            tickFormatter={(v) => `${Math.floor(v / 60)}:${String(v % 60).padStart(2, "0")}`}
            stroke="var(--text-tertiary)"
            fontSize={10}
            tickLine={false}
          />
          <YAxis
            stroke="var(--text-tertiary)"
            fontSize={10}
            tickLine={false}
            domain={["dataMin - 10", "dataMax + 10"]}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--glass-bg-hover)",
              border: "1px solid var(--glass-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            formatter={(value, name) => [`${value}°C`, String(name)]}
            labelFormatter={(label) => {
              const min = Math.floor(Number(label) / 60);
              const sec = Number(label) % 60;
              return `${min}:${String(sec).padStart(2, "0")}`;
            }}
          />
          {/* Event reference lines */}
          {eventMarkers.map((e) => (
            <ReferenceLine
              key={`${e.type}-${e.second}`}
              x={e.second}
              stroke={eventColors[e.type] || "#999"}
              strokeDasharray="4 4"
              strokeWidth={1.5}
            />
          ))}
          <Line
            type="monotone"
            dataKey="BT"
            stroke="#d97706"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          {etData && etData.length > 0 && (
            <Line
              type="monotone"
              dataKey="ET"
              stroke="#60a5fa"
              strokeWidth={1.5}
              dot={false}
              strokeDasharray="5 5"
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function LinkToBatchButton({
  roastId,
  roastTitle,
}: {
  roastId: string;
  roastTitle: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [batches, setBatches] = useState<Array<{
    id: string;
    code: string;
    status: string;
    roastId: string | null;
    inputProduct: { name: string };
    outputProduct: { name: string };
  }>>([]);
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  const fetchBatches = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/roasting/batches", {
        credentials: "include",
      });
      const data = await res.json();
      setBatches(data.batches || []);
    } catch {
      setBatches([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async (batchId: string) => {
    setLinking(true);
    try {
      const res = await fetch("/api/roasting/link-roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ batchId, roastId }),
      });
      const data = await res.json();
      if (data.success) {
        setIsOpen(false);
        window.location.reload();
      } else {
        alert(data.error || "Gagal menghubungkan.");
      }
    } catch {
      alert("Gagal menghubungkan.");
    } finally {
      setLinking(false);
    }
  };

  return (
    <>
      <button
        onClick={() => {
          setIsOpen(true);
          fetchBatches();
        }}
        className="mt-3 rounded-lg border border-[var(--glass-border)] px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] transition"
      >
        Hubungkan ke Batch
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="glass-card rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
              Hubungkan ke Batch
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mb-4">
              Pilih batch roasting untuk menghubungkan roast &quot;{roastTitle}&quot;.
            </p>

            {loading ? (
              <p className="text-sm text-[var(--text-tertiary)]">Memuat batch...</p>
            ) : batches.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)]">
                Tidak ada batch yang tersedia. Buat batch terlebih dahulu di halaman Roasting.
              </p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {batches.map((batch) => (
                  <button
                    key={batch.id}
                    onClick={() => handleLink(batch.id)}
                    disabled={linking || !!batch.roastId}
                    className="w-full text-left rounded-xl border border-[var(--glass-border)] p-3 hover:bg-[var(--glass-bg-hover)] transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm text-[var(--text-primary)]">{batch.code}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        batch.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-600" :
                        batch.status === "PENDING" ? "bg-amber-500/10 text-amber-600" :
                        "bg-gray-500/10 text-gray-500"
                      }`}>
                        {batch.status}
                      </span>
                    </div>
                    <p className="text-xs text-[var(--text-tertiary)] mt-1">
                      {batch.inputProduct.name} → {batch.outputProduct.name}
                    </p>
                    {batch.roastId && (
                      <p className="text-[10px] text-amber-600 mt-1">Sudah terhubung ke roast lain</p>
                    )}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-xl border border-[var(--glass-border)] px-4 py-2 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--glass-bg-hover)] transition"
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </>
  );
}
