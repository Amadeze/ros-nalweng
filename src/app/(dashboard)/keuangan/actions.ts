"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
  itemSummary: string; // e.g. "House Blend 250g ×2, ..."
};

export type KpiSummary = {
  totalPiutang: number;       // total sisa tagihan ISSUED+PARTIAL
  piutangCount: number;       // jumlah nota belum lunas
  overdueCount: number;       // nota lewat jatuh tempo
  revenueMTD: number;         // total grandTotal PAID bulan ini
  revenueLastMonth: number;   // total grandTotal PAID bulan lalu
};

export type KeuanganPageData = {
  piutangRows: PiutangRow[];
  kpi: KpiSummary;
};

export type RecordPaymentInput = {
  invoiceId: string;
  amount: number;
  method: "CASH" | "TRANSFER" | "QRIS" | "CREDIT";
  paidAt: string;         // YYYY-MM-DD
  bankName?: string;      // for TRANSFER — stored in reference field
  reference?: string;     // no. ref / nama pengirim
  notes?: string;
};

export type PaymentActionResult =
  | { success: true; paymentCode: string; newStatus: string }
  | { success: false; error: string };

export type CreateExpenseInput = {
  date: string;            // YYYY-MM-DD
  category: "GAJI" | "UTILITAS" | "OPERASIONAL" | "LAINNYA";
  amount: number;
  description?: string;
};

export type CreateExpenseResult =
  | { success: true; id: string }
  | { success: false; error: string };

// P&L Report types
export type PnLReport = {
  month: number;
  year: number;
  revenue: number;
  cogs: number;
  grossProfit: number;
  opex: number;
  netProfit: number;
  opexBreakdown: { category: string; amount: number }[];
};

export type ExpenseRow = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string | null;
  createdAt: string;
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
    // Nota belum lunas
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
      orderBy: [
        { dueDate: { sort: "asc", nulls: "last" } },
        { issuedAt: "asc" },
      ],
    }),

    // Revenue bulan ini
    prisma.invoice.aggregate({
      where: { status: "PAID", issuedAt: { gte: startOfMonth } },
      _sum: { grandTotal: true },
    }),

    // Revenue bulan lalu
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

    // Build item summary string
    const shown = inv.items.slice(0, 2);
    const rest  = inv.items.length - shown.length;
    const itemSummary =
      shown.map((i) => `${i.product.name} ×${i.quantity}`).join(", ") +
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

  const totalPiutang = piutangRows.reduce((s, r) => s + r.balance, 0);
  const overdueCount = piutangRows.filter((r) => r.isOverdue).length;

  return {
    piutangRows,
    kpi: {
      totalPiutang,
      piutangCount: piutangRows.length,
      overdueCount,
      revenueMTD: Number(revenueMTDRaw._sum.grandTotal ?? 0),
      revenueLastMonth: Number(revenueLastMonthRaw._sum.grandTotal ?? 0),
    },
  };
}

// =============================================================================
// RECORD PAYMENT — ACID TRANSACTION
// =============================================================================

export async function recordPayment(input: RecordPaymentInput): Promise<PaymentActionResult> {
  try {
    // ── System user ──
    const user = await prisma.user.upsert({
      where: { email: "system@ros.internal" },
      update: {},
      create: { name: "System", email: "system@ros.internal", password: "system", role: "OWNER" },
    });

    // ── Fetch & validate invoice ──
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
      return {
        success: false,
        error: `Nominal melebihi sisa tagihan. Sisa: Rp ${(grandTotal - prevPaid).toLocaleString("id-ID")}`,
      };
    }

    // ── Determine new status ──
    const newStatus: "PAID" | "PARTIAL" =
      newPaidTotal >= grandTotal - 0.01 ? "PAID" : "PARTIAL";

    // ── Generate payment code ──
    const paidAt = new Date(input.paidAt + "T00:00:00");
    const prefix = `PAY-${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}`;
    const count  = await prisma.payment.count({ where: { code: { startsWith: prefix } } });
    const payCode = `${prefix}-${String(count + 1).padStart(3, "0")}`;

    // ── Build reference string ──
    const refParts = [input.bankName, input.reference].filter(Boolean);
    const refString = refParts.length > 0 ? refParts.join(" / ") : undefined;

    // ── ACID ──
    await prisma.$transaction(async (tx) => {
      await tx.payment.create({
        data: {
          code:       payCode,
          invoiceId:  inv.id,
          amount:     input.amount,
          method:     input.method,
          reference:  refString,
          paidAt,
          notes:      input.notes,
          createdById: user.id,
        },
      });

      await tx.invoice.update({
        where: { id: inv.id },
        data: {
          paidAmount: newPaidTotal,
          status:     newStatus,
        },
      });
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
    const user = await prisma.user.upsert({
      where: { email: "system@ros.internal" },
      update: {},
      create: { name: "System", email: "system@ros.internal", password: "system", role: "OWNER" },
    });

    if (input.amount <= 0) return { success: false, error: "Nominal harus lebih dari 0." };

    const expense = await prisma.expense.create({
      data: {
        date:        new Date(input.date + "T00:00:00"),
        category:    input.category,
        amount:      input.amount,
        description: input.description || null,
        createdById: user.id,
      },
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

  const [invoiceItems, expenses] = await Promise.all([
    // Ambil semua InvoiceItem dari Invoice yang sudah berstatus PAID, PARTIAL, atau ISSUED di bulan ini
    prisma.invoiceItem.findMany({
      where: {
        invoice: {
          status: { in: ["PAID", "PARTIAL", "ISSUED"] },
          issuedAt: { gte: startDate, lte: endDate },
        },
      },
      select: {
        quantity: true,
        unitPrice: true,
        discount: true,
        subtotal: true,
        hpp: true,
      },
    }),

    // Ambil semua pengeluaran bulan ini
    prisma.expense.findMany({
      where: { date: { gte: startDate, lte: endDate } },
      select: { category: true, amount: true },
    }),
  ]);

  const revenue     = invoiceItems.reduce((s, i) => s + Number(i.subtotal), 0);
  const cogs        = invoiceItems.reduce((s, i) => s + Number(i.hpp) * i.quantity, 0);
  const grossProfit = revenue - cogs;
  const opex        = expenses.reduce((s, e) => s + Number(e.amount), 0);
  const netProfit   = grossProfit - opex;

  // Group OPEX by category
  const opexMap: Record<string, number> = {};
  for (const e of expenses) {
    opexMap[e.category] = (opexMap[e.category] ?? 0) + Number(e.amount);
  }
  const opexBreakdown = Object.entries(opexMap).map(([category, amount]) => ({
    category,
    amount,
  }));

  return { month, year, revenue, cogs, grossProfit, opex, netProfit, opexBreakdown };
}

// =============================================================================
// GET EXPENSE HISTORY
// =============================================================================

export async function getExpenseHistory(): Promise<ExpenseRow[]> {
  const expenses = await prisma.expense.findMany({
    orderBy: { date: "desc" },
    take: 200,
    select: {
      id: true, date: true, category: true,
      amount: true, description: true, createdAt: true,
    },
  });

  return expenses.map((e) => ({
    id:          e.id,
    date:        e.date.toISOString(),
    category:    e.category,
    amount:      Number(e.amount),
    description: e.description,
    createdAt:   e.createdAt.toISOString(),
  }));
}
