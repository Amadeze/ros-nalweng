import Link from "next/link";
import { BellRing, ScrollText, Webhook } from "lucide-react";

import { StandardPageLayout } from "@/components/StandardPageLayout";
import { requireRole, requireTenantPrisma } from "@/lib/auth";

export const dynamic = "force-dynamic";

function dateTime(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function statusClass(status: string) {
  if (status === "PROCESSED" || status === "SENT") return "bg-emerald-100 text-emerald-700";
  if (status === "FAILED") return "bg-red-100 text-red-700";
  if (status === "IGNORED") return "bg-slate-100 text-slate-600";
  return "bg-amber-100 text-amber-700";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>;
}) {
  await requireRole("OWNER", "MANAGER");
  const db = await requireTenantPrisma();
  const { view } = await searchParams;
  const activeView =
    view === "webhooks" ? "webhooks" : view === "reminders" ? "reminders" : "audit";

  const [auditLogs, webhookEvents, reminderDeliveries] = await Promise.all([
    db.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    db.webhookEvent.findMany({
      take: 100,
      orderBy: { receivedAt: "desc" },
    }),
    db.reminderDelivery.findMany({
      take: 100,
      orderBy: { createdAt: "desc" },
      include: {
        invoice: {
          select: {
            code: true,
            customer: { select: { name: true } },
          },
        },
      },
    }),
  ]);

  return (
    <StandardPageLayout
      title="Audit & Integrasi"
      description="Jejak perubahan penting dan status event integrasi tenant."
    >
      <div className="mb-4 flex border-b border-slate-200">
        <Link
          href="/audit?view=audit"
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
            activeView === "audit"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500"
          }`}
        >
          <ScrollText size={17} />
          Aktivitas ({auditLogs.length})
        </Link>
        <Link
          href="/audit?view=webhooks"
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
            activeView === "webhooks"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500"
          }`}
        >
          <Webhook size={17} />
          Webhook ({webhookEvents.length})
        </Link>
        <Link
          href="/audit?view=reminders"
          className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold ${
            activeView === "reminders"
              ? "border-blue-600 text-blue-700"
              : "border-transparent text-slate-500"
          }`}
        >
          <BellRing size={17} />
          Reminder ({reminderDeliveries.length})
        </Link>
      </div>

      {activeView === "audit" ? (
        <div className="overflow-x-auto border-y border-slate-200 bg-white/60">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Waktu</th>
                <th className="px-4 py-3">Pengguna</th>
                <th className="px-4 py-3">Aksi</th>
                <th className="px-4 py-3">Entitas</th>
                <th className="px-4 py-3">Referensi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.map((log) => (
                <tr key={log.id} className="text-slate-700">
                  <td className="whitespace-nowrap px-4 py-3">{dateTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{log.user?.name || "System"}</div>
                    <div className="text-xs text-slate-400">{log.user?.email || "Automated event"}</div>
                  </td>
                  <td className="px-4 py-3 font-semibold">{log.action}</td>
                  <td className="px-4 py-3">{log.entityType}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.entityId || "-"}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400">
                    Belum ada aktivitas yang tercatat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : activeView === "webhooks" ? (
        <div className="overflow-x-auto border-y border-slate-200 bg-white/60">
          <table className="w-full min-w-[840px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Diterima</th>
                <th className="px-4 py-3">Provider</th>
                <th className="px-4 py-3">Event</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {webhookEvents.map((event) => (
                <tr key={event.id} className="text-slate-700">
                  <td className="whitespace-nowrap px-4 py-3">{dateTime(event.receivedAt)}</td>
                  <td className="px-4 py-3 font-semibold">{event.provider}</td>
                  <td className="px-4 py-3">{event.eventType}</td>
                  <td className="max-w-64 truncate px-4 py-3 font-mono text-xs">{event.eventId}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${statusClass(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="max-w-72 truncate px-4 py-3 text-xs text-slate-500">
                    {event.error || "-"}
                  </td>
                </tr>
              ))}
              {webhookEvents.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Belum ada webhook yang diterima.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div data-testid="reminder-deliveries" className="overflow-x-auto border-y border-slate-200 bg-white/60">
          <table className="w-full min-w-[760px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Tanggal</th>
                <th className="px-4 py-3">Invoice</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reminderDeliveries.map((delivery) => (
                <tr key={delivery.id} className="text-slate-700">
                  <td className="whitespace-nowrap px-4 py-3">{dateTime(delivery.createdAt)}</td>
                  <td className="px-4 py-3 font-semibold">{delivery.invoice.code}</td>
                  <td className="px-4 py-3">{delivery.invoice.customer.name}</td>
                  <td className="px-4 py-3">{delivery.channel}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold ${statusClass(delivery.status)}`}>
                      {delivery.status}
                    </span>
                  </td>
                  <td className="max-w-72 truncate px-4 py-3 text-xs text-slate-500">
                    {delivery.error || "-"}
                  </td>
                </tr>
              ))}
              {reminderDeliveries.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    Belum ada reminder yang dikirim.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </StandardPageLayout>
  );
}
