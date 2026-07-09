"use server";

import { prisma } from "@/lib/prisma";

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
};

export async function getInventoryValuationReport(): Promise<InventoryValuationReport> {
  // 1. Fetch GB and RB
  const products = await prisma.product.findMany({
    where: { isActive: true },
    include: {
      ledgerEntries: { select: { entryType: true, quantityKg: true, quantityUnit: true } },
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

  const items: ValuationRow[] = [];

  for (const p of products) {
    if (p.type === "GREEN_BEAN" || p.type === "ROASTED_BEAN") {
      const stockKg = p.ledgerEntries.reduce((sum, e) => {
        const qty = Number(e.quantityKg ?? 0);
        return e.entryType === "IN" ? sum + qty : sum - qty;
      }, 0);

      let unitCost = 0;
      if (p.type === "GREEN_BEAN" && p.purchases[0]) {
        const pur = p.purchases[0];
        const wKg = Number(pur.weightKg ?? 0);
        if (wKg > 0) {
          unitCost = (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost ?? 0)) / wKg;
        }
      } else if (p.type === "ROASTED_BEAN") {
        // Asumsi nilai RB = nilai GB + ongkos (kalau tidak ada perhitungan batch yang eksplisit menyimpan nilai aset)
        // Kita set 0 atau kita bisa hitung average dari production.
        // Di sini saya asumsikan 0 untuk simplifikasi, karena RB cost biasanya dari HPP blending.
        unitCost = 0;
      }

      if (stockKg > 0) {
        items.push({
          id: p.id,
          code: p.code,
          name: p.name,
          category: p.type as "GREEN_BEAN" | "ROASTED_BEAN",
          stock: stockKg,
          unit: "kg",
          unitCost,
          totalValue: stockKg * unitCost,
        });
      }
    } else if (p.type === "FINISHED_GOODS") {
      const stockUnit = p.ledgerEntries.reduce((sum, e) => {
        const qty = Number(e.quantityUnit ?? 0);
        return e.entryType === "IN" ? sum + qty : sum - qty;
      }, 0);

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
  const packagings = await prisma.packaging.findMany({
    where: { isActive: true },
    include: {
      ledgerEntries: { select: { entryType: true, quantityUnit: true } },
    },
    orderBy: { name: "asc" },
  });

  for (const pkg of packagings) {
    const stockUnit = pkg.ledgerEntries.reduce((sum, e) => {
      const qty = e.quantityUnit ?? 0;
      return e.entryType === "IN" ? sum + qty : sum - qty;
    }, 0);

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

  return {
    items,
    totalGreenBeanValue,
    totalRoastedBeanValue,
    totalFinishedGoodsValue,
    totalPackagingValue,
    grandTotalValue,
    totalFinishedGoodsPotentialRevenue,
    totalFinishedGoodsMarginHealth,
  };
}
