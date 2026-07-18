"use server";
import { requireTenantPrisma } from "@/lib/auth";
import { getCurrentUser } from "@/lib/session";
import { getCurrentDate } from "@/lib/date-utils";


// =============================================================================
// TYPES
// =============================================================================

export type DashboardKpi = {
  revenueToday:    number; // sum grandTotal nota PAID hari ini
  kasToday:        number; // sum Payment.amount diterima hari ini (semua metode)
  totalPiutang:    number; // sum sisa tagihan ISSUED+PARTIAL
  piutangCount:    number;
  lowStockCount:   number;
  totalKopiTerjual: number;
  averageRoastYield: number; // calculated from totalShrinkagePercent
  averageGrossMargin: number; // (revenue - cogs) / revenue * 100
};

export type LowStockItem = {
  id:       string;
  name:     string;
  type:     "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  stock:    number;
  unit:     "kg" | "pcs";
  threshold: number;
};

export type RevenueTrend = {
  date: string;
  revenue: number;
};

export type TopProduct = {
  id: string;
  name: string;
  sold: number;
};

export type TopCustomer = {
  id: string;
  name: string;
  totalSpent: number;
};

export type ActivityItem = {
  id:          string;
  type:        "PURCHASE" | "ROASTING" | "PRODUCTION" | "SALE";
  code:        string;
  description: string;
  amount:      number | null;
  status:      string;
  timestamp:   string; // ISO
};

export type DashboardData = {
  kpi:          DashboardKpi;
  revenueTrend: RevenueTrend[];
  topProducts:  TopProduct[];
  topCustomers: TopCustomer[];
  lowStock:     LowStockItem[];
  activity:     ActivityItem[];
  asOf:         string; // ISO
};

// ── Thresholds untuk peringatan stok tipis ──
const GB_THRESHOLD_KG  = 5;    // < 5 kg
const RB_THRESHOLD_KG  = 2;    // < 2 kg
const FG_THRESHOLD_PCS = 10;   // < 10 unit
const PKG_THRESHOLD_PCS = 30;  // < 30 pcs

// =============================================================================
// MAIN QUERY
// =============================================================================

type KgAggRow    = { productId: string; stockKg: number };
type UnitAggRow  = { refId: string; stockUnit: number };

export async function getDashboardData(): Promise<DashboardData> {
  const user = await getCurrentUser();
  if (!user || !user.tenantId) throw new Error("Unauthorized");

  const now          = getCurrentDate();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const sevenDaysAgo = new Date(startOfToday);
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);

  const tp = await requireTenantPrisma();
  const tenantId = user.tenantId;

  // ── All queries fire in parallel ──
  const [
    revenueTodayRaw,
    kasTodayRaw,
    piutangAgg,
    gbRbAgg,
    fgAgg,
    pkgAgg,
    allProducts,
    allPackagings,
    recentPurchases,
    recentRoastings,
    recentProductions,
    recentInvoices,
    revenueTrendRaw,
    topProductsRaw,
    topCustomersRaw,
    totalKopiTerjualRaw,
    roastYieldRaw,
    marginRaw,
  ] = await Promise.all([

    // 1. Revenue hari ini (nota PAID yang diterbitkan hari ini)
    tp.invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { grandTotal: true },
    }),

    // 2. Kas diterima hari ini (semua Payment yang paidAt hari ini)
    tp.payment.aggregate({
      where: { paidAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { amount: true },
    }),

    // 3. Total piutang outstanding
    tp.invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIAL"] } },
      select: { grandTotal: true, paidAmount: true },
    }),

    // 4a. Stok kg: GB + RB — fetch dari Product cache
    tp.product.findMany({
      where: { type: { in: ["GREEN_BEAN", "ROASTED_BEAN"] } },
      select: { id: true, stockKg: true },
    }).then(rows => rows.map(r => ({ productId: r.id, stockKg: Number(r.stockKg) }))),

    // 4b. Stok FG (unit) — fetch dari Product cache
    tp.product.findMany({
      where: { type: "FINISHED_GOODS" },
      select: { id: true, stockUnit: true },
    }).then(rows => rows.map(r => ({ refId: r.id, stockUnit: Number(r.stockUnit) }))),

    // 4c. Stok Packaging (unit) — fetch dari Packaging cache
    tp.packaging.findMany({
      select: { id: true, stockUnit: true },
    }).then(rows => rows.map(r => ({ refId: r.id, stockUnit: Number(r.stockUnit) }))),

    // 5a. Master produk aktif (GB+RB+FG)
    tp.product.findMany({
      where: { isActive: true, type: { in: ["GREEN_BEAN", "ROASTED_BEAN", "FINISHED_GOODS"] } },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),

    // 5b. Master kemasan aktif
    tp.packaging.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    // 6. Activity: 8 Purchase terbaru
    tp.purchase.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, type: true, status: true, createdAt: true,
        totalCost: true,
        product:   { select: { name: true } },
        packaging: { select: { name: true } },
        supplier:  { select: { name: true } },
      },
    }),

    // 7. Activity: 8 ParentRoastingBatch terbaru
    tp.parentRoastingBatch.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, status: true, createdAt: true,
        targetWeightKg: true, actualOutputKg: true, totalShrinkagePercent: true,
        inputProduct:  { select: { name: true } },
        outputProduct: { select: { name: true } },
      },
    }),

    // 8. Activity: 8 ProductionBatch terbaru
    tp.productionBatch.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, status: true, createdAt: true,
        unitsProduced: true,
        outputProduct: { select: { name: true } },
        packaging:     { select: { name: true } },
      },
    }),

    // 9. Activity: 8 Invoice terbaru
    tp.invoice.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, status: true, createdAt: true,
        grandTotal: true,
        customer:   { select: { name: true } },
        _count:     { select: { items: true } },
      },
    }),

    // 10. Revenue Trend (Last 7 Days)
    tp.$queryRaw<{ date: Date; revenue: number }[]>`
      SELECT DATE_TRUNC('day', "issuedAt") as "date", SUM("grandTotal")::float as "revenue"
      FROM "invoices"
      WHERE "tenantId" = ${tenantId} AND "status" = 'PAID' AND "issuedAt" >= ${sevenDaysAgo}
      GROUP BY DATE_TRUNC('day', "issuedAt")
      ORDER BY "date" ASC
    `,

    // 11. Top 5 Products
    tp.$queryRaw<{ id: string; name: string; sold: number }[]>`
      SELECT p.id, p."name", SUM(ii."quantity")::int as "sold"
      FROM "invoice_items" ii
      JOIN "products" p ON ii."productId" = p.id
      JOIN "invoices" i ON ii."invoiceId" = i.id
      WHERE i."tenantId" = ${tenantId} AND i."status" IN ('PAID', 'PARTIAL', 'ISSUED')
      GROUP BY p.id, p."name"
      ORDER BY "sold" DESC
      LIMIT 5
    `,

    // 12. Top 5 Customers
    tp.$queryRaw<{ id: string; name: string; totalSpent: number }[]>`
      SELECT c.id, c."name", SUM(i."grandTotal")::float as "totalSpent"
      FROM "invoices" i
      JOIN "customers" c ON i."customerId" = c.id
      WHERE i."tenantId" = ${tenantId} AND i."status" IN ('PAID', 'PARTIAL')
      GROUP BY c.id, c."name"
      LIMIT 5
    `,

    // 13. Total Kopi Terjual
    tp.$queryRaw<{ totalSoldKg: number }[]>`
      SELECT COALESCE(SUM(il."quantityUnit" * r."outputGrams" / 1000.0), 0)::float as "totalSoldKg"
      FROM "inventory_ledger" il
      JOIN "products" p ON il."productId" = p.id
      LEFT JOIN "recipes" r ON r."productId" = p.id
      WHERE il."tenantId" = ${tenantId} AND il."entryType" = 'OUT' AND il."refType" = 'SALE_FG_OUT' AND p."type" = 'FINISHED_GOODS'
    `,

    // 14. Average Roast Yield
    tp.parentRoastingBatch.aggregate({
      _avg: { totalShrinkagePercent: true },
      where: { status: "COMPLETED" }
    }),

    // 15. Gross Margin (All time)
    tp.$queryRaw<{ totalRevenue: number, totalCogs: number }[]>`
      SELECT 
        COALESCE(SUM(ii."subtotal"), 0)::float as "totalRevenue",
        COALESCE(SUM(ii."hpp" * ii."quantity"), 0)::float as "totalCogs"
      FROM "invoice_items" ii
      JOIN "invoices" i ON ii."invoiceId" = i.id
      WHERE i."tenantId" = ${tenantId} AND i."status" IN ('PAID', 'PARTIAL', 'ISSUED')
    `,
  ]);

  // ── KPI calculations ──
  const revenueToday = Number(revenueTodayRaw._sum.grandTotal ?? 0);
  const kasToday     = Number(kasTodayRaw._sum.amount ?? 0);
  const totalPiutang = piutangAgg.reduce((s, inv) =>
    s + Number(inv.grandTotal) - Number(inv.paidAmount), 0);
  const piutangCount = piutangAgg.length;
  const totalKopiTerjual = totalKopiTerjualRaw[0]?.totalSoldKg ?? 0;
  
  // Calculate Roasting Yield (100% - Average Loss %)
  const avgLoss = Number(roastYieldRaw._avg.totalShrinkagePercent ?? 0);
  const averageRoastYield = avgLoss > 0 ? 100 - avgLoss : 0;
  
  // Calculate Gross Margin
  const totalRev = marginRaw[0]?.totalRevenue || 0;
  const totalCogs = marginRaw[0]?.totalCogs || 0;
  const averageGrossMargin = totalRev > 0 ? ((totalRev - totalCogs) / totalRev) * 100 : 0;

  // ── Build stock maps ──
  const gbRbMap  = new Map(gbRbAgg.map((r) => [r.productId, r.stockKg]));
  const fgMap    = new Map(fgAgg.map((r)   => [r.refId, r.stockUnit]));
  const pkgMap   = new Map(pkgAgg.map((r)  => [r.refId, r.stockUnit]));

  // ── Low stock items ──
  const lowStock: LowStockItem[] = [];

  for (const p of allProducts) {
    if (p.type === "FINISHED_GOODS") {
      const stock = fgMap.get(p.id) ?? 0;
      if (stock < FG_THRESHOLD_PCS) {
        lowStock.push({
          id: p.id, name: p.name, type: "FINISHED_GOODS",
          stock, unit: "pcs", threshold: FG_THRESHOLD_PCS,
        });
      }
    } else {
      const stock = gbRbMap.get(p.id) ?? 0;
      const threshold = p.type === "GREEN_BEAN" ? GB_THRESHOLD_KG : RB_THRESHOLD_KG;
      if (stock < threshold) {
        lowStock.push({
          id: p.id, name: p.name,
          type: p.type as "GREEN_BEAN" | "ROASTED_BEAN",
          stock, unit: "kg", threshold,
        });
      }
    }
  }

  for (const pkg of allPackagings) {
    const stock = pkgMap.get(pkg.id) ?? 0;
    if (stock < PKG_THRESHOLD_PCS) {
      lowStock.push({
        id: pkg.id, name: pkg.name, type: "PACKAGING",
        stock, unit: "pcs", threshold: PKG_THRESHOLD_PCS,
      });
    }
  }

  // ── Transform Charts Data ──
  const revenueTrendMap = new Map(revenueTrendRaw.map(r => [
    new Date(r.date).toISOString().split('T')[0],
    r.revenue
  ]));

  const revenueTrend: RevenueTrend[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const isoDate = d.toISOString().split('T')[0];
    const label = new Intl.DateTimeFormat("id-ID", { day: '2-digit', month: 'short' }).format(d);
    
    revenueTrend.push({
      date: label,
      revenue: revenueTrendMap.get(isoDate) ?? 0,
    });
  }

  const topProducts: TopProduct[] = topProductsRaw.map(p => ({
    id: p.id,
    name: p.name,
    sold: Number(p.sold),
  }));

  // ── Build activity feed ──
  const STATUS_TX: Record<string, string> = {
    COMPLETED: "Selesai", PENDING: "Proses", VOID: "Void",
  };
  const STATUS_INV: Record<string, string> = {
    PAID: "Lunas", ISSUED: "Tempo", PARTIAL: "Sebagian", DRAFT: "Draft", VOID: "Void",
  };

  const activities: ActivityItem[] = [
    ...recentPurchases.map((p) => ({
      id:          p.id,
      type:        "PURCHASE" as const,
      code:        p.code,
      description: `${p.type === "GREEN_BEAN"
        ? `GB ${p.product?.name ?? "—"}`
        : `PKG ${p.packaging?.name ?? "—"}`} · ${p.supplier.name}`,
      amount:      Number(p.totalCost),
      status:      STATUS_TX[p.status] ?? p.status,
      timestamp:   p.createdAt.toISOString(),
    })),

    ...recentRoastings.map((r) => ({
      id:          r.id,
      type:        "ROASTING" as const,
      code:        r.code,
      description: `${r.inputProduct.name} → ${r.outputProduct.name} · ${Number(r.totalShrinkagePercent).toFixed(1)}% susut`,
      amount:      null,
      status:      STATUS_TX[r.status] ?? r.status,
      timestamp:   r.createdAt.toISOString(),
    })),

    ...recentProductions.map((p) => ({
      id:          p.id,
      type:        "PRODUCTION" as const,
      code:        p.code,
      description: `${p.outputProduct.name} · ${p.unitsProduced} unit · ${p.packaging.name}`,
      amount:      null,
      status:      STATUS_TX[p.status] ?? p.status,
      timestamp:   p.createdAt.toISOString(),
    })),

    ...recentInvoices.map((inv) => ({
      id:          inv.id,
      type:        "SALE" as const,
      code:        inv.code,
      description: `${inv.customer.name} · ${inv._count.items} item`,
      amount:      Number(inv.grandTotal),
      status:      STATUS_INV[inv.status] ?? inv.status,
      timestamp:   inv.createdAt.toISOString(),
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20);

  return {
    kpi: {
      revenueToday,
      kasToday,
      totalPiutang,
      piutangCount,
      lowStockCount: lowStock.length,
      totalKopiTerjual,
      averageRoastYield,
      averageGrossMargin,
    },
    revenueTrend,
    topProducts: topProductsRaw,
    topCustomers: topCustomersRaw,
    lowStock,
    activity: activities,
    asOf: now.toISOString(),
  };
}
