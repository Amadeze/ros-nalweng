"use server";

import { revalidatePath } from "next/cache";
import { getCurrentTenantId, getSystemUserId, requireRole, requireTenantPrisma } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { randomBytes } from "crypto";
import { appendLedger } from "@/lib/stock";
import { getPurchasePaymentStatus } from "@/lib/purchase-payments";

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
  paidAmount: number;
  balance: number;
  paymentStatus: "UNPAID" | "PARTIAL" | "PAID";
  dueDate: string | null;
  isOverdue: boolean;
  createdAt: string;
};

export type SupplierPaymentRow = {
  id: string;
  code: string;
  purchaseCode: string;
  supplierName: string;
  amount: number;
  method: string;
  paidAt: string;
  reference: string | null;
};

export type PaymentRow = {
  id: string;
  code: string;
  invoiceCode: string;
  customerName: string;
  amount: number;
  method: string;
  paidAt: string;
  reference: string | null;
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
    await requireRole("OWNER", "MANAGER", "CASHIER");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    if (input.amount <= 0) return { success: false, error: "Nominal harus lebih dari 0." };
    const paidAt = new Date(input.paidAt + "T00:00:00");
    if (Number.isNaN(paidAt.getTime())) {
      return { success: false, error: "Tanggal pembayaran tidak valid." };
    }
    const prefix = `PAY-${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}`;
    const payCode = `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const refParts = [input.bankName, input.reference].filter(Boolean);
    const refString = refParts.length > 0 ? refParts.join(" / ") : undefined;
    const tenantPrisma = await requireTenantPrisma();
    const result = await tenantPrisma.$transaction(async (tx) => {
      const inv = await tx.invoice.findUnique({
        where: { id: input.invoiceId },
        select: { id: true, code: true, grandTotal: true, paidAmount: true, status: true },
      });
      if (!inv) throw new Error("Nota tidak ditemukan.");
      if (inv.status === "PAID") throw new Error("Nota ini sudah lunas.");
      if (inv.status === "VOID") throw new Error("Nota ini sudah di-void.");

      const grandTotal = Number(inv.grandTotal);
      const prevPaid = Number(inv.paidAmount);
      const newPaidTotal = prevPaid + input.amount;
      if (newPaidTotal > grandTotal + 0.01) {
        throw new Error(`Nominal melebihi sisa tagihan. Sisa: Rp ${(grandTotal - prevPaid).toLocaleString("id-ID")}`);
      }
      const newStatus: "PAID" | "PARTIAL" =
        newPaidTotal >= grandTotal - 0.01 ? "PAID" : "PARTIAL";

      const payment = await tx.payment.create({
        data: { code: payCode, invoiceId: inv.id, amount: input.amount, method: input.method, reference: refString, paidAt, notes: input.notes, createdById: userId },
      });
      await tx.invoice.update({ where: { id: inv.id }, data: { paidAmount: newPaidTotal, status: newStatus } });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "Payment",
        entityId: payment.id,
        after: {
          code: payment.code,
          invoiceId: inv.id,
          amount: Number(payment.amount),
          method: payment.method,
        },
      });
      return { newStatus };
    }, { isolationLevel: "Serializable" });
    revalidatePath("/keuangan");
    revalidatePath("/penjualan");
    return { success: true, paymentCode: payCode, newStatus: result.newStatus };
  } catch (err) {
    console.error("[recordPayment]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal mencatat pembayaran. Coba lagi.",
    };
  }
}

// =============================================================================
// CREATE EXPENSE
// =============================================================================

export async function createExpense(input: CreateExpenseInput): Promise<CreateExpenseResult> {
  try {
    await requireRole("OWNER", "MANAGER");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    if (input.amount <= 0) return { success: false, error: "Nominal harus lebih dari 0." };
    const expense = await (await requireTenantPrisma()).$transaction(async (tx) => {
      const created = await tx.expense.create({
        data: { date: new Date(input.date + "T00:00:00"), category: input.category, amount: input.amount, description: input.description || null, createdById: userId },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "Expense",
        entityId: created.id,
        after: {
          date: created.date,
          category: created.category,
          amount: Number(created.amount),
          description: created.description,
        },
      });
      return created;
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
  if (
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12 ||
    !Number.isInteger(year) ||
    year < 2000 ||
    year > 2100
  ) {
    throw new Error("Periode laporan tidak valid.");
  }
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
    (await requireTenantPrisma()).expense.findMany({ where: { voidAt: null, date: { gte: startDate, lte: endDate } }, select: { category: true, amount: true } }),
    (await requireTenantPrisma()).invoice.findMany({
      where: { status: { in: ["PAID", "PARTIAL", "ISSUED"] }, issuedAt: { gte: prevStartDate, lte: prevEndDate } },
      select: { subtotal: true, discount: true, tax: true, customer: { select: { name: true } }, items: { select: { quantity: true, hpp: true, unitPrice: true, discount: true, product: { select: { type: true, name: true } } } } },
    }),
    (await requireTenantPrisma()).expense.findMany({ where: { voidAt: null, date: { gte: prevStartDate, lte: prevEndDate } }, select: { category: true, amount: true } }),
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
        const lastRoast = await (await requireTenantPrisma()).parentRoastingBatch.findFirst({
          where: { outputProductId: adj.productId as string, status: "COMPLETED" },
          orderBy: { createdAt: "desc" },
          include: { inputProduct: { include: { purchases: { where: { status: "COMPLETED" }, orderBy: { receivedAt: "desc" }, take: 1 } } } }
        });
        if (lastRoast && lastRoast.inputProduct?.purchases?.[0]) {
          const pur = lastRoast.inputProduct.purchases[0];
          const wKg = Number(pur.weightKg);
          const gbCost = wKg > 0 ? (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost || 0)) / wKg : 0;
          const outW = Number(lastRoast.actualOutputKg);
          unitCost = outW > 0 ? gbCost * (Number(lastRoast.targetWeightKg) / outW) : gbCost;
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
    where: { voidAt: null },
    orderBy: { date: "desc" },
    take: 200,
    select: { id: true, date: true, category: true, amount: true, description: true, createdAt: true },
  });
  return expenses.map((e) => ({ id: e.id, date: e.date.toISOString(), category: e.category, amount: Number(e.amount), description: e.description, createdAt: e.createdAt.toISOString() }));
}

export async function voidExpense(expenseId: string, reason: string) {
  try {
    await requireRole("OWNER", "MANAGER");
    if (!reason.trim()) return { success: false, error: "Alasan void wajib diisi." };
    const tenantId = await getCurrentTenantId();
    const userId = await getSystemUserId();
    const tenantPrisma = await requireTenantPrisma();
    await tenantPrisma.$transaction(async (tx) => {
      const expense = await tx.expense.findUnique({ where: { id: expenseId } });
      if (!expense) throw new Error("Pengeluaran tidak ditemukan.");
      if (expense.voidAt) throw new Error("Pengeluaran sudah di-void.");
      await tx.expense.update({
        where: { id: expense.id },
        data: { voidReason: reason.trim(), voidAt: new Date() },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "VOID",
        entityType: "Expense",
        entityId: expense.id,
        before: {
          date: expense.date,
          category: expense.category,
          amount: Number(expense.amount),
        },
        after: { voidAt: new Date(), reason: reason.trim() },
      });
    }, { isolationLevel: "Serializable" });
    revalidatePath("/keuangan");
    revalidatePath("/laporan");
    return { success: true };
  } catch (error) {
    console.error("[voidExpense]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal melakukan void pengeluaran.",
    };
  }
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
      paidAmount: Number(p.paidAmount),
      balance: Math.max(0, Number(p.totalCost) - Number(p.paidAmount)),
      paymentStatus: p.paymentStatus,
      dueDate: p.dueDate?.toISOString() ?? null,
      isOverdue: p.paymentStatus !== "PAID" && Boolean(p.dueDate && p.dueDate < new Date()),
      createdAt: p.createdAt.toISOString()
    };
  });
}

export async function getSupplierPaymentHistory(): Promise<SupplierPaymentRow[]> {
  const payments = await (await requireTenantPrisma()).supplierPayment.findMany({
    where: { voidAt: null },
    orderBy: { paidAt: "desc" },
    take: 200,
    include: {
      purchase: {
        select: {
          code: true,
          supplier: { select: { name: true } },
        },
      },
    },
  });

  return payments.map((payment) => ({
    id: payment.id,
    code: payment.code,
    purchaseCode: payment.purchase.code,
    supplierName: payment.purchase.supplier.name,
    amount: Number(payment.amount),
    method: payment.method,
    paidAt: payment.paidAt.toISOString(),
    reference: payment.reference,
  }));
}

export type RecordSupplierPaymentInput = {
  purchaseId: string;
  amount: number;
  method: "CASH" | "TRANSFER" | "QRIS";
  paidAt: string;
  reference?: string;
  notes?: string;
};

export async function recordSupplierPayment(input: RecordSupplierPaymentInput) {
  try {
    await requireRole("OWNER", "MANAGER", "CASHIER");
    if (!Number.isFinite(input.amount) || input.amount <= 0) {
      return { success: false, error: "Nominal harus lebih dari 0." };
    }
    const paidAt = new Date(`${input.paidAt}T00:00:00`);
    if (Number.isNaN(paidAt.getTime())) {
      return { success: false, error: "Tanggal pembayaran tidak valid." };
    }

    const tenantId = await getCurrentTenantId();
    const userId = await getSystemUserId();
    const prefix = `SPAY-${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}`;
    const paymentCode = `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
    const tenantPrisma = await requireTenantPrisma();

    const result = await tenantPrisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({
        where: { id: input.purchaseId },
        select: {
          id: true,
          code: true,
          status: true,
          paymentStatus: true,
          totalCost: true,
          paidAmount: true,
        },
      });
      if (!purchase) throw new Error("Pembelian tidak ditemukan.");
      if (purchase.status !== "COMPLETED") {
        throw new Error("Pembayaran hanya dapat dicatat untuk pembelian aktif.");
      }
      if (purchase.paymentStatus === "PAID") throw new Error("Pembelian ini sudah lunas.");

      const totalCost = Number(purchase.totalCost);
      const previousPaid = Number(purchase.paidAmount);
      const newPaidAmount = previousPaid + input.amount;
      if (newPaidAmount > totalCost + 0.01) {
        throw new Error(`Nominal melebihi sisa hutang. Sisa: Rp ${(totalCost - previousPaid).toLocaleString("id-ID")}`);
      }
      const paymentStatus = getPurchasePaymentStatus(newPaidAmount, totalCost);

      const payment = await tx.supplierPayment.create({
        data: {
          code: paymentCode,
          purchaseId: purchase.id,
          amount: input.amount,
          method: input.method,
          reference: input.reference?.trim() || null,
          paidAt,
          notes: input.notes?.trim() || null,
          createdById: userId,
        },
      });
      await tx.purchase.update({
        where: { id: purchase.id },
        data: { paidAmount: newPaidAmount, paymentStatus },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "SupplierPayment",
        entityId: payment.id,
        after: {
          code: payment.code,
          purchaseId: purchase.id,
          amount: Number(payment.amount),
          paymentStatus,
        },
      });
      return { paymentStatus };
    }, { isolationLevel: "Serializable" });

    revalidatePath("/keuangan");
    revalidatePath("/laporan");
    return { success: true, paymentCode, paymentStatus: result.paymentStatus };
  } catch (error) {
    console.error("[recordSupplierPayment]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal mencatat pembayaran supplier.",
    };
  }
}

export async function voidSupplierPayment(paymentId: string, reason: string) {
  try {
    await requireRole("OWNER", "MANAGER");
    if (!reason.trim()) return { success: false, error: "Alasan void wajib diisi." };
    const tenantId = await getCurrentTenantId();
    const userId = await getSystemUserId();
    const tenantPrisma = await requireTenantPrisma();

    await tenantPrisma.$transaction(async (tx) => {
      const payment = await tx.supplierPayment.findUnique({
        where: { id: paymentId },
        include: { purchase: true },
      });
      if (!payment) throw new Error("Pembayaran supplier tidak ditemukan.");
      if (payment.voidAt) throw new Error("Pembayaran supplier sudah di-void.");
      if (payment.purchase.status !== "COMPLETED") {
        throw new Error("Pembayaran pada pembelian nonaktif tidak dapat diubah.");
      }

      const newPaidAmount = Math.max(
        0,
        Number(payment.purchase.paidAmount) - Number(payment.amount),
      );
      const paymentStatus = getPurchasePaymentStatus(
        newPaidAmount,
        Number(payment.purchase.totalCost),
      );
      await tx.supplierPayment.update({
        where: { id: payment.id },
        data: { voidReason: reason.trim(), voidAt: new Date() },
      });
      await tx.purchase.update({
        where: { id: payment.purchaseId },
        data: { paidAmount: newPaidAmount, paymentStatus },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "VOID",
        entityType: "SupplierPayment",
        entityId: payment.id,
        before: {
          amount: Number(payment.amount),
          purchasePaidAmount: Number(payment.purchase.paidAmount),
          purchasePaymentStatus: payment.purchase.paymentStatus,
        },
        after: {
          reason: reason.trim(),
          purchasePaidAmount: newPaidAmount,
          purchasePaymentStatus: paymentStatus,
        },
      });
    }, { isolationLevel: "Serializable" });

    revalidatePath("/keuangan");
    revalidatePath("/laporan");
    return { success: true };
  } catch (error) {
    console.error("[voidSupplierPayment]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal melakukan void pembayaran supplier.",
    };
  }
}

export async function getPaymentHistory(): Promise<PaymentRow[]> {
  const payments = await (await requireTenantPrisma()).payment.findMany({
    where: { voidAt: null },
    orderBy: { paidAt: "desc" },
    take: 200,
    include: {
      invoice: {
        select: {
          code: true,
          customer: { select: { name: true } },
        },
      },
    },
  });
  return payments.map((payment) => ({
    id: payment.id,
    code: payment.code,
    invoiceCode: payment.invoice.code,
    customerName: payment.invoice.customer.name,
    amount: Number(payment.amount),
    method: payment.method,
    paidAt: payment.paidAt.toISOString(),
    reference: payment.reference,
  }));
}

export async function voidPayment(paymentId: string, reason: string) {
  try {
    await requireRole("OWNER", "MANAGER");
    if (!reason.trim()) return { success: false, error: "Alasan void wajib diisi." };
    const tenantId = await getCurrentTenantId();
    const userId = await getSystemUserId();
    const tenantPrisma = await requireTenantPrisma();

    await tenantPrisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: { id: paymentId },
        include: { invoice: true },
      });
      if (!payment) throw new Error("Pembayaran tidak ditemukan.");
      if (payment.voidAt) throw new Error("Pembayaran sudah di-void.");
      if (payment.invoice.status === "VOID") {
        throw new Error("Pembayaran pada invoice void tidak dapat diubah.");
      }

      const newPaidAmount = Math.max(
        0,
        Number(payment.invoice.paidAmount) - Number(payment.amount),
      );
      const newStatus: "ISSUED" | "PARTIAL" =
        newPaidAmount <= 0.01 ? "ISSUED" : "PARTIAL";
      await tx.payment.update({
        where: { id: payment.id },
        data: { voidReason: reason.trim(), voidAt: new Date() },
      });
      await tx.invoice.update({
        where: { id: payment.invoiceId },
        data: { paidAmount: newPaidAmount, status: newStatus },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "VOID",
        entityType: "Payment",
        entityId: payment.id,
        before: {
          code: payment.code,
          amount: Number(payment.amount),
          invoiceStatus: payment.invoice.status,
          invoicePaidAmount: Number(payment.invoice.paidAmount),
        },
        after: {
          reason: reason.trim(),
          invoiceStatus: newStatus,
          invoicePaidAmount: newPaidAmount,
        },
      });
    }, { isolationLevel: "Serializable" });

    revalidatePath("/keuangan");
    revalidatePath("/penjualan");
    return { success: true };
  } catch (error) {
    console.error("[voidPayment]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal melakukan void pembayaran.",
    };
  }
}

export async function voidPurchase(purchaseId: string, reason: string) {
  try {
    await requireRole("OWNER", "MANAGER");
    if (!reason.trim()) return { success: false, error: "Alasan void wajib diisi." };
    const tenantId = await getCurrentTenantId();
    const userId = await getSystemUserId();
    const tenantPrisma = await requireTenantPrisma();

    await tenantPrisma.$transaction(async (tx) => {
      const purchase = await tx.purchase.findUnique({ where: { id: purchaseId } });
      if (!purchase) throw new Error("Pembelian tidak ditemukan.");
      if (purchase.status === "VOID") throw new Error("Pembelian sudah di-void.");
      if (purchase.status !== "COMPLETED") {
        throw new Error("Hanya pembelian selesai yang dapat di-void.");
      }
      const activePayments = await tx.supplierPayment.count({
        where: { purchaseId: purchase.id, voidAt: null },
      });
      if (activePayments > 0) {
        throw new Error("Void semua pembayaran supplier pada pembelian ini terlebih dahulu.");
      }

      const sourceEntries = await tx.inventoryLedger.findMany({
        where: {
          refId: purchase.id,
          refType: { in: ["PURCHASE_GB", "PURCHASE_PKG"] },
          entryType: "IN",
        },
      });
      if (sourceEntries.length !== 1) {
        throw new Error("Ledger pembelian tidak lengkap; void dibatalkan.");
      }

      const source = sourceEntries[0];
      await appendLedger(tx, {
        data: {
          productId: source.productId,
          packagingId: source.packagingId,
          entryType: "OUT",
          refType: "VOID_REVERSAL",
          refId: purchase.id,
          quantityKg: source.quantityKg,
          quantityUnit: source.quantityUnit,
          notes: `VOID pembelian: ${purchase.code}`,
          createdById: userId,
        },
      });
      await tx.purchase.update({
        where: { id: purchase.id },
        data: {
          status: "VOID",
          voidReason: reason.trim(),
          voidAt: new Date(),
        },
      });
      await recordAudit(tx, {
        tenantId,
        userId,
        action: "VOID",
        entityType: "Purchase",
        entityId: purchase.id,
        before: { status: purchase.status, totalCost: Number(purchase.totalCost) },
        after: { status: "VOID", reason: reason.trim() },
      });
    }, { isolationLevel: "Serializable" });

    revalidatePath("/keuangan");
    revalidatePath("/inventory");
    revalidatePath("/laporan");
    return { success: true };
  } catch (error) {
    console.error("[voidPurchase]", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Gagal melakukan void pembelian.",
    };
  }
}
