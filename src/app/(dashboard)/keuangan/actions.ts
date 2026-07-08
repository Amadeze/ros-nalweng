"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSystemUserId } from "@/lib/auth";

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
  category: "GAJI" | "UTILITAS" | "OPERASIONAL" | "LAINNYA";
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
    prisma.invoice.findMany({
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
    prisma.invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfMonth } },
      _sum: { grandTotal: true },
    }),
    prisma.invoice.aggregate({
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
    const inv = await prisma.invoice.findUnique({
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
    const count  = await prisma.payment.count({ where: { code: { startsWith: prefix } } });
    const payCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;
    const refParts = [input.bankName, input.reference].filter(Boolean);
    const refString = refParts.length > 0 ? refParts.join(" / ") : undefined;
    await prisma.$transaction(async (tx) => {
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
    const expense = await prisma.expense.create({
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
  const [invoices, expenses] = await Promise.all([
    prisma.invoice.findMany({
      where: { status: { in: ["PAID", "PARTIAL", "ISSUED"] }, issuedAt: { gte: startDate, lte: endDate } },
      select: { subtotal: true, discount: true, tax: true, items: { select: { quantity: true, hpp: true } } },
    }),
    prisma.expense.findMany({ where: { date: { gte: startDate, lte: endDate } }, select: { category: true, amount: true } }),
  ]);
  const grossSales      = invoices.reduce((s, inv) => s + Number(inv.subtotal), 0);
  const invoiceDiscount = invoices.reduce((s, inv) => s + Number(inv.discount), 0);
  const tax             = invoices.reduce((s, inv) => s + Number(inv.tax), 0);
  const netSales        = grossSales - invoiceDiscount;
  const revenue         = netSales;
  const cogs            = invoices.reduce((sum, inv) => sum + inv.items.reduce((itemSum, item) => itemSum + Number(item.hpp) * item.quantity, 0), 0);
  const grossProfit = revenue - cogs;
  const opex        = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit   = grossProfit - opex;
  const opexMap: Record<string, number> = {};
  for (const e of expenses) { opexMap[e.category] = (opexMap[e.category] ?? 0) + Number(e.amount); }
  const opexBreakdown = Object.entries(opexMap).map(([category, amount]) => ({ category, amount }));
  return { month, year, grossSales, invoiceDiscount, tax, netSales, revenue, cogs, grossProfit, opex, netProfit, opexBreakdown };
}

// =============================================================================
// GET EXPENSE HISTORY
// =============================================================================

export async function getExpenseHistory(): Promise<ExpenseRow[]> {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 200,
    select: { id: true, date: true, category: true, amount: true, description: true, createdAt: true },
  });
  return expenses.map((e) => ({ id: e.id, date: e.date.toISOString(), category: e.category, amount: Number(e.amount), description: e.description, createdAt: e.createdAt.toISOString() }));
}
