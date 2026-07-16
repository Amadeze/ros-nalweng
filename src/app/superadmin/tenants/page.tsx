import { prisma } from "@/lib/prisma";
import { TenantForm } from "./_components/TenantForm";
import { EditTenantDialog } from "./_components/EditTenantDialog";
import { Coffee, ExternalLink } from "lucide-react";

export default async function TenantsPage() {
  const tenants = await prisma.tenant.findMany({
    where: { id: { not: "default" } },
    include: {
      users: {
        where: { role: "OWNER" },
        take: 1
      },
      invoices: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Tenants (Outlets)</h2>
          <p className="text-slate-400 mt-1">Manage registered outlets on this platform.</p>
        </div>
        <TenantForm />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-950/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Outlet Info</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Admin Contact</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Subdomain</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Subscription</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Status</th>
                <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50">
              {tenants.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                        {t.logoUrl ? (
                          <img src={t.logoUrl} alt="" className="w-6 h-6 object-contain" />
                        ) : (
                          <Coffee size={18} className="text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-white">{t.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{t.code}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-300">{t.users[0]?.name || "N/A"}</p>
                    <p className="text-xs text-slate-500">{t.users[0]?.email || "N/A"}</p>
                  </td>
                  <td className="px-6 py-4">
                    <a 
                      href={`http://${t.subdomain}.localhost:3000`} 
                      target="_blank" rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 text-xs font-mono transition-colors border border-amber-500/20"
                    >
                      {t.subdomain}
                      <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-300">{t.subscriptionTier}</p>
                    <p className={`text-xs ${t.subscriptionStatus === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-500'}`}>
                      {t.subscriptionStatus}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase border ${
                      t.isActive 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      {t.isActive ? "ACTIVE" : "INACTIVE"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <EditTenantDialog 
                      tenant={{
                        id: t.id,
                        name: t.name,
                        code: t.code,
                        isActive: t.isActive,
                        subscriptionTier: t.subscriptionTier,
                        subscriptionStatus: t.subscriptionStatus
                      }}
                    />
                  </td>
                </tr>
              ))}
              
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    Belum ada outlet terdaftar.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
