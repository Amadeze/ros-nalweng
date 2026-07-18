import { prisma } from "@/lib/prisma";
import { PLAN_CATALOG } from "@/lib/plans";
import { getTenantAccessState } from "@/lib/subscription";
import { SuperadminShell } from "./_components/SuperadminShell";
import { getCurrentDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function SuperadminDashboard() {
  const [tenants, gmvTotal] = await Promise.all([
    prisma.tenant.findMany({ 
      where: { id: { not: "default" } },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.invoice.aggregate({
      where: { status: { in: ["PAID", "ISSUED", "PARTIAL"] } },
      _sum: { grandTotal: true }
    })
  ]);

  const totalGmv = gmvTotal._sum.grandTotal ? Number(gmvTotal._sum.grandTotal) : 0;
  
  // Calculate MRR
  let mrr = 0;
  let activeCount = 0;
  
  tenants.forEach(t => {
    if (getTenantAccessState(t) === "ACTIVE") {
      activeCount++;
      mrr += PLAN_CATALOG[t.subscriptionTier].monthlyPrice ?? 0;
    }
  });

  // Calculate new tenants this month
  const now = getCurrentDate();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newTenantsThisMonth = tenants.filter(t => new Date(t.createdAt) >= startOfMonth).length;

  // Tenant growth over the last six calendar months.
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const growthData = Array.from({length: 6}).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
    const m = months[d.getMonth()];
    // Calculate how many tenants existed at the end of that month
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() - 4 + i, 0);
    const count = tenants.filter(t => new Date(t.createdAt) <= endOfMonth).length;
    return { name: m, tenants: count };
  });

  const recentTenants = tenants.slice(0, 5).map(t => ({
    id: t.id,
    name: t.name,
    subdomain: t.subdomain,
    tier: t.subscriptionTier,
    status: t.subscriptionStatus,
    createdAt: t.createdAt.toISOString()
  }));

  const data = {
    totalTenants: tenants.length,
    activeTenants: activeCount,
    newTenantsThisMonth,
    mrr,
    totalGmv,
    growthData,
    recentTenants
  };

  return <SuperadminShell data={data} />;
}
