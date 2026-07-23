"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { createPairingCode, revokeConnector } from "../actions";
import {
  Link2,
  Unlink,
  Download,
  Monitor,
  Clock,
  CheckCircle2,
  Wifi,
  WifiOff,
} from "lucide-react";

type Machine = { id: string; name: string };

type Connector = {
  id: string;
  computerName: string;
  platform: string;
  appVersion: string;
  status: string;
  isOnline: boolean | null;
  lastSeenAt: string | null;
  lastSyncAt: string | null;
  createdAt: string;
  machine: { id: string; name: string };
};

type Props = {
  machines: Machine[];
  connectors: Connector[];
  downloadUrl: string | null;
};

function formatRelativeTime(iso: string | null): string {
  if (!iso) return "-";
  // Use a static string on server, will be updated on client via useEffect
  return new Date(iso).toLocaleString("id-ID");
}

export function ArtisanIntegrationClient({
  machines,
  connectors,
  downloadUrl,
}: Props) {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!expiresAt) return;
    const interval = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000),
      );
      setCountdown(remaining);
      if (remaining <= 0) {
        setPairingCode(null);
        setExpiresAt(null);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [expiresAt]);

  async function handlePair() {
    if (!selectedMachine) {
      toast.error("Pilih mesin terlebih dahulu.");
      return;
    }
    setLoading(true);
    try {
      const result = await createPairingCode(selectedMachine);
      if (result.success) {
        setPairingCode(result.code);
        setExpiresAt(result.expiresAt);
        toast.success(`Kode pairing untuk ${result.machineName} berhasil dibuat.`);
      } else {
        toast.error(result.error);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleRevoke(connectorId: string) {
    if (!confirm("Yakin ingin memutuskan connector ini?")) return;
    const result = await revokeConnector(connectorId);
    if (result.success) {
      toast.success("Connector berhasil dicabut.");
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-8">
      {/* Pairing Section */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Link2 size={18} className="text-[var(--amber-warm)]" />
          Hubungkan Artisan Sync
        </h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Buat kode pairing untuk menghubungkan desktop Artisan Sync dengan mesin roasting Anda.
        </p>

        <div className="flex flex-wrap items-end gap-4">
          <div className="min-w-[200px] flex-1">
            <label className="mb-1 block text-sm font-medium text-[var(--text-secondary)]">
              Pilih Mesin
            </label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              className="w-full rounded-xl border border-[var(--glass-border)] bg-[var(--glass-bg)] px-4 py-2.5 text-sm text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--amber-warm)]/50"
            >
              <option value="">-- Pilih Mesin --</option>
              {machines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handlePair}
            disabled={loading || !selectedMachine}
            className="rounded-xl bg-[var(--amber-warm)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? "Membuat..." : "Hubungkan Artisan"}
          </button>
        </div>

        {pairingCode && (
          <div className="mt-6 rounded-xl border-2 border-dashed border-[var(--amber-warm)]/30 bg-[var(--amber-warm)]/5 p-6 text-center">
            <p className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
              Masukkan kode ini di Artisan Sync:
            </p>
            <p className="mb-3 text-4xl font-black tracking-[0.3em] text-[var(--amber-warm)]">
              {pairingCode}
            </p>
            <p className="text-xs text-[var(--text-tertiary)]">
              Kode berlaku selama{" "}
              {Math.floor(countdown / 60)}:{String(countdown % 60).padStart(2, "0")}{" "}
              menit · hanya bisa digunakan sekali
            </p>
          </div>
        )}
      </section>

      {/* Download Section */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Download size={18} className="text-[var(--amber-warm)]" />
          Download Artisan Sync
        </h3>
        <p className="mb-4 text-sm text-[var(--text-secondary)]">
          Instal aplikasi desktop untuk menghubungkan Artisan dengan ROS secara otomatis.
        </p>
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--amber-warm)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
          >
            <Download size={16} />
            Download untuk Windows
          </a>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)]">
            Link download belum dikonfigurasi oleh admin.
          </p>
        )}
      </section>

      {/* Connectors List */}
      <section className="glass-card rounded-2xl p-6">
        <h3 className="mb-4 flex items-center gap-2 font-bold text-[var(--text-primary)]">
          <Monitor size={18} className="text-[var(--amber-warm)]" />
          Connector Terhubung
        </h3>

        {connectors.length === 0 ? (
          <p className="text-sm text-[var(--text-tertiary)]">
            Belum ada connector yang terhubung.
          </p>
        ) : (
          <div className="space-y-3">
            {connectors.map((c) => (
              <div
                key={c.id}
                className="flex items-center gap-4 rounded-xl border border-[var(--glass-border)] p-4 transition hover:shadow-sm"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--glass-bg)]">
                  {c.isOnline ? (
                    <Wifi className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-[var(--text-tertiary)]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-[var(--text-primary)]">
                      {c.computerName}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                        c.status === "REVOKED"
                          ? "bg-red-500/10 text-red-500"
                          : c.isOnline
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-gray-500/10 text-gray-500"
                      }`}
                    >
                      {c.status === "REVOKED"
                        ? "Dicabut"
                        : c.isOnline
                          ? "Online"
                          : "Offline"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {c.machine.name} · {c.platform} · v{c.appVersion}
                  </p>
                  <div className="mt-1 flex items-center gap-4 text-xs text-[var(--text-tertiary)]">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      Terakhir online: {formatRelativeTime(c.lastSeenAt)}
                    </span>
                    {c.lastSyncAt && (
                      <span className="flex items-center gap-1">
                        <CheckCircle2 size={12} />
                        Sync: {formatRelativeTime(c.lastSyncAt)}
                      </span>
                    )}
                  </div>
                </div>
                {c.status !== "REVOKED" && (
                  <button
                    onClick={() => handleRevoke(c.id)}
                    className="rounded-lg p-2 text-[var(--text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition"
                    title="Putuskan"
                  >
                    <Unlink size={16} />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
