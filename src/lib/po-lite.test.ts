import { describe, it, expect, vi } from "vitest";
import {
  generatePOCode,
  createDraftPO,
  updateDraftPO,
  sendPO,
  receivePO,
  cancelPO,
  getPOList,
  getPODetail,
  getPOSummary,
} from "./po-lite";

// =============================================================================
// MOCK PRISMA
// =============================================================================

function createMockPrisma() {
  const mock: any = {
    purchaseOrder: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      groupBy: vi.fn(),
      deleteMany: vi.fn(),
    },
    purchaseOrderItem: {
      createMany: vi.fn(),
      deleteMany: vi.fn(),
    },
    purchase: {
      count: vi.fn(),
      create: vi.fn(),
      findMany: vi.fn(),
    },
    inventoryLedger: {
      create: vi.fn(),
    },
    product: {
      updateMany: vi.fn(),
    },
    packaging: {
      updateMany: vi.fn(),
    },
    supplier: {
      findUnique: vi.fn(),
    },
    $transaction: vi.fn(),
  };

  // Make $transaction execute the callback with the same mock instance
  mock.$transaction.mockImplementation(async (fn: any) => fn(mock));

  return mock;
}

// =============================================================================
// PURE FUNCTION TESTS
// =============================================================================

describe("generatePOCode", () => {
  it("generates correct code format", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.count.mockResolvedValue(0);

    const code = await generatePOCode(prisma);

    expect(code).toMatch(/^PO-\d{6}-001$/);
  });

  it("increments count for existing codes", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.count.mockResolvedValue(5);

    const code = await generatePOCode(prisma);

    expect(code).toMatch(/^PO-\d{6}-006$/);
  });
});

// =============================================================================
// CREATE PO TESTS
// =============================================================================

describe("createDraftPO", () => {
  it("creates PO with valid input", async () => {
    const prisma = createMockPrisma();
    prisma.supplier.findUnique.mockResolvedValue({ id: "sup-1", isActive: true });
    prisma.purchaseOrder.count.mockResolvedValue(0);
    prisma.purchaseOrder.create.mockResolvedValue({ id: "po-1", code: "PO-202607-001" });
    prisma.purchaseOrderItem.createMany.mockResolvedValue({ count: 1 });

    const result = await createDraftPO(
      prisma,
      {
        supplierId: "sup-1",
        items: [
          { productId: "gb-1", quantity: 10, unitPrice: 50000 },
        ],
      },
      "user-1",
    );

    expect(result.code).toMatch(/^PO-\d{6}-001$/);
    expect(prisma.purchaseOrder.create).toHaveBeenCalled();
    expect(prisma.purchaseOrderItem.createMany).toHaveBeenCalled();
  });

  it("throws error for inactive supplier", async () => {
    const prisma = createMockPrisma();
    prisma.supplier.findUnique.mockResolvedValue({ id: "sup-1", isActive: false });

    await expect(
      createDraftPO(
        prisma,
        { supplierId: "sup-1", items: [{ productId: "gb-1", quantity: 10, unitPrice: 50000 }] },
        "user-1",
      ),
    ).rejects.toThrow("Supplier tidak ditemukan atau tidak aktif.");
  });

  it("throws error for empty items", async () => {
    const prisma = createMockPrisma();
    prisma.supplier.findUnique.mockResolvedValue({ id: "sup-1", isActive: true });

    await expect(
      createDraftPO(prisma, { supplierId: "sup-1", items: [] }, "user-1"),
    ).rejects.toThrow("PO harus memiliki minimal 1 item.");
  });

  it("throws error for zero quantity", async () => {
    const prisma = createMockPrisma();
    prisma.supplier.findUnique.mockResolvedValue({ id: "sup-1", isActive: true });

    await expect(
      createDraftPO(
        prisma,
        { supplierId: "sup-1", items: [{ productId: "gb-1", quantity: 0, unitPrice: 50000 }] },
        "user-1",
      ),
    ).rejects.toThrow("Quantity harus lebih dari 0.");
  });
});

// =============================================================================
// UPDATE PO TESTS
// =============================================================================

describe("updateDraftPO", () => {
  it("updates Draft PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "DRAFT" });
    prisma.purchaseOrderItem.deleteMany.mockResolvedValue({ count: 1 });
    prisma.purchaseOrderItem.createMany.mockResolvedValue({ count: 1 });
    prisma.purchaseOrder.update.mockResolvedValue({});

    await updateDraftPO(prisma, {
      id: "po-1",
      items: [{ productId: "gb-1", quantity: 20, unitPrice: 55000 }],
    });

    expect(prisma.purchaseOrder.update).toHaveBeenCalled();
  });

  it("throws error for non-Draft PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "SENT" });

    await expect(
      updateDraftPO(prisma, { id: "po-1", items: [] }),
    ).rejects.toThrow("Hanya PO berstatus Draft yang dapat diedit.");
  });
});

// =============================================================================
// SEND PO TESTS
// =============================================================================

describe("sendPO", () => {
  it("sends Draft PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "DRAFT" });
    prisma.purchaseOrder.update.mockResolvedValue({});

    await sendPO(prisma, "po-1");

    expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
      where: { id: "po-1" },
      data: { status: "SENT", sentAt: expect.any(Date) },
    });
  });

  it("throws error for non-Draft PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "SENT" });

    await expect(sendPO(prisma, "po-1")).rejects.toThrow(
      "Hanya PO berstatus Draft yang dapat dikirim.",
    );
  });
});

// =============================================================================
// CANCEL PO TESTS
// =============================================================================

describe("cancelPO", () => {
  it("cancels Draft PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "DRAFT" });
    prisma.purchaseOrder.update.mockResolvedValue({});

    await cancelPO(prisma, "po-1");

    expect(prisma.purchaseOrder.update).toHaveBeenCalledWith({
      where: { id: "po-1" },
      data: { status: "CANCELLED" },
    });
  });

  it("cancels Sent PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "SENT" });
    prisma.purchaseOrder.update.mockResolvedValue({});

    await cancelPO(prisma, "po-1");

    expect(prisma.purchaseOrder.update).toHaveBeenCalled();
  });

  it("throws error for Received PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "RECEIVED" });

    await expect(cancelPO(prisma, "po-1")).rejects.toThrow(
      "PO yang sudah diterima atau dibatalkan tidak dapat dibatalkan.",
    );
  });

  it("throws error for Partial PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({ id: "po-1", status: "PARTIAL" });

    await expect(cancelPO(prisma, "po-1")).rejects.toThrow(
      "PO yang sudah sebagian diterima tidak dapat dibatalkan.",
    );
  });
});

// =============================================================================
// RECEIVE PO TESTS
// =============================================================================

describe("receivePO", () => {
  it("receives PO items", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({
      id: "po-1",
      status: "SENT",
      supplierId: "sup-1",
      items: [
        { id: "item-1", productId: "gb-1", packagingId: null, quantity: 10, unitPrice: 50000 },
      ],
    });
    prisma.purchase.count.mockResolvedValue(0);
    prisma.purchase.create.mockResolvedValue({ id: "pur-1", code: "PUR-202607-001" });
    prisma.inventoryLedger.create.mockResolvedValue({});
    prisma.product.updateMany.mockResolvedValue({ count: 1 });
    prisma.purchase.findMany.mockResolvedValue([]);
    prisma.purchaseOrder.update.mockResolvedValue({});

    const result = await receivePO(
      prisma,
      "po-1",
      {
        receivedAt: "2026-07-18",
        items: [{ poItemId: "item-1", receivedQuantity: 10 }],
      },
      "user-1",
    );

    expect(result.purchaseCodes).toHaveLength(1);
    expect(prisma.purchase.create).toHaveBeenCalled();
    expect(prisma.inventoryLedger.create).toHaveBeenCalled();
    expect(prisma.product.updateMany).toHaveBeenCalled();
  });

  it("throws error for non-Sent/Partial PO", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findUnique.mockResolvedValue({
      id: "po-1",
      status: "DRAFT",
      supplierId: "sup-1",
      items: [],
    });

    await expect(
      receivePO(
        prisma,
        "po-1",
        { receivedAt: "2026-07-18", items: [] },
        "user-1",
      ),
    ).rejects.toThrow("Hanya PO berstatus Sent atau Partial yang dapat diterima.");
  });
});

// =============================================================================
// GET PO LIST TESTS
// =============================================================================

describe("getPOList", () => {
  it("returns PO list with counts", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.findMany.mockResolvedValue([
      {
        id: "po-1",
        code: "PO-202607-001",
        status: "DRAFT",
        supplier: { name: "PT Kopi" },
        expectedDate: null,
        totalEstimate: 500000,
        sentAt: null,
        receivedAt: null,
        createdAt: new Date(),
        items: [{ id: "item-1" }, { id: "item-2" }],
      },
    ]);
    prisma.purchaseOrder.count.mockResolvedValue(1);

    const result = await getPOList(prisma);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].itemCount).toBe(2);
    expect(result.total).toBe(1);
  });
});

// =============================================================================
// GET PO SUMMARY TESTS
// =============================================================================

describe("getPOSummary", () => {
  it("returns status counts", async () => {
    const prisma = createMockPrisma();
    prisma.purchaseOrder.groupBy.mockResolvedValue([
      { status: "DRAFT", _count: 2 },
      { status: "SENT", _count: 1 },
      { status: "RECEIVED", _count: 5 },
    ]);

    const result = await getPOSummary(prisma);

    expect(result.draft).toBe(2);
    expect(result.sent).toBe(1);
    expect(result.received).toBe(5);
    expect(result.total).toBe(8);
  });
});
