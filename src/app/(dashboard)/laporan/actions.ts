"use server";

import { getPnLReport } from "../keuangan/actions";
import { getSystemUserId, requireFeature, requireTenantPrisma } from "@/lib/auth";
import { getPayableAgingBucket } from "@/lib/purchase-payments";
import { revalidatePath } from "next/cache";
import { getCurrentDate } from "@/lib/date-utils";
import { weightedAverageCost } from "@/lib/financial-reporting";

export type ValuationRow = {
  id: string;
  code: string;
  name: string;
  category: "GREEN_BEAN" | "ROASTED_BEAN" | "FINISHED_GOODS" | "PACKAGING";
  stock: number;
  unit: string;
  unitCost: number;
  totalValue: number;
  retailPrice?: number;
  potentialRevenue?: number;
};

export type InventoryValuationReport = {
  items: ValuationRow[];
  totalGreenBeanValue: number;
  totalRoastedBeanValue: number;
  totalFinishedGoodsValue: number;
  totalPackagingValue: number;
  grandTotalValue: number;
  totalFinishedGoodsPotentialRevenue: number;
  totalFinishedGoodsMarginHealth: number;
  totalPotentialRevenue: number;
  totalMarginHealth: number;
  asOf: string;
  costMethod: "WEIGHTED_AVERAGE";
  zeroCostItemCount: number;
};

export async function getInventoryValuationReport(asOf = getCurrentDate()): Promise<InventoryValuationReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  const products = await tp.product.findMany({
    where: { isActive: true },
    include: {
      purchases: {
        where: {
          status: { in: ["COMPLETED", "VOID"] },
          receivedAt: { lte: asOf },
          OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
        },
        select: { weightKg: true, totalCost: true },
      },
      productionBatches: {
        where: {
          status: { in: ["COMPLETED", "VOID"] },
          producedAt: { lte: asOf },
          OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
        },
        select: { unitsProduced: true, hppPerUnit: true },
      },
      ledgerEntries: {
        where: { createdAt: { lte: asOf } },
        select: { entryType: true, quantityKg: true, quantityUnit: true },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const roasts = await tp.parentRoastingBatch.findMany({
    where: {
      status: { in: ["COMPLETED", "VOID"] },
      AND: [{ OR: [{ voidAt: null }, { voidAt: { gt: asOf } }] }],
      OR: [
        { completedAt: { lte: asOf } },
        { completedAt: null, createdAt: { lte: asOf } },
      ],
    },
    select: {
      inputProductId: true,
      outputProductId: true,
      targetWeightKg: true,
      actualOutputKg: true,
    },
  });

  const greenBeanCost = new Map<string, number>();
  for (const product of products.filter((row) => row.type === "GREEN_BEAN")) {
    greenBeanCost.set(product.id, weightedAverageCost(product.purchases.map((purchase) => ({
      quantity: Number(purchase.weightKg ?? 0),
      totalCost: Number(purchase.totalCost),
    }))));
  }

  const roastedBeanCost = new Map<string, number>();
  for (const product of products.filter((row) => row.type === "ROASTED_BEAN")) {
    const layers = roasts
      .filter((roast) => roast.outputProductId === product.id)
      .map((roast) => ({
        quantity: Number(roast.actualOutputKg ?? 0),
        totalCost: Number(roast.targetWeightKg) * (greenBeanCost.get(roast.inputProductId) ?? 0),
      }));
    roastedBeanCost.set(product.id, weightedAverageCost(layers));
  }

  const items: ValuationRow[] = [];

  for (const p of products) {
    if (p.type === "GREEN_BEAN" || p.type === "ROASTED_BEAN") {
      const stockKg = p.ledgerEntries.reduce((stock, entry) => {
        const quantity = Number(entry.quantityKg ?? 0);
        return stock + (entry.entryType === "IN" ? quantity : -quantity);
      }, 0);
      const unitCost = p.type === "GREEN_BEAN"
        ? greenBeanCost.get(p.id) ?? 0
        : roastedBeanCost.get(p.id) ?? 0;

      if (stockKg > 0.0005) {
        const retailPrice = p.type === "ROASTED_BEAN" ? Number(p.price || 0) : undefined;
        const potentialRevenue = p.type === "ROASTED_BEAN" ? stockKg * (retailPrice || 0) : undefined;

        items.push({
          id: p.id,
          code: p.code,
          name: p.name,
          category: p.type as "GREEN_BEAN" | "ROASTED_BEAN",
          stock: stockKg,
          unit: "kg",
          unitCost,
          totalValue: stockKg * unitCost,
          ...(p.type === "ROASTED_BEAN" && { retailPrice, potentialRevenue }),
        });
      }
    } else if (p.type === "FINISHED_GOODS") {
      const stockUnit = p.ledgerEntries.reduce((stock, entry) => {
        const quantity = Number(entry.quantityUnit ?? 0);
        return stock + (entry.entryType === "IN" ? quantity : -quantity);
      }, 0);
      const unitCost = weightedAverageCost(p.productionBatches.map((batch) => ({
        quantity: batch.unitsProduced,
        totalCost: batch.unitsProduced * Number(batch.hppPerUnit),
      })));
      const retailPrice = Number(p.price || 0);
      const potentialRevenue = stockUnit * retailPrice;
      
      if (stockUnit > 0) {
        items.push({
          id: p.id,
          code: p.code,
          name: p.name,
          category: "FINISHED_GOODS",
          stock: stockUnit,
          unit: "pcs",
          unitCost,
          totalValue: stockUnit * unitCost,
          retailPrice,
          potentialRevenue,
        });
      }
    }
  }

  const packagings = await tp.packaging.findMany({
    where: { isActive: true },
    include: {
      purchases: {
        where: {
          status: { in: ["COMPLETED", "VOID"] },
          receivedAt: { lte: asOf },
          OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
        },
        select: { quantityUnits: true, totalCost: true },
      },
      ledgerEntries: {
        where: { createdAt: { lte: asOf } },
        select: { entryType: true, quantityUnit: true },
      },
    },
    orderBy: { name: "asc" },
  });

  for (const pkg of packagings) {
    const stockUnit = pkg.ledgerEntries.reduce((stock, entry) => {
      const quantity = Number(entry.quantityUnit ?? 0);
      return stock + (entry.entryType === "IN" ? quantity : -quantity);
    }, 0);

    if (stockUnit > 0) {
      const calculatedCost = weightedAverageCost(pkg.purchases.map((purchase) => ({
        quantity: Number(purchase.quantityUnits ?? 0),
        totalCost: Number(purchase.totalCost),
      })));
      const unitCost = calculatedCost || Number(pkg.costPerUnit);
      items.push({
        id: pkg.id,
        code: pkg.code,
        name: pkg.name,
        category: "PACKAGING",
        stock: stockUnit,
        unit: "pcs",
        unitCost,
        totalValue: stockUnit * unitCost,
      });
    }
  }

  const totalGreenBeanValue = items.filter((i) => i.category === "GREEN_BEAN").reduce((s, i) => s + i.totalValue, 0);
  const totalRoastedBeanValue = items.filter((i) => i.category === "ROASTED_BEAN").reduce((s, i) => s + i.totalValue, 0);
  const totalFinishedGoodsValue = items.filter((i) => i.category === "FINISHED_GOODS").reduce((s, i) => s + i.totalValue, 0);
  const totalPackagingValue = items.filter((i) => i.category === "PACKAGING").reduce((s, i) => s + i.totalValue, 0);
  const grandTotalValue = totalGreenBeanValue + totalRoastedBeanValue + totalFinishedGoodsValue + totalPackagingValue;

  const totalFinishedGoodsPotentialRevenue = items.filter((i) => i.category === "FINISHED_GOODS").reduce((s, i) => s + (i.potentialRevenue || 0), 0);
  const fgGrossMargin = totalFinishedGoodsPotentialRevenue - totalFinishedGoodsValue;
  const totalFinishedGoodsMarginHealth = totalFinishedGoodsPotentialRevenue > 0 ? (fgGrossMargin / totalFinishedGoodsPotentialRevenue) * 100 : 0;

  const totalPotentialRevenue = items.reduce((s, i) => s + (i.potentialRevenue || 0), 0);
  const totalGrossMargin = totalPotentialRevenue - (totalFinishedGoodsValue + totalRoastedBeanValue);
  const totalMarginHealth = totalPotentialRevenue > 0 ? (totalGrossMargin / totalPotentialRevenue) * 100 : 0;

  return {
    items,
    totalGreenBeanValue,
    totalRoastedBeanValue,
    totalFinishedGoodsValue,
    totalPackagingValue,
    grandTotalValue,
    totalFinishedGoodsPotentialRevenue,
    totalFinishedGoodsMarginHealth,
    totalPotentialRevenue,
    totalMarginHealth,
    asOf: asOf.toISOString(),
    costMethod: "WEIGHTED_AVERAGE",
    zeroCostItemCount: items.filter((item) => item.unitCost <= 0).length,
  };
}

// =============================================================================
// BALANCE SHEET (NERACA)
// =============================================================================

export type BalanceSheetReport = {
  asOf: string;
  status: "DRAFT";
  warnings: string[];
  assets: {
    cashAndBank: number;
    accountsReceivable: number;
    inventory: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    totalLiabilities: number;
    aging: {
      current: number;
      overdue1To30: number;
      overdue31To60: number;
      overdue61Plus: number;
    };
    trackingNote: string;
  };
  equity: {
    contributedCapital: number;
    retainedEarnings: number;
    distributedProfit: number;
    totalEquity: number;
  };
};

export async function getBalanceSheetReport(
  inventoryValue?: number,
  asOf = getCurrentDate(),
): Promise<BalanceSheetReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  const [customerPayments, expenses, supplierPayments] = await Promise.all([
    tp.payment.aggregate({
      where: {
        paidAt: { lte: asOf },
        OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
      },
      _sum: { amount: true },
    }),
    tp.expense.aggregate({
      where: {
        date: { lte: asOf },
        OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
      },
      _sum: { amount: true },
    }),
    tp.supplierPayment.aggregate({
      where: {
        paidAt: { lte: asOf },
        OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
      },
      _sum: { amount: true },
    }),
  ]);

  const totalInjected = 0;
  const totalWithdrawn = 0;
  const totalDistributed = 0;

  const cashIn = Number(customerPayments._sum.amount) || 0;
  const cashOut = (Number(expenses._sum.amount) || 0) + (Number(supplierPayments._sum.amount) || 0);
  
  // Kas = Uang Masuk Penjualan - Uang Keluar Operasional + Suntikan Modal - Penarikan Prive - Bagi Hasil
  const cashAndBank = cashIn - cashOut + totalInjected - totalWithdrawn - totalDistributed;

  // Accounts Receivable (Piutang)
  const piutangInvoices = await tp.invoice.findMany({
    where: {
      status: { not: "DRAFT" },
      issuedAt: { lte: asOf },
      OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
    },
    select: {
      grandTotal: true,
      payments: {
        where: {
          paidAt: { lte: asOf },
          OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
        },
        select: { amount: true },
      },
    },
  });
  const accountsReceivable = piutangInvoices.reduce((sum, invoice) => {
    const paid = invoice.payments.reduce((paymentSum, payment) => paymentSum + Number(payment.amount), 0);
    return sum + Math.max(0, Number(invoice.grandTotal) - paid);
  }, 0);

  // Inventory
  let inventory = inventoryValue || 0;
  if (inventoryValue === undefined) {
    const inventoryReport = await getInventoryValuationReport(asOf);
    inventory = inventoryReport.grandTotalValue;
  }

  const totalAssets = cashAndBank + accountsReceivable + inventory;

  const payablePurchases = await tp.purchase.findMany({
    where: {
      status: { in: ["COMPLETED", "VOID"] },
      receivedAt: { lte: asOf },
      OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
    },
    select: {
      totalCost: true,
      dueDate: true,
      payments: {
        where: {
          paidAt: { lte: asOf },
          OR: [{ voidAt: null }, { voidAt: { gt: asOf } }],
        },
        select: { amount: true },
      },
    },
  });
  const aging = {
    current: 0,
    overdue1To30: 0,
    overdue31To60: 0,
    overdue61Plus: 0,
  };
  for (const purchase of payablePurchases) {
    const paid = purchase.payments.reduce((sum, payment) => sum + Number(payment.amount), 0);
    const balance = Math.max(0, Number(purchase.totalCost) - paid);
    if (balance <= 0.01) continue;
    const bucket = getPayableAgingBucket(purchase.dueDate, asOf);
    if (bucket === "CURRENT") aging.current += balance;
    if (bucket === "OVERDUE_1_30") aging.overdue1To30 += balance;
    if (bucket === "OVERDUE_31_60") aging.overdue31To60 += balance;
    if (bucket === "OVERDUE_61_PLUS") aging.overdue61Plus += balance;
  }
  const accountsPayable =
    aging.current + aging.overdue1To30 + aging.overdue31To60 + aging.overdue61Plus;
  const totalLiabilities = accountsPayable;

  // Equity
  const totalEquity = totalAssets - totalLiabilities;
  const contributedCapital = totalInjected - totalWithdrawn;
  const retainedEarnings = totalEquity - contributedCapital;

  return {
    asOf: asOf.toISOString(),
    status: "DRAFT",
    warnings: [
      "Modal pemilik, aset tetap, pinjaman bank, dan pajak belum memiliki subledger khusus; ekuitas masih dihitung sebagai nilai residual.",
      "Kas & bank adalah estimasi arus transaksi tercatat dan belum direkonsiliasi dengan rekening bank fisik.",
    ],
    assets: {
      cashAndBank,
      accountsReceivable,
      inventory,
      totalAssets
    },
    liabilities: {
      accountsPayable,
      totalLiabilities,
      aging,
      trackingNote: payablePurchases.length > 0
        ? `${payablePurchases.length} pembelian supplier masih memiliki saldo hutang.`
        : "Tidak ada hutang supplier aktif.",
    },
    equity: {
      contributedCapital,
      retainedEarnings,
      distributedProfit: totalDistributed,
      totalEquity
    }
  };
}



export type GreenBeanFlow = {
  id: string;
  name: string;
  boughtKg: number;
  roastedKg: number;
  adjustmentOutKg: number;
  currentStockKg: number;
  avgPurchasePrice: number;
};

export type RoastedBeanFlow = {
  id: string;
  name: string;
  producedKg: number;
  roastLossKg: number;
  packagedKg: number;
  adjustmentOutKg: number;
  currentStockKg: number;
  roastLossValue: number;
};

export type FinishedGoodsFlow = {
  id: string;
  name: string;
  producedUnits: number;
  soldUnits: number;
  adjustmentOutUnits: number;
  currentStockUnits: number;
  weightPerUnitGrams: number;
  soldEquivalentKg: number;
  producedEquivalentKg: number;
  salesRevenue: number;
  cogs: number;
  grossProfit: number;
};

export type CoffeeFlowReport = {
  greenBeans: GreenBeanFlow[];
  roastedBeans: RoastedBeanFlow[];
  finishedGoods: FinishedGoodsFlow[];
  periodStart: string | null;
  periodEnd: string;
};

export async function getCoffeeFlowReport(
  periodStart?: Date,
  periodEnd = getCurrentDate(),
): Promise<CoffeeFlowReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  const products = await tp.product.findMany({
    where: { isActive: true },
    include: {
      ledgerEntries: { where: { createdAt: { lt: periodEnd } } },
      recipes: true,
      purchases: { where: { status: "COMPLETED", receivedAt: { lt: periodEnd } } },
      invoiceItems: { include: { invoice: { select: { status: true, issuedAt: true } } } },
      productionBatches: {
        where: { status: "COMPLETED" },
        orderBy: { producedAt: "desc" },
        take: 1
      }
    }
  });

  const greenBeans: GreenBeanFlow[] = [];
  const roastedBeans: RoastedBeanFlow[] = [];
  const finishedGoods: FinishedGoodsFlow[] = [];
  const inPeriod = (date: Date) => !periodStart || date >= periodStart;

  for (const p of products) {
    if (p.type === "GREEN_BEAN") {
      let bought = 0, roasted = 0, adjOut = 0, stock = 0;
      for (const l of p.ledgerEntries) {
        const qty = Number(l.quantityKg || 0);
        if (l.entryType === "IN") stock += qty; else stock -= qty;
        if (!inPeriod(l.createdAt)) continue;
        if (l.refType === "PURCHASE_GB" && l.entryType === "IN") bought += qty;
        if (l.refType === "ROASTING_GB_OUT" && l.entryType === "OUT") roasted += qty;
        if (l.refType === "ADJUSTMENT_OUT" && l.entryType === "OUT") adjOut += qty;
      }
      
      let totalPurCost = 0; let totalPurKg = 0;
      for (const pur of p.purchases) {
        totalPurCost += Number(pur.totalCost);
        totalPurKg += Number(pur.weightKg);
      }
      const avgPurchasePrice = totalPurKg > 0 ? totalPurCost / totalPurKg : 0;

      greenBeans.push({
        id: p.id, name: p.name, boughtKg: bought, roastedKg: roasted, adjustmentOutKg: adjOut, currentStockKg: stock,
        avgPurchasePrice
      });
    } else if (p.type === "ROASTED_BEAN") {
      let produced = 0, packaged = 0, adjOut = 0, stock = 0;
      for (const l of p.ledgerEntries) {
        const qty = Number(l.quantityKg || 0);
        if (l.entryType === "IN") stock += qty; else stock -= qty;
        if (!inPeriod(l.createdAt)) continue;
        if (l.refType === "ROASTING_RB_IN" && l.entryType === "IN") produced += qty;
        if (l.refType === "PRODUCTION_RB_OUT" && l.entryType === "OUT") packaged += qty;
        if (l.refType === "ADJUSTMENT_OUT" && l.entryType === "OUT") adjOut += qty;
      }
      
      roastedBeans.push({
        id: p.id, name: p.name, producedKg: produced, roastLossKg: 0, packagedKg: packaged, adjustmentOutKg: adjOut, currentStockKg: stock,
        roastLossValue: 0
      });
    } else if (p.type === "FINISHED_GOODS") {
      let producedU = 0, soldU = 0, adjOutU = 0, stockU = 0;
      for (const l of p.ledgerEntries) {
        const qty = Number(l.quantityUnit || 0);
        if (l.entryType === "IN") stockU += qty; else stockU -= qty;
        if (!inPeriod(l.createdAt)) continue;
        if (l.refType === "PRODUCTION_FG_IN" && l.entryType === "IN") producedU += qty;
        if (l.refType === "SALE_FG_OUT" && l.entryType === "OUT") soldU += qty;
        if (l.refType === "ADJUSTMENT_OUT" && l.entryType === "OUT") adjOutU += qty;
      }
      
      let salesRevenue = 0;
      let cogs = 0;
      for (const inv of p.invoiceItems) {
        if (
          (inv.invoice.status === "PAID" || inv.invoice.status === "PARTIAL" || inv.invoice.status === "ISSUED")
          && inv.invoice.issuedAt < periodEnd
          && inPeriod(inv.invoice.issuedAt)
        ) {
          salesRevenue += Number(inv.subtotal);
          cogs += Number(inv.hpp) * inv.quantity;
        }
      }
      const grossProfit = salesRevenue - cogs;

      const weightGrams = p.recipes.length > 0 ? Number(p.recipes[0].outputGrams) : 0;
      finishedGoods.push({
        id: p.id, name: p.name, producedUnits: producedU, soldUnits: soldU, adjustmentOutUnits: adjOutU, currentStockUnits: stockU,
        weightPerUnitGrams: weightGrams,
        soldEquivalentKg: (soldU * weightGrams) / 1000,
        producedEquivalentKg: (producedU * weightGrams) / 1000,
        salesRevenue, cogs, grossProfit
      });
    }
  }

  // Calculate Roast Loss for RBs based on actual roasting batches
  const roastingBatches = await tp.parentRoastingBatch.findMany({
    where: {
      status: "COMPLETED",
      createdAt: { lt: periodEnd, ...(periodStart ? { gte: periodStart } : {}) },
    },
    select: { outputProductId: true, inputProductId: true, targetWeightKg: true, actualOutputKg: true },
  });
  
  for (const rb of roastedBeans) {
    const batches = roastingBatches.filter(b => b.outputProductId === rb.id);
    let totalInput = 0;
    let totalOutput = 0;
    let totalLossValue = 0;
    for (const b of batches) {
      const inW = Number(b.targetWeightKg);
      const outW = Number(b.actualOutputKg);
      totalInput += inW;
      totalOutput += outW;
      const lossKg = inW - outW;
      const gbPrice = greenBeans.find(gb => gb.id === b.inputProductId)?.avgPurchasePrice || 0;
      totalLossValue += lossKg * gbPrice;
    }
    rb.roastLossKg = totalInput - totalOutput;
    rb.roastLossValue = totalLossValue;
  }

  return {
    greenBeans,
    roastedBeans,
    finishedGoods,
    periodStart: periodStart?.toISOString() ?? null,
    periodEnd: periodEnd.toISOString(),
  };
}
