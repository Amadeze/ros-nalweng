"use server";

import { revalidatePath } from "next/cache";
import { getSystemUserId, requireTenantPrisma } from "@/lib/auth";

// =============================================================================
// TYPES
// =============================================================================

export type PiutangRow = {
  id: string;
  code: string;
  customerName: string;
  customerPhone: string | null;
  grandTotal: number;
  paidAmount: number;
  balance: number;
  status: "ISSUED" | "PARTIAL";
  issuedAt: string;
  dueDate: string | null;
  isOverdue: boolean;
  itemSummary: string;
};

export type KpiSummary = {
  totalPiutang: number;
  piutangCount: number;
  overdueCount: number;
  overdueTotal: number;
  revenueMTD: number;
  revenueLastMonth: number;
};

export type KeuanganPageData = {
  piutangRows: PiutangRow[];
  kpi: KpiSummary;
};

export type RecordPaymentInput = {
  invoiceId: string;
  amount: number;
  method: "CASH" | "TRANSFER" | "QRIS" | "CREDIT";
  paidAt: string;
  bankName?: string;
  reference?: string;
  notes?: string;
};

export type PaymentActionResult =
  | { success: true; paymentCode: string; newStatus: string }
  | { success: false; error: string };

export type CreateExpenseInput = {
  date: string;
  category: "UTILITAS" | "OPERASIONAL" | "LAINNYA";
  amount: number;
  description?: string;
};

export type CreateExpenseResult =
  | { success: true; id: string }
  | { success: false; error: string };

export type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
};

export type PurchaseRow = {
  id: string;
  code: string;
  receivedAt: string;
  itemName: string;
  type: string;
  supplierName: string;
  quantity: string;
  totalCost: number;
  createdAt: string;
};

export type PnLReport = {
  month: number;
  year: number;
  grossSales: number;
  invoiceDiscount: number;
  tax: number;
  netSales: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  opexBreakdown: { category: string; amount: number }[];
  revenueBreakdown: { category: string; amount: number }[];
  cogsBreakdown: { category: string; amount: number }[];
  salesVolumeUnits: number;
  topProducts: { name: string; quantity: number; revenue: number }[];
  topCustomers: { name: string; count: number; revenue: number }[];
  previousMonthRevenue?: number;
  previousMonthCogs?: number;
  previousMonthGrossProfit?: number;
  previousMonthOpex?: number;
  previousMonthNetProfit?: number;
};

// =============================================================================
// PAGE DATA
// =============================================================================

export async function getKeuanganPageData(): Promise<KeuanganPageData> {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [piutangInvoices, revenueMTDRaw, revenueLastMonthRaw] = await Promise.all([
    (await requireTenantPrisma()).invoice.findMany({
      where: { status: { in: ["ISSUED", "PARTIAL"] } },
      include: {
        customer: { select: { name: true, phone: true } },
        items: {
          include: { product: { select: { name: true } } },
          take: 3,
          orderBy: { id: "asc" },
        },
      },
    }),
    (await requireTenantPrisma()).invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfMonth } },
      _sum: { grandTotal: true },
    }),
    (await requireTenantPrisma()).invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum: { grandTotal: true },
    }),
  ]);

  const piutangRows: PiutangRow[] = piutangInvoices.map((inv) => {
    const grandTotal = Number(inv.grandTotal);
    const paidAmount = Number(inv.paidAmount);
    const balance = grandTotal - paidAmount;
    const isOverdue = inv.dueDate ? inv.dueDate < now : false;
    const shown = inv.items.slice(0, 2);
    const rest  = inv.items.length - shown.length;
    const itemSummary =
      shown.map((i) => `${i.product.name} x${i.quantity}`).join(", ") +
      (rest > 0 ? ` +${rest} lainnya` : "");
    return {
      id: inv.id,
      code: inv.code,
      customerName: inv.customer.name,
      customerPhone: inv.customer.phone,
      grandTotal,
      paidAmount,
      balance,
      status: inv.status as "ISSUED" | "PARTIAL",
      issuedAt: inv.issuedAt.toISOString(),
      dueDate: inv.dueDate ? inv.dueDate.toISOString() : null,
      isOverdue,
      itemSummary,
    };
  });

  // Sort: overdue rows first, then by due date ascending
  piutangRows.sort((a, b) => {
    if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;
    if (!a.dueDate && !b.dueDate) return 0;
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });

  const totalPiutang = piutangRows.reduce((s, r) => s + r.balance, 0);
  const overdueCount = piutangRows.filter((r) => r.isOverdue).length;
  const overdueTotal = piutangRows.filter((r) => r.isOverdue).reduce((s, r) => s + r.balance, 0);

  return {
    piutangRows,
    kpi: {
      totalPiutang,
      piutangCount: piutangRows.length,
      overdueCount,
      overdueTotal,
      revenueMTD: Number(revenueMTDRaw._sum.grandTotal ?? 0),
      revenueLastMonth: Number(revenueLastMonthRaw._sum.grandTotal ?? 0),
    },
  };
}

// =============================================================================
// RECORD PAYMENT
// =============================================================================

export async function recordPayment(input: RecordPaymentInput): Promise<PaymentActionResult> {
  try {
    const userId = await getSystemUserId();
    const inv = await (await requireTenantPrisma()).invoice.findUnique({
      where: { id: input.invoiceId },
      select: { id: true, code: true, grandTotal: true, paidAmount: true, status: true },
    });
    if (!inv) return { success: false, error: "Nota tidak ditemukan." };
    if (inv.status === "PAID")  return { success: false, error: "Nota ini sudah lunas." };
    if (inv.status === "VOID")  return { success: false, error: "Nota ini sudah di-void." };
    const grandTotal   = Number(inv.grandTotal);
    const prevPaid     = Number(inv.paidAmount);
    const newPaidTotal = prevPaid + input.amount;
    if (input.amount <= 0) return { success: false, error: "Nominal harus lebih dari 0." };
    if (newPaidTotal > grandTotal + 0.01) {
      return { success: false, error: `Nominal melebihi sisa tagihan. Sisa: Rp ${(grandTotal - prevPaid).toLocaleString("id-ID")}` };
    }
    const newStatus: "PAID" | "PARTIAL" = newPaidTotal >= grandTotal - 0.01 ? "PAID" : "PARTIAL";
    const paidAt = new Date(input.paidAt + "T00:00:00");
    const prefix = `PAY-${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}`;
    const count  = await (await requireTenantPrisma()).payment.count({ where: { code: { startsWith: prefix } } });
    const payCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
    const refParts = [input.bankName, input.reference].filter(Boolean);
    const refString = refParts.length > 0 ? refParts.join(" / ") : undefined;
    await (await requireTenantPrisma()).$transaction(async (tx) => {
      await tx.payment.create({
        data: { code: payCode, invoiceId: inv.id, amount: input.amount, method: input.method, reference: refString, paidAt, notes: input.notes, createdById: userId },
      });
      await tx.invoice.update({ where: { id: inv.id }, data: { paidAmount: newPaidTotal, status: newStatus } });
    });
    revalidatePath("/keuangan");
    revalidatePath("/penjualan");
    return { success: true, paymentCode: payCode, newStatus };
  } catch (err) {
    console.error("[recordPayment]", err);
    return { success: false, error: "Gagal mencatat pembayaran. Coba lagi." };
  }
}

// =============================================================================
// CREATE EXPENSE
// =============================================================================

export async function createExpense(input: CreateExpenseInput): Promise<CreateExpenseResult> {
  try {
    const userId = await getSystemUserId();
    if (input.amount <= 0) return { success: false, error: "Nominal harus lebih dari 0." };
    const expense = await (await requireTenantPrisma()).expense.create({
      data: { date: new Date(input.date + "T00:00:00"), category: input.category, amount: input.amount, description: input.description || null, createdById: userId },
    });
    revalidatePath("/keuangan");
    revalidatePath("/laporan");
    return { success: true, id: expense.id };
  } catch (err) {
    console.error("[createExpense]", err);
    return { success: false, error: "Gagal mencatat pengeluaran. Coba lagi." };
  }
}

// =============================================================================
// P&L REPORT
// =============================================================================

export async function getPnLReport(month: number, year: number): Promise<PnLReport> {
  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999);

  let prevMonth = month - 1;
  let prevYear  = year;
  if (prevMonth < 1) {
    prevMonth = 12;
    prevYear -= 1;
  }
  const prevStartDate = new Date(prevYear, prevMonth - 1, 1);
  const prevEndDate   = new Date(prevYear, prevMonth, 0, 23, 59, 59, 999);

  const [invoices, expenses, prevInvoices, prevExpenses] = await Promise.all([
    (await requireTenantPrisma()).invoice.findMany({
      where: { status: { in: ["PAID", "PARTIAL", "ISSUED"] }, issuedAt: { gte: startDate, lte: endDate } },
      select: { subtotal: true, discount: true, tax: true, customer: { select: { name: true } }, items: { select: { quantity: true, hpp: true, unitPrice: true, discount: true, product: { select: { type: true, name: true } } } } },
    }),
    (await requireTenantPrisma()).expense.findMany({ where: { date: { gte: startDate, lte: endDate } }, select: { category: true, amount: true } }),
    (await requireTenantPrisma()).invoice.findMany({
      where: { status: { in: ["PAID", "PARTIAL", "ISSUED"] }, issuedAt: { gte: prevStartDate, lte: prevEndDate } },
      select: { subtotal: true, discount: true, tax: true, customer: { select: { name: true } }, items: { select: { quantity: true, hpp: true, unitPrice: true, discount: true, product: { select: { type: true, name: true } } } } },
    }),
    (await requireTenantPrisma()).expense.findMany({ where: { date: { gte: prevStartDate, lte: prevEndDate } }, select: { category: true, amount: true } }),
  ]);

  // ==========================================
  // MATERIAL LOSSES / GAINS (ABNORMAL SHRINKAGE / OPNAME)
  // ==========================================
  const adjustments = await (await requireTenantPrisma()).inventoryLedger.findMany({
    where: { refType: { in: ["ADJUSTMENT_IN", "ADJUSTMENT_OUT"] }, createdAt: { gte: startDate, lte: endDate } },
    include: { product: { include: { purchases: { where: { status: "COMPLETED" }, orderBy: { receivedAt: "desc" }, take: 1 }, productionBatches: { where: { status: "COMPLETED" }, orderBy: { producedAt: "desc" }, take: 1 } } }, packaging: true }
  });

  let totalAdjustmentOutValue = 0;
  let totalAdjustmentInValue = 0;

  for (const adj of adjustments) {
    let unitCost = 0;
    if (adj.packaging) {
      unitCost = Number(adj.packaging.costPerUnit);
    } else if (adj.product) {
      if (adj.product.type === "GREEN_BEAN" && adj.product.purchases?.[0]) {
        const pur = adj.product.purchases[0];
        const wKg = Number(pur.weightKg);
        unitCost = wKg > 0 ? (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost || 0)) / wKg : 0;
      } else if (adj.product.type === "FINISHED_GOODS" && adj.product.productionBatches?.[0]) {
        unitCost = Number(adj.product.productionBatches[0].hppPerUnit);
      } else if (adj.product.type === "ROASTED_BEAN") {
        const lastRoast = await (await requireTenantPrisma()).roastingBatch.findFirst({
          where: { outputProductId: adj.productId as string, status: "COMPLETED" },
          orderBy: { roastedAt: "desc" },
          include: { inputProduct: { include: { purchases: { where: { status: "COMPLETED" }, orderBy: { receivedAt: "desc" }, take: 1 } } } }
        });
        if (lastRoast && lastRoast.inputProduct?.purchases?.[0]) {
          const pur = lastRoast.inputProduct.purchases[0];
          const wKg = Number(pur.weightKg);
          const gbCost = wKg > 0 ? (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost || 0)) / wKg : 0;
          const outW = Number(lastRoast.outputWeightKg);
          unitCost = outW > 0 ? gbCost * (Number(lastRoast.inputWeightKg) / outW) : gbCost;
        }
      }
    }
    const qty = Number(adj.quantityKg || adj.quantityUnit || 0);
    const value = qty * unitCost;
    if (adj.refType === "ADJUSTMENT_OUT") totalAdjustmentOutValue += value;
    if (adj.refType === "ADJUSTMENT_IN") totalAdjustmentInValue += value;
  }

  const grossSales      = invoices.reduce((s, inv) => s + Number(inv.subtotal), 0);
  const invoiceDiscount = invoices.reduce((s, inv) => s + Number(inv.discount), 0);
  const tax             = invoices.reduce((s, inv) => s + Number(inv.tax), 0);
  const netSales        = grossSales - invoiceDiscount;
  let revenue           = netSales;
  const revenueMap: Record<string, number> = {};
  const cogsMap: Record<string, number> = {};
  const productMap: Record<string, { quantity: number; revenue: number }> = {};
  const customerMap: Record<string, { count: number; revenue: number }> = {};
  let salesVolumeUnits = 0;

  const cogs = invoices.reduce((sum, inv) => {
    const invRevenue = Number(inv.subtotal) - Number(inv.discount);
    if (inv.customer && inv.customer.name && inv.customer.name.trim().toLowerCase() !== "umum") {
      const cName = inv.customer.name.trim();
      if (!customerMap[cName]) customerMap[cName] = { count: 0, revenue: 0 };
      customerMap[cName].count += 1;
      customerMap[cName].revenue += invRevenue;
    }

    return sum + inv.items.reduce((itemSum, item) => {
      const type = item.product?.type || "LAINNYA";
      const pName = item.product?.name || "Produk Tidak Dikenal";
      const itemCogs = Number(item.hpp) * item.quantity;
      cogsMap[type] = (cogsMap[type] ?? 0) + itemCogs;

      const itemRev = (Number(item.unitPrice) - Number(item.discount)) * item.quantity;
      revenueMap[type] = (revenueMap[type] ?? 0) + itemRev;
      
      salesVolumeUnits += item.quantity;

      if (!productMap[pName]) productMap[pName] = { quantity: 0, revenue: 0 };
      productMap[pName].quantity += item.quantity;
      productMap[pName].revenue += itemRev;

      return itemSum + itemCogs;
    }, 0);
  }, 0);

  if (totalAdjustmentInValue > 0) {
    revenueMap["PENDAPATAN_LAINNYA"] = (revenueMap["PENDAPATAN_LAINNYA"] ?? 0) + totalAdjustmentInValue;
  }
  const revenueBreakdown = Object.entries(revenueMap).map(([category, amount]) => ({ category, amount }));
  revenue = revenueBreakdown.reduce((s, e) => s + e.amount, 0);

  const cogsBreakdown = Object.entries(cogsMap).map(([category, amount]) => ({ category, amount }));
  
  const topProducts = Object.entries(productMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
    
  const topCustomers = Object.entries(customerMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  const grossProfit = revenue - cogs;
  
  const opexMap: Record<string, number> = {};
  for (const e of expenses) { opexMap[e.category] = (opexMap[e.category] ?? 0) + Number(e.amount); }
  
  if (totalAdjustmentOutValue > 0) {
    opexMap["KERUGIAN_MATERIAL"] = (opexMap["KERUGIAN_MATERIAL"] ?? 0) + totalAdjustmentOutValue;
  }
  
  const opexBreakdown = Object.entries(opexMap).map(([category, amount]) => ({ category, amount }));
  const opex = opexBreakdown.reduce((s, e) => s + e.amount, 0);
  
  const netProfit = grossProfit - opex;

  const prevGrossSales = prevInvoices.reduce((s, inv) => s + Number(inv.subtotal), 0);
  const prevDiscount   = prevInvoices.reduce((s, inv) => s + Number(inv.discount), 0);
  const prevRevenue    = prevGrossSales - prevDiscount;
  const prevCogs       = prevInvoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + Number(item.hpp) * item.quantity, 0), 0);
  const prevGrossProfit = prevRevenue - prevCogs;
  const prevOpex       = prevExpenses.reduce((s, e) => s + Number(e.amount), 0);
  const prevNetProfit  = prevGrossProfit - prevOpex;

  return { 
    month, year, grossSales, invoiceDiscount, tax, netSales, revenue, cogs, grossProfit, opex, netProfit, 
    opexBreakdown, revenueBreakdown, cogsBreakdown, salesVolumeUnits, topProducts, topCustomers,
    previousMonthRevenue: prevRevenue,
    previousMonthCogs: prevCogs,
    previousMonthGrossProfit: prevGrossProfit,
    previousMonthOpex: prevOpex,
    previousMonthNetProfit: prevNetProfit,
  };
}

// =============================================================================
// GET EXPENSE HISTORY
// =============================================================================

export async function getExpenseHistory(): Promise<ExpenseRow[]> {
  const expenses = await (await requireTenantPrisma()).expense.findMany({
    orderBy: { date: "desc" },
    take: 200,
    select: { id: true, date: true, category: true, amount: true, description: true, createdAt: true },
  });
  return expenses.map((e) => ({ id: e.id, date: e.date.toISOString(), category: e.category, amount: Number(e.amount), description: e.description, createdAt: e.createdAt.toISOString() }));
}

// =============================================================================
// GET PURCHASE HISTORY
// =============================================================================

export async function getPurchaseHistory(): Promise<PurchaseRow[]> {
  const purchases = await (await requireTenantPrisma()).purchase.findMany({
    where: { status: "COMPLETED" },
    orderBy: { receivedAt: "desc" },
    take: 200,
    include: {
      product: { select: { name: true } },
      packaging: { select: { name: true } },
      supplier: { select: { name: true } }
    }
  });

  return purchases.map((p) => {
    let itemName = "Tidak diketahui";
    let quantity = "-";
    if (p.type === "GREEN_BEAN" && p.product) {
      itemName = p.product.name;
      quantity = `${Number(p.weightKg)} kg`;
    } else if (p.type === "PACKAGING" && p.packaging) {
      itemName = p.packaging.name;
      quantity = `${Number(p.quantityUnits)} unit`;
    }

    return {
      id: p.id,
      code: p.code,
      receivedAt: p.receivedAt.toISOString(),
      itemName,
      type: p.type,
      supplierName: p.supplier?.name || "Supplier Umum",
      quantity,
      totalCost: Number(p.totalCost),
      createdAt: p.createdAt.toISOString()
    };
  });
}
