import { describe, expect, it, vi } from "vitest";

import { appendLedger } from "./stock";

function transaction(updateCount = 1) {
  return {
    product: {
      updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
    },
    packaging: {
      updateMany: vi.fn().mockResolvedValue({ count: updateCount }),
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
});
