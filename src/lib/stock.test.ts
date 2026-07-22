import { describe, expect, it, vi } from "vitest";

import { appendLedger } from "./stock";

function transaction(updateCount = 1) {
  return {
    product: {
      updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
      findUnique: vi.fn(),
    },
    packaging: {
      updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
      findUnique: vi.fn(),
    },
    inventoryLedger: {
      create: vi.fn(async ({ data }) => ({ id: "ledger-1", ...data })),
    },
  };
}

describe("appendLedger", () => {
  it("normalizes the existing { data } call shape", async () => {
    const tx = transaction();
    await appendLedger(tx, {
      data: {
        productId: "product-1",
        entryType: "IN",
        refType: "ADJUSTMENT_IN",
        refId: "ref-1",
        quantityUnit: 5,
        createdById: "user-1",
      },
    });

    expect(tx.product.updateMany).toHaveBeenCalledWith({
      where: { id: "product-1" },
      data: { stockUnit: { increment: 5 } },
    });
    expect(tx.inventoryLedger.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ productId: "product-1", quantityUnit: 5 }),
    });
  });

  it("atomically rejects outbound stock that is unavailable", async () => {
    const tx = transaction(0);

    await expect(
      appendLedger(tx, {
        data: {
          productId: "product-1",
          entryType: "OUT",
          refType: "SALE_FG_OUT",
          refId: "invoice-1",
          quantityUnit: 6,
          createdById: "user-1",
        },
      }),
    ).rejects.toThrow("Stok produk tidak cukup");

    expect(tx.inventoryLedger.create).not.toHaveBeenCalled();
  });

  it("requires exactly one inventory target and a positive quantity", async () => {
    const tx = transaction();

    await expect(
      appendLedger(tx, {
        data: {
          productId: "product-1",
          packagingId: "packaging-1",
          entryType: "IN",
          quantityUnit: 1,
        },
      }),
    ).rejects.toThrow("exactly one");

    await expect(
      appendLedger(tx, {
        data: {
          productId: "product-1",
          entryType: "IN",
          quantityUnit: 0,
        },
      }),
    ).rejects.toThrow("greater than zero");
  });

  it("stores lotNumber and expiryDate on ledger entry", async () => {
    const tx = transaction();
    await appendLedger(tx, {
      data: {
        productId: "product-1",
        entryType: "IN",
        refType: "PURCHASE_GB",
        refId: "purchase-1",
        quantityKg: 50,
        lotNumber: "LOT-2024-001",
        expiryDate: new Date("2025-06-01"),
        createdById: "user-1",
      },
    });

    expect(tx.inventoryLedger.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        lotNumber: "LOT-2024-001",
        expiryDate: new Date("2025-06-01"),
        quantityKg: 50,
      }),
    });
  });

  it("computes weighted average cost for product (GB/RB)", async () => {
    const tx = transaction();
    tx.product.findUnique = vi.fn().mockResolvedValue({
      stockKg: "100",
      stockUnit: 0,
      avgCostPerKg: "50000",
    });

    await appendLedger(tx, {
      data: {
        productId: "product-1",
        entryType: "IN",
        refType: "PURCHASE_GB",
        refId: "purchase-2",
        quantityKg: 50,
        incomingPrice: 60000,
        createdById: "user-1",
      },
    });

    const expectedAvg = (100 * 50000 + 50 * 60000) / (100 + 50);
    expect(tx.product.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "product-1" },
        data: expect.objectContaining({
          stockKg: { increment: 50 },
          avgCostPerKg: expectedAvg,
        }),
      }),
    );
  });

  it("computes weighted average cost for packaging", async () => {
    const tx = transaction();
    tx.packaging.findUnique = vi.fn().mockResolvedValue({
      stockUnit: 200,
      avgCostPerUnit: "5000",
    });

    await appendLedger(tx, {
      data: {
        packagingId: "packaging-1",
        entryType: "IN",
        refType: "PURCHASE_PKG",
        refId: "purchase-3",
        quantityUnit: 100,
        incomingPrice: 5500,
        createdById: "user-1",
      },
    });

    const expectedAvg = (200 * 5000 + 100 * 5500) / (200 + 100);
    expect(tx.packaging.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "packaging-1" },
        data: expect.objectContaining({
          stockUnit: { increment: 100 },
          avgCostPerUnit: expectedAvg,
        }),
      }),
    );
  });

  it("rejects IN entry with incomingPrice for FG (unit-based)", async () => {
    const tx = transaction();
    tx.product.findUnique = vi.fn().mockResolvedValue({
      stockKg: "0",
      stockUnit: 10,
      avgCostPerKg: "0",
    });

    await appendLedger(tx, {
      data: {
        productId: "product-fg-1",
        entryType: "IN",
        refType: "PRODUCTION_FG_IN",
        refId: "batch-1",
        quantityUnit: 50,
        incomingPrice: 15000,
        createdById: "user-1",
      },
    });

    // FG should NOT update avgCostPerKg — only stockUnit
    const updateCall = (tx.product.updateMany as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(updateCall[0].data.stockUnit).toEqual({ increment: 50 });
    expect(updateCall[0].data.avgCostPerKg).toBeUndefined();
  });
});
