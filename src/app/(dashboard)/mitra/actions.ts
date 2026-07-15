"use server";

import { revalidatePath } from "next/cache";
import { getPnLReport } from "../keuangan/actions";
import { getSystemUserId, requireTenantPrisma } from "@/lib/auth";

export async function getMitraData() {
  const partners = await (await requireTenantPrisma()).partner.findMany({
    orderBy: { name: "asc" }
  });
  
  const capitalTransactions = await (await requireTenantPrisma()).capitalTransaction.findMany({
    include: { partner: true },
    orderBy: { transactionDate: "desc" },
    take: 50
  });

  const profitDistributions = await (await requireTenantPrisma()).profitDistribution.findMany({
    include: { partner: true },
    orderBy: { distributedAt: "desc" },
    take: 50
  });

  return { partners, capitalTransactions, profitDistributions };
}

export async function createPartner(data: { name: string; equityShare: number }) {
  await (await requireTenantPrisma()).partner.create({
    data: {
      name: data.name,
      equityShare: data.equityShare
    }
  });
  revalidatePath("/mitra");
}

export async function createCapitalTransaction(data: {
  partnerId?: string;
  type: "INJECTION" | "WITHDRAWAL";
  amount: number;
  notes?: string;
}) {
  await (await requireTenantPrisma()).capitalTransaction.create({
    data: {
      code: `CAP-${Date.now()}`,
      partnerId: data.partnerId || null,
      type: data.type,
      amount: data.amount,
      notes: data.notes
    }
  });
  revalidatePath("/mitra");
  revalidatePath("/laporan");
}

export async function calculateAndPostFounderSalary(month: number, year: number) {
  const userId = await getSystemUserId();
  
  // 1. Get Net Profit for the month
  const pnl = await getPnLReport(month, year);
  const currentNetProfit = pnl.netProfit;

  // We need to know if we already posted "Gaji Founder" for this month so we don't double count it.
  // Actually, to get the profit BEFORE salary, we add the current month's Gaji Founder back to net profit.
  const startDate = new Date(year, month - 1, 1);
  const endDate   = new Date(year, month, 0, 23, 59, 59, 999);
  
  const existingSalaries = await (await requireTenantPrisma()).expense.findMany({
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

  // Delete old salaries for this month to replace them
  if (existingSalaries.length > 0) {
    await (await requireTenantPrisma()).expense.deleteMany({
      where: {
        id: { in: existingSalaries.map(e => e.id) }
      }
    });
  }

  // 3. Post to Expenses
  const dateToPost = new Date();
  // if calculating for a past month, post on the last day of that month
  if (month !== dateToPost.getMonth() + 1 || year !== dateToPost.getFullYear()) {
    dateToPost.setTime(endDate.getTime());
  }

  const salaries = [
    { name: "Anda (Investor)" },
    { name: "Reza" },
    { name: "Theo" }
  ];

  for (const person of salaries) {
    await (await requireTenantPrisma()).expense.create({
      data: {
        date: dateToPost,
        category: "GAJI",
        amount: salaryPerPerson,
        description: `Gaji bulanan untuk ${person.name} (${month}/${year})`,
        createdById: userId
      }
    });
  }

  revalidatePath("/mitra");
  revalidatePath("/laporan");
  revalidatePath("/keuangan");

  return { success: true, salaryPerPerson, salaryPool };
}
