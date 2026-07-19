import type { PrismaClient } from "@prisma/client";
import { describe, expect, it, vi } from "vitest";
import { generateDailyBriefForTenant } from "./daily-brief";

describe("generateDailyBriefForTenant", () => {
  it("separates accrual sales from cash and stores a tenant-local snapshot", async () => {
    const invoiceFindMany = vi.fn()
      .mockResolvedValueOnce([{ subtotal: 1_000_000, discount: 100_000 }])
      .mockResolvedValueOnce([
        { grandTotal: 500_000, paidAmount: 100_000, dueDate: new Date("2026-07-01T00:00:00.000Z") },
      ]);
    const upsert = vi.fn().mockResolvedValue({ id: "brief-1" });
    const client = {
      tenant: { findUnique: vi.fn().mockResolvedValue({ timezone: "Asia/Jayapura", isActive: true }) },
      invoice: { findMany: invoiceFindMany },
      payment: { aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 250_000 } }) },
      parentRoastingBatch: {
        findMany: vi.fn().mockResolvedValue([{ targetWeightKg: 10, actualOutputKg: 8.5 }]),
      },
      productionBatch: { findMany: vi.fn().mockResolvedValue([{ unitsProduced: 40 }]) },
      sampleUsage: {
        aggregate: vi.fn().mockResolvedValue({ _count: { id: 2 }, _sum: { packCount: 3, totalGrams: 300, totalCost: 75_000 } }),
      },
      purchase: {
        findMany: vi.fn().mockResolvedValue([
          { totalCost: 300_000, paidAmount: 100_000, dueDate: new Date("2026-07-10T00:00:00.000Z") },
        ]),
      },
      product: {
        findMany: vi.fn().mockResolvedValue([
          { type: "GREEN_BEAN", stockKg: 2, stockUnit: 0, safetyStockQuantity: 5 },
        ]),
      },
      packaging: { findMany: vi.fn().mockResolvedValue([]) },
      webhookEvent: { count: vi.fn().mockResolvedValue(0) },
      dailyBriefSnapshot: { upsert },
    } as unknown as PrismaClient;

    const payload = await generateDailyBriefForTenant(
      client,
      "tenant-1",
      new Date("2026-07-19T21:00:00.000Z"),
    );

    expect(payload.reportDate).toBe("2026-07-19");
    expect(payload.salesAccrued).toBe(900_000);
    expect(payload.cashCollected).toBe(250_000);
    expect(payload.roasting.yieldPercent).toBe(85);
    expect(payload.samples).toEqual({ transactionCount: 2, packCount: 3, totalGrams: 300, totalCost: 75_000 });
    expect(payload.inventoryAlertCount).toBe(1);
    expect(payload.receivables.overdueTotal).toBe(400_000);
    expect(upsert).toHaveBeenCalledOnce();
    expect(upsert.mock.calls[0][0].create).toMatchObject({
      tenantId: "tenant-1",
      periodStart: new Date("2026-07-18T15:00:00.000Z"),
      periodEnd: new Date("2026-07-19T15:00:00.000Z"),
    });
  });
});
