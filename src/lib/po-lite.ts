import type { PrismaClient, POStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";

// =============================================================================
// TYPES
// =============================================================================

export type CreatePOInput = {
  supplierId: string;
  expectedDate?: string;
  notes?: string;
  items: Array<{
    productId?: string;
    packagingId?: string;
    quantity: number;
    unitPrice: number;
    reorderPoint?: number;
    currentStock?: number;
  }>;
};

export type UpdatePOInput = {
  id: string;
  supplierId?: string;
  expectedDate?: string;
  notes?: string;
  items?: Array<{
    id?: string; // existing item ID untuk update
    productId?: string;
    packagingId?: string;
    quantity: number;
    unitPrice: number;
    reorderPoint?: number;
    currentStock?: number;
  }>;
};

export type ReceivePOInput = {
  receivedAt: string;
  items: Array<{
    poItemId: string;
    receivedQuantity: number;
    notes?: string;
  }>;
};

export type POFilter = {
  status?: POStatus;
  search?: string;
  page?: number;
  limit?: number;
};

export type POListItem = {
  id: string;
  code: string;
  status: POStatus;
  supplierName: string;
  expectedDate: string | null;
  totalEstimate: number;
  sentAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  itemCount: number;
};

export type PODetail = POListItem & {
  notes: string | null;
  items: Array<{
    id: string;
    productName: string | null;
    packagingName: string | null;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    reorderPoint: number | null;
    currentStock: number | null;
  }>;
  purchases: Array<{
    id: string;
    code: string;
    receivedAt: string;
    totalCost: number;
  }>;
};

// =============================================================================
// PURE FUNCTIONS
// =============================================================================

function calculateTotalEstimate(
  items: Array<{ quantity: number; unitPrice: number }>,
): number {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

function getStatusLabel(status: POStatus): string {
  const labels: Record<POStatus, string> = {
    DRAFT: "Draft",
    SENT: "Terkirim",
    PARTIAL: "Sebagian Diterima",
    RECEIVED: "Diterima",
    CANCELLED: "Dibatalkan",
  };
  return labels[status];
}

// =============================================================================
// DB FUNCTIONS
// =============================================================================

function getSinceDate(days: number): Date {
  const since = new Date();
  since.setDate(since.getDate() - days);
  return since;
}

/**
 * Generate kode PO: PO-YYYYMM-NNN
 */
export async function generatePOCode(prisma: PrismaClient): Promise<string> {
  const now = new Date();
  const prefix = `PO-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.purchaseOrder.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

/**
 * Create a new Purchase Order (Draft)
 */
export async function createDraftPO(
  prisma: PrismaClient,
  input: CreatePOInput,
  userId: string,
): Promise<{ id: string; code: string }> {
  // Validate supplier
  const supplier = await prisma.supplier.findUnique({
    where: { id: input.supplierId },
    select: { id: true, isActive: true },
  });
  if (!supplier || !supplier.isActive) {
    throw new Error("Supplier tidak ditemukan atau tidak aktif.");
  }

  // Validate items
  if (!input.items || input.items.length === 0) {
    throw new Error("PO harus memiliki minimal 1 item.");
  }

  for (const item of input.items) {
    if (!item.productId && !item.packagingId) {
      throw new Error("Setiap item harus memiliki produk atau kemasan.");
    }
    if (item.quantity <= 0) {
      throw new Error("Quantity harus lebih dari 0.");
    }
    if (item.unitPrice < 0) {
      throw new Error("Harga tidak boleh negatif.");
    }
  }

  // Generate code
  const code = await generatePOCode(prisma);

  // Calculate total estimate
  const totalEstimate = calculateTotalEstimate(input.items);

  // Create PO + items in transaction
  const result = await prisma.$transaction(async (tx) => {
    const po = await tx.purchaseOrder.create({
      data: {
        code,
        status: "DRAFT",
        supplierId: input.supplierId,
        expectedDate: input.expectedDate ? new Date(input.expectedDate) : null,
        notes: input.notes?.trim() || null,
        totalEstimate,
        createdById: userId,
      },
    });

    await tx.purchaseOrderItem.createMany({
      data: input.items.map((item) => ({
        purchaseOrderId: po.id,
        productId: item.productId || null,
        packagingId: item.packagingId || null,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.quantity * item.unitPrice,
        reorderPoint: item.reorderPoint ?? null,
        currentStock: item.currentStock ?? null,
      })),
    });

    return { id: po.id, code: po.code };
  });

  return result;
}

/**
 * Update a Draft PO
 */
export async function updateDraftPO(
  prisma: PrismaClient,
  input: UpdatePOInput,
): Promise<void> {
  // Validate PO exists and is Draft
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: input.id },
    select: { id: true, status: true },
  });

  if (!po) {
    throw new Error("PO tidak ditemukan.");
  }

  if (po.status !== "DRAFT") {
    throw new Error("Hanya PO berstatus Draft yang dapat diedit.");
  }

  // Update PO + items in transaction
  await prisma.$transaction(async (tx) => {
    // Update PO header
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: Record<string, any> = {};
    if (input.supplierId) updateData.supplierId = input.supplierId;
    if (input.expectedDate !== undefined) {
      updateData.expectedDate = input.expectedDate ? new Date(input.expectedDate) : null;
    }
    if (input.notes !== undefined) updateData.notes = input.notes?.trim() || null;

    if (input.items) {
      // Calculate new total
      updateData.totalEstimate = calculateTotalEstimate(input.items);

      // Delete existing items
      await tx.purchaseOrderItem.deleteMany({
        where: { purchaseOrderId: input.id },
      });

      // Create new items
      await tx.purchaseOrderItem.createMany({
        data: input.items.map((item) => ({
          purchaseOrderId: input.id,
          productId: item.productId || null,
          packagingId: item.packagingId || null,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.quantity * item.unitPrice,
          reorderPoint: item.reorderPoint ?? null,
          currentStock: item.currentStock ?? null,
        })),
      });
    }

    await tx.purchaseOrder.update({
      where: { id: input.id },
      data: updateData,
    });
  });
}

/**
 * Send PO to supplier (DRAFT → SENT)
 */
export async function sendPO(
  prisma: PrismaClient,
  poId: string,
): Promise<void> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    select: { id: true, status: true },
  });

  if (!po) {
    throw new Error("PO tidak ditemukan.");
  }

  if (po.status !== "DRAFT") {
    throw new Error("Hanya PO berstatus Draft yang dapat dikirim.");
  }

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });
}

/**
 * Receive PO items (SENT/PARTIAL → PARTIAL/RECEIVED)
 * Creates Purchase + Ledger entries for each received item
 */
export async function receivePO(
  prisma: PrismaClient,
  poId: string,
  input: ReceivePOInput,
  userId: string,
): Promise<{ purchaseCodes: string[] }> {
  // Validate PO
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    select: {
      id: true,
      status: true,
      supplierId: true,
      items: {
        select: {
          id: true,
          productId: true,
          packagingId: true,
          quantity: true,
          unitPrice: true,
        },
      },
    },
  });

  if (!po) {
    throw new Error("PO tidak ditemukan.");
  }

  if (po.status !== "SENT" && po.status !== "PARTIAL") {
    throw new Error("Hanya PO berstatus Sent atau Partial yang dapat diterima.");
  }

  // Validate received items
  const poItemMap = new Map(po.items.map((item) => [item.id, item]));
  for (const received of input.items) {
    const poItem = poItemMap.get(received.poItemId);
    if (!poItem) {
      throw new Error(`Item PO ${received.poItemId} tidak ditemukan.`);
    }
    if (received.receivedQuantity < 0) {
      throw new Error("Quantity diterima tidak boleh negatif.");
    }
  }

  // Process each received item
  const purchaseCodes: string[] = [];
  const receivedAt = new Date(input.receivedAt);

  await prisma.$transaction(async (tx) => {
    for (const received of input.items) {
      if (received.receivedQuantity <= 0) continue;

      const poItem = poItemMap.get(received.poItemId)!;
      const isProduct = !!poItem.productId;

      // Generate purchase code
      const purchasePrefix = `PUR-${receivedAt.getFullYear()}${String(receivedAt.getMonth() + 1).padStart(2, "0")}`;
      const purchaseCount = await tx.purchase.count({
        where: { code: { startsWith: purchasePrefix } },
      });
      const purchaseCode = `${purchasePrefix}-${String(purchaseCount + 1).padStart(3, "0")}`;

      // Calculate total cost for this receipt
      const totalCost = received.receivedQuantity * Number(poItem.unitPrice);

      // Create Purchase
      const purchase = await tx.purchase.create({
        data: {
          code: purchaseCode,
          type: isProduct ? "GREEN_BEAN" : "PACKAGING",
          supplierId: po.supplierId,
          productId: poItem.productId,
          packagingId: poItem.packagingId,
          weightKg: isProduct ? received.receivedQuantity : null,
          quantityUnits: isProduct ? null : Math.round(received.receivedQuantity),
          pricePerUnit: poItem.unitPrice,
          shippingCost: 0,
          totalCost,
          status: "COMPLETED",
          paymentStatus: "UNPAID",
          paidAmount: 0,
          receivedAt,
          notes: `Dari PO ${poId}`,
          createdById: userId,
          purchaseOrderId: poId,
        },
      });

      purchaseCodes.push(purchaseCode);

      // Create ledger entry (IN)
      // Note: appendLedger needs to be called from stock.ts
      // For now, we'll create the ledger entry directly
      await tx.inventoryLedger.create({
        data: {
          productId: poItem.productId,
          packagingId: poItem.packagingId,
          entryType: "IN",
          refType: isProduct ? "PURCHASE_GB" : "PURCHASE_PKG",
          refId: purchase.id,
          quantityKg: isProduct ? received.receivedQuantity : null,
          quantityUnit: isProduct ? null : Math.round(received.receivedQuantity),
          notes: `PO ${poId} - ${purchaseCode}`,
          createdById: userId,
        },
      });

      // Update cached stock
      if (isProduct && poItem.productId) {
        await tx.product.updateMany({
          where: { id: poItem.productId },
          data: {
            stockKg: { increment: received.receivedQuantity },
          },
        });
      } else if (poItem.packagingId) {
        await tx.packaging.updateMany({
          where: { id: poItem.packagingId },
          data: {
            stockUnit: { increment: Math.round(received.receivedQuantity) },
          },
        });
      }
    }

    // Determine new PO status
    // Check if all items are fully received
    const totalOrdered = po.items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const totalReceived = input.items.reduce((sum, item) => sum + item.receivedQuantity, 0);

    // Get previously received quantities
    const previousPurchases = await tx.purchase.findMany({
      where: { purchaseOrderId: poId },
      select: { weightKg: true, quantityUnits: true },
    });

    const previousReceived = previousPurchases.reduce((sum, p) => {
      return sum + Number(p.weightKg ?? 0) + (p.quantityUnits ?? 0);
    }, 0);

    const totalAllReceived = previousReceived + totalReceived;

    let newStatus: POStatus;
    if (totalAllReceived >= totalOrdered) {
      newStatus = "RECEIVED";
    } else {
      newStatus = "PARTIAL";
    }

    await tx.purchaseOrder.update({
      where: { id: poId },
      data: {
        status: newStatus,
        receivedAt: newStatus === "RECEIVED" ? receivedAt : undefined,
      },
    });
  });

  return { purchaseCodes };
}

/**
 * Cancel PO (DRAFT/SENT → CANCELLED)
 */
export async function cancelPO(
  prisma: PrismaClient,
  poId: string,
): Promise<void> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    select: { id: true, status: true },
  });

  if (!po) {
    throw new Error("PO tidak ditemukan.");
  }

  if (po.status === "RECEIVED" || po.status === "CANCELLED") {
    throw new Error("PO yang sudah diterima atau dibatalkan tidak dapat dibatalkan.");
  }

  if (po.status === "PARTIAL") {
    throw new Error("PO yang sudah sebagian diterima tidak dapat dibatalkan. Hubungi supplier untuk retur.");
  }

  await prisma.purchaseOrder.update({
    where: { id: poId },
    data: { status: "CANCELLED" },
  });
}

/**
 * Get PO list with filters
 */
export async function getPOList(
  prisma: PrismaClient,
  filters: POFilter = {},
): Promise<{ items: POListItem[]; total: number }> {
  const { status, search, page = 1, limit = 20 } = filters;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: Record<string, any> = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { code: { contains: search, mode: "insensitive" } },
      { supplier: { name: { contains: search, mode: "insensitive" } } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.purchaseOrder.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        items: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.purchaseOrder.count({ where }),
  ]);

  return {
    items: items.map((po) => ({
      id: po.id,
      code: po.code,
      status: po.status,
      supplierName: po.supplier.name,
      expectedDate: po.expectedDate?.toISOString() ?? null,
      totalEstimate: Number(po.totalEstimate ?? 0),
      sentAt: po.sentAt?.toISOString() ?? null,
      receivedAt: po.receivedAt?.toISOString() ?? null,
      createdAt: po.createdAt.toISOString(),
      itemCount: po.items.length,
    })),
    total,
  };
}

/**
 * Get PO detail
 */
export async function getPODetail(
  prisma: PrismaClient,
  poId: string,
): Promise<PODetail | null> {
  const po = await prisma.purchaseOrder.findUnique({
    where: { id: poId },
    include: {
      supplier: { select: { name: true } },
      items: {
        include: {
          product: { select: { name: true } },
          packaging: { select: { name: true } },
        },
      },
      purchases: {
        select: {
          id: true,
          code: true,
          receivedAt: true,
          totalCost: true,
        },
        orderBy: { receivedAt: "desc" },
      },
    },
  });

  if (!po) return null;

  return {
    id: po.id,
    code: po.code,
    status: po.status,
    supplierName: po.supplier.name,
    expectedDate: po.expectedDate?.toISOString() ?? null,
    totalEstimate: Number(po.totalEstimate ?? 0),
    sentAt: po.sentAt?.toISOString() ?? null,
    receivedAt: po.receivedAt?.toISOString() ?? null,
    createdAt: po.createdAt.toISOString(),
    itemCount: po.items.length,
    notes: po.notes,
    items: po.items.map((item) => ({
      id: item.id,
      productName: item.product?.name ?? null,
      packagingName: item.packaging?.name ?? null,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
      totalPrice: Number(item.totalPrice),
      reorderPoint: item.reorderPoint ? Number(item.reorderPoint) : null,
      currentStock: item.currentStock ? Number(item.currentStock) : null,
    })),
    purchases: po.purchases.map((p) => ({
      id: p.id,
      code: p.code,
      receivedAt: p.receivedAt.toISOString(),
      totalCost: Number(p.totalCost),
    })),
  };
}

/**
 * Get PO summary counts by status
 */
export async function getPOSummary(
  prisma: PrismaClient,
): Promise<{
  draft: number;
  sent: number;
  partial: number;
  received: number;
  cancelled: number;
  total: number;
}> {
  const counts = await prisma.purchaseOrder.groupBy({
    by: ["status"],
    _count: true,
  });

  const summary = {
    draft: 0,
    sent: 0,
    partial: 0,
    received: 0,
    cancelled: 0,
    total: 0,
  };

  for (const count of counts) {
    summary.total += count._count;
    switch (count.status) {
      case "DRAFT":
        summary.draft = count._count;
        break;
      case "SENT":
        summary.sent = count._count;
        break;
      case "PARTIAL":
        summary.partial = count._count;
        break;
      case "RECEIVED":
        summary.received = count._count;
        break;
      case "CANCELLED":
        summary.cancelled = count._count;
        break;
    }
  }

  return summary;
}
