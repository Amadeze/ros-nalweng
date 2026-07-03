"use server";

import { prisma } from "@/lib/prisma";

// =============================================================================
// TYPES
// =============================================================================

export type DashboardKpi = {
  revenueToday:    number; // sum grandTotal nota PAID hari ini
  kasToday:        number; // sum Payment.amount diterima hari ini (semua metode)
  totalPiutang:    number; // sum sisa tagihan ISSUED+PARTIAL
  piutangCount:    number;
  lowStockCount:   number;
};

export type LowStockItem = {
  id:       string;
  name:     string;
  type:     "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  stock:    number;
  unit:     "kg" | "pcs";
  threshold: number;
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
  kpi:       DashboardKpi;
  lowStock:  LowStockItem[];
  activity:  ActivityItem[];
  asOf:      string; // ISO — untuk "last refreshed" label
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
  const now          = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfToday   = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

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
  ] = await Promise.all([

    // 1. Revenue hari ini (nota PAID yang diterbitkan hari ini)
    prisma.invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { grandTotal: true },
    }),

    // 2. Kas diterima hari ini (semua Payment yang paidAt hari ini)
    prisma.payment.aggregate({
      where: { paidAt: { gte: startOfToday, lte: endOfToday } },
      _sum: { amount: true },
    }),

    // 3. Total piutang outstanding
    prisma.invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIAL"] } },
      select: { grandTotal: true, paidAmount: true },
    }),

    // 4a. Stok kg: GB + RB — agregasi via raw SQL (GROUP BY)
    prisma.$queryRaw<KgAggRow[]>`
      SELECT il."productId",
        SUM(CASE WHEN il."entryType" = 'IN' THEN il."quantityKg"
                 ELSE -il."quantityKg" END)::float AS "stockKg"
      FROM inventory_ledger il
      WHERE il."productId" IS NOT NULL AND il."quantityKg" IS NOT NULL
      GROUP BY il."productId"
    `,

    // 4b. Stok FG (unit) — productId + quantityUnit
    prisma.$queryRaw<UnitAggRow[]>`
      SELECT il."productId" AS "refId",
        SUM(CASE WHEN il."entryType" = 'IN' THEN il."quantityUnit"
                 ELSE -il."quantityUnit" END)::int AS "stockUnit"
      FROM inventory_ledger il
      WHERE il."productId" IS NOT NULL AND il."quantityUnit" IS NOT NULL
      GROUP BY il."productId"
    `,

    // 4c. Stok Packaging (unit)
    prisma.$queryRaw<UnitAggRow[]>`
      SELECT il."packagingId" AS "refId",
        SUM(CASE WHEN il."entryType" = 'IN' THEN il."quantityUnit"
                 ELSE -il."quantityUnit" END)::int AS "stockUnit"
      FROM inventory_ledger il
      WHERE il."packagingId" IS NOT NULL AND il."quantityUnit" IS NOT NULL
      GROUP BY il."packagingId"
    `,

    // 5a. Master produk aktif (GB+RB+FG)
    prisma.product.findMany({
      where: { isActive: true, type: { in: ["GREEN_BEAN", "ROASTED_BEAN", "FINISHED_GOODS"] } },
      select: { id: true, name: true, type: true },
      orderBy: { name: "asc" },
    }),

    // 5b. Master kemasan aktif
    prisma.packaging.findMany({
      where: { isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),

    // 6. Activity: 8 Purchase terbaru
    prisma.purchase.findMany({
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

    // 7. Activity: 8 RoastingBatch terbaru
    prisma.roastingBatch.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, status: true, createdAt: true,
        inputWeightKg: true, outputWeightKg: true, roastLossPercent: true,
        inputProduct:  { select: { name: true } },
        outputProduct: { select: { name: true } },
      },
    }),

    // 8. Activity: 8 ProductionBatch terbaru
    prisma.productionBatch.findMany({
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
    prisma.invoice.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true, code: true, status: true, createdAt: true,
        grandTotal: true,
        customer:   { select: { name: true } },
        _count:     { select: { items: true } },
      },
    }),
  ]);

  // ── KPI calculations ──
  const revenueToday = Number(revenueTodayRaw._sum.grandTotal ?? 0);
  const kasToday     = Number(kasTodayRaw._sum.amount ?? 0);
  const totalPiutang = piutangAgg.reduce((s, inv) =>
    s + Number(inv.grandTotal) - Number(inv.paidAmount), 0);
  const piutangCount = piutangAgg.length;

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
      description: `${r.inputProduct.name} → ${r.outputProduct.name} · ${Number(r.roastLossPercent).toFixed(1)}% susut`,
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
    },
    lowStock,
    activity: activities,
    asOf: now.toISOString(),
  };
}
