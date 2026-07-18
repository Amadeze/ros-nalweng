"use server";

import { getPnLReport } from "../keuangan/actions";
import { getSystemUserId, requireFeature, requireTenantPrisma } from "@/lib/auth";
import { getPayableAgingBucket } from "@/lib/purchase-payments";
import { revalidatePath } from "next/cache";

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
};

export async function getInventoryValuationReport(): Promise<InventoryValuationReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  // 1. Fetch GB and RB
  const products = await tp.product.findMany({
    where: { isActive: true },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        orderBy: { receivedAt: "desc" },
        take: 1,
        select: { pricePerUnit: true, weightKg: true, shippingCost: true },
      },
      productionBatches: {
        where: { status: "COMPLETED" },
        orderBy: { producedAt: "desc" },
        take: 1,
        select: { hppPerUnit: true },
      },
    },
    orderBy: [{ type: "asc" }, { name: "asc" }],
  });

  const roastedBeanIds = products
    .filter((product) => product.type === "ROASTED_BEAN")
    .map((product) => product.id);
  const latestRoasts = roastedBeanIds.length
    ? await tp.parentRoastingBatch.findMany({
        where: {
          outputProductId: { in: roastedBeanIds },
          status: "COMPLETED",
        },
        orderBy: { createdAt: "desc" },
        include: {
          inputProduct: {
            include: {
              purchases: {
                where: { status: "COMPLETED" },
                orderBy: { receivedAt: "desc" },
                take: 1,
              },
            },
          },
        },
      })
    : [];
  const latestRoastByOutput = new Map<string, (typeof latestRoasts)[number]>();
  for (const roast of latestRoasts) {
    if (!latestRoastByOutput.has(roast.outputProductId)) {
      latestRoastByOutput.set(roast.outputProductId, roast);
    }
  }

  const items: ValuationRow[] = [];

  for (const p of products) {
    if (p.type === "GREEN_BEAN" || p.type === "ROASTED_BEAN") {
      const stockKg = Number(p.stockKg);

      let unitCost = 0;
      if (p.type === "GREEN_BEAN" && p.purchases[0]) {
        const pur = p.purchases[0];
        const wKg = Number(pur.weightKg ?? 0);
        if (wKg > 0) {
          unitCost = (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost ?? 0)) / wKg;
        }
      } else if (p.type === "ROASTED_BEAN") {
        const lastRoast = latestRoastByOutput.get(p.id);

        if (lastRoast && lastRoast.inputProduct.purchases[0]) {
          const pur = lastRoast.inputProduct.purchases[0];
          const wKg = Number(pur.weightKg ?? 0);
          let gbCost = 0;
          if (wKg > 0) gbCost = (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost ?? 0)) / wKg;
          
          const inputW = Number(lastRoast.targetWeightKg);
          const outputW = Number(lastRoast.actualOutputKg);
          if (outputW > 0) {
            unitCost = gbCost * (inputW / outputW);
          } else {
            unitCost = gbCost;
          }
        } else {
          unitCost = 0;
        }
      }

      if (stockKg > 0) {
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
      const stockUnit = p.stockUnit;

      const unitCost = p.productionBatches[0] ? Number(p.productionBatches[0].hppPerUnit) : 0;
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

  // 2. Fetch Packaging
  const packagings = await tp.packaging.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  for (const pkg of packagings) {
    const stockUnit = pkg.stockUnit;

    if (stockUnit > 0) {
      const unitCost = Number(pkg.costPerUnit);
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
  };
}

// =============================================================================
// BALANCE SHEET (NERACA)
// =============================================================================

export type BalanceSheetReport = {
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

export async function getBalanceSheetReport(inventoryValue?: number): Promise<BalanceSheetReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  // Cash & Bank = customer receipts - operating expenses - actual supplier payments.
  const paidInvoices = await tp.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { paidAmount: true }
  });
  const partialInvoices = await tp.invoice.aggregate({
    where: { status: "PARTIAL" },
    _sum: { paidAmount: true }
  });
  const expenses = await tp.expense.aggregate({
    where: { voidAt: null },
    _sum: { amount: true }
  });
  const supplierPayments = await tp.supplierPayment.aggregate({
    where: { voidAt: null },
    _sum: { amount: true }
  });

  const totalInjected = 0;
  const totalWithdrawn = 0;
  const totalDistributed = 0;

  const cashIn = (Number(paidInvoices._sum.paidAmount) || 0) + (Number(partialInvoices._sum.paidAmount) || 0);
  const cashOut = (Number(expenses._sum.amount) || 0) + (Number(supplierPayments._sum.amount) || 0);
  
  // Kas = Uang Masuk Penjualan - Uang Keluar Operasional + Suntikan Modal - Penarikan Prive - Bagi Hasil
  const cashAndBank = cashIn - cashOut + totalInjected - totalWithdrawn - totalDistributed;

  // Accounts Receivable (Piutang)
  const piutangInvoices = await tp.invoice.findMany({
    where: { status: { in: ["ISSUED", "PARTIAL"] } },
    select: { grandTotal: true, paidAmount: true }
  });
  const accountsReceivable = piutangInvoices.reduce((sum, inv) => sum + (Number(inv.grandTotal) - Number(inv.paidAmount)), 0);

  // Inventory
  let inventory = inventoryValue || 0;
  if (inventoryValue === undefined) {
    const inventoryReport = await getInventoryValuationReport();
    inventory = inventoryReport.grandTotalValue;
  }

  const totalAssets = cashAndBank + accountsReceivable + inventory;

  const payablePurchases = await tp.purchase.findMany({
    where: {
      status: "COMPLETED",
      paymentStatus: { in: ["UNPAID", "PARTIAL"] },
    },
    select: { totalCost: true, paidAmount: true, dueDate: true },
  });
  const aging = {
    current: 0,
    overdue1To30: 0,
    overdue31To60: 0,
    overdue61Plus: 0,
  };
  for (const purchase of payablePurchases) {
    const balance = Math.max(0, Number(purchase.totalCost) - Number(purchase.paidAmount));
    const bucket = getPayableAgingBucket(purchase.dueDate);
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
};

export async function getCoffeeFlowReport(): Promise<CoffeeFlowReport> {
  await requireFeature("ADVANCED_REPORTS");
  const tp = await requireTenantPrisma();
  const products = await tp.product.findMany({
    where: { isActive: true },
    include: {
      ledgerEntries: true,
      recipes: true,
      purchases: { where: { status: "COMPLETED" } },
      invoiceItems: { include: { invoice: { select: { status: true } } } },
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

  for (const p of products) {
    if (p.type === "GREEN_BEAN") {
      let bought = 0, roasted = 0, adjOut = 0, stock = 0;
      for (const l of p.ledgerEntries) {
        const qty = Number(l.quantityKg || 0);
        if (l.entryType === "IN") stock += qty; else stock -= qty;
        
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
        
        if (l.refType === "PRODUCTION_FG_IN" && l.entryType === "IN") producedU += qty;
        if (l.refType === "SALE_FG_OUT" && l.entryType === "OUT") soldU += qty;
        if (l.refType === "ADJUSTMENT_OUT" && l.entryType === "OUT") adjOutU += qty;
      }
      
      let salesRevenue = 0;
      for (const inv of p.invoiceItems) {
        if (inv.invoice.status === "PAID" || inv.invoice.status === "PARTIAL" || inv.invoice.status === "ISSUED") {
          salesRevenue += Number(inv.subtotal) - Number(inv.discount || 0);
        }
      }
      const unitCost = p.productionBatches[0] ? Number(p.productionBatches[0].hppPerUnit) : 0;
      const cogs = soldU * unitCost;
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
    where: { status: "COMPLETED" },
    select: { outputProductId: true, inputProductId: true, targetWeightKg: true, actualOutputKg: true }
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

  return { greenBeans, roastedBeans, finishedGoods };
}
