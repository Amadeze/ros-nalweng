"use server";

import { prisma } from "@/lib/prisma";
import { getPnLReport } from "../keuangan/actions";
import { getSystemUserId } from "@/lib/auth";
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
  };
  equity: {
    retainedEarnings: number; 
    totalEquity: number;
  };
};

export async function getBalanceSheetReport(inventoryValue?: number): Promise<BalanceSheetReport> {
  // Cash & Bank (Kas) = Total Paid Invoices - Total Expenses - Total Completed Purchases
  const paidInvoices = await prisma.invoice.aggregate({
    where: { status: "PAID" },
    _sum: { paidAmount: true }
  });
  const partialInvoices = await prisma.invoice.aggregate({
    where: { status: "PARTIAL" },
    _sum: { paidAmount: true }
  });
  const expenses = await prisma.expense.aggregate({
    _sum: { amount: true }
  });
  const purchases = await prisma.purchase.aggregate({
    where: { status: "COMPLETED" },
    _sum: { totalCost: true }
  });

  const capitalInjections = await prisma.capitalTransaction.aggregate({
    where: { type: "INJECTION" },
    _sum: { amount: true }
  });
  const capitalWithdrawals = await prisma.capitalTransaction.aggregate({
    where: { type: "WITHDRAWAL" },
    _sum: { amount: true }
  });
  const profitDistributions = await prisma.profitDistribution.aggregate({
    _sum: { amount: true }
  });

  const totalInjected = Number(capitalInjections._sum.amount || 0);
  const totalWithdrawn = Number(capitalWithdrawals._sum.amount || 0);
  const totalDistributed = Number(profitDistributions._sum.amount || 0);

  const cashIn = (Number(paidInvoices._sum.paidAmount) || 0) + (Number(partialInvoices._sum.paidAmount) || 0);
  const cashOut = (Number(expenses._sum.amount) || 0) + (Number(purchases._sum.totalCost) || 0);
  
  // Kas = Uang Masuk Penjualan - Uang Keluar Operasional + Suntikan Modal - Penarikan Prive - Bagi Hasil
  const cashAndBank = cashIn - cashOut + totalInjected - totalWithdrawn - totalDistributed;

  // Accounts Receivable (Piutang)
  const piutangInvoices = await prisma.invoice.findMany({
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

  // Liabilities (Not tracked in current system, all purchases assumed paid in cash)
  const accountsPayable = 0; 
  const totalLiabilities = accountsPayable;

  // Equity
  const totalEquity = totalAssets - totalLiabilities;
  const retainedEarnings = totalEquity;

  return {
    assets: {
      cashAndBank,
      accountsReceivable,
      inventory,
      totalAssets
    },
    liabilities: {
      accountsPayable,
      totalLiabilities
    },
    equity: {
      retainedEarnings,
      totalEquity
    }
  };
}

// =============================================================================
// FOUNDER SALARY & DIVIDENDS
// =============================================================================

export async function calculateFounderSalary(month: number, year: number) {
  const pnl = await getPnLReport(month, year);
  const currentNetProfit = pnl.netProfit;

  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999);
  
  const existingSalaries = await prisma.expense.findMany({
    where: {
      category: "GAJI",
      description: { startsWith: "Gaji bulanan untuk" },
      date: { gte: startDate, lte: endDate }
    }
  });
  
  const existingSalaryAmount = existingSalaries.reduce((sum, e) => sum + Number(e.amount), 0);
  const profitBeforeSalary = currentNetProfit + existingSalaryAmount;

  if (profitBeforeSalary <= 0) {
    return { success: false, error: "Laba bersih (sebelum gaji) tidak mencukupi." };
  }

  // 2. Calculate Salary Pool
  let salaryPool = profitBeforeSalary * 0.40;
  if (salaryPool > 15000000) {
    salaryPool = 15000000;
  }

  const salaryPerPerson = salaryPool / 3;

  return { success: true, salaryPerPerson, salaryPool };
}

export async function postFounderSalary(month: number, year: number, salaryPerPerson: number) {
  const userId = await getSystemUserId();
  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999);

  const existingSalaries = await prisma.expense.findMany({
    where: {
      category: "GAJI",
      description: { startsWith: "Gaji bulanan untuk" },
      date: { gte: startDate, lte: endDate }
    }
  });

  if (existingSalaries.length > 0) {
    await prisma.expense.deleteMany({
      where: {
        id: { in: existingSalaries.map(e => e.id) }
      }
    });
  }

  const dateToPost = new Date();
  if (month !== dateToPost.getMonth() + 1 || year !== dateToPost.getFullYear()) {
    dateToPost.setTime(endDate.getTime());
  }

  const salaries = [
    { name: "Anda (Investor)" },
    { name: "Reza" },
    { name: "Theo" }
  ];

  for (const person of salaries) {
    await prisma.expense.create({
      data: {
        date: dateToPost,
        category: "GAJI",
        amount: salaryPerPerson,
        description: `Gaji bulanan untuk ${person.name} (${month}/${year})`,
        createdById: userId
      }
    });
  }

  revalidatePath("/laporan");
  revalidatePath("/keuangan");

  return { success: true };
}

export async function distributeDividends(amount: number) {
  if (amount <= 0) {
    return { success: false, error: "Nominal harus lebih besar dari 0" };
  }

  // Record a capital withdrawal (Prive) named as Dividen
  await prisma.capitalTransaction.create({
    data: {
      code: `DIV-${Date.now()}`,
      type: "WITHDRAWAL",
      amount: amount,
      notes: "Pencairan Tabungan Profit (Dividen) dibagi 3",
    }
  });

  revalidatePath("/laporan");
  return { success: true };
}
