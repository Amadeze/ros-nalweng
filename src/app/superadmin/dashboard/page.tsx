import { prisma } from "@/lib/prisma";

export default async function SuperadminDashboard() {
  const [tenantCount, gmvTotal] = await Promise.all([
    prisma.tenant.count({ where: { id: { not: "default" } } }),
    prisma.invoice.aggregate({
      where: { status: { in: ["PAID", "ISSUED", "PARTIAL"] } },
      _sum: { grandTotal: true }
    })
  ]);

  const totalGmv = gmvTotal._sum.grandTotal ? Number(gmvTotal._sum.grandTotal) : 0;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">System Overview</h2>
        <p className="text-slate-400 mt-1">Monitor all active tenants and total platform GMV.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Total Tenants</p>
          <p className="text-4xl font-extrabold text-white">{tenantCount}</p>
        </div>
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-2">Platform GMV (All Time)</p>
          <p className="text-4xl font-extrabold text-amber-500">Rp {totalGmv.toLocaleString("id-ID")}</p>
        </div>
      </div>
    </div>
  );
}
