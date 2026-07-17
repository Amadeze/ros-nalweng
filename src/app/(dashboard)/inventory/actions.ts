"use server";

import { appendLedger } from "@/lib/stock";
import { getCurrentTenantId, getSystemUserId, requireRole, requireTenantPrisma } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { recordAudit } from "@/lib/audit";
import { randomBytes } from "crypto";
import {
  resolveInitialPurchasePayment,
  type PurchasePaymentState,
} from "@/lib/purchase-payments";

// =============================================================================
// TYPES — semua Decimal dikonversi ke number agar bisa di-serialize ke client
// =============================================================================

export type ProductStockRow = {
  id: string;
  code: string;
  name: string;
  type: "GREEN_BEAN" | "ROASTED_BEAN";
  origin: string | null;
  roastLevel: string | null;
  stockKg: number;
  latestHppPerKg: number | null;
};

export type PackagingStockRow = {
  id: string;
  code: string;
  name: string;
  weightGrams: number;
  costPerUnit: number;
  stockUnit: number;
};

export type FGStockRow = {
  id: string;
  code: string;
  name: string;
  type: "FINISHED_GOODS";
  stockUnit: number;
  latestHppPerUnit: number | null;
};

export type SupplierOption = {
  id: string;
  code: string;
  name: string;
};

export type GBProductOption = {
  id: string;
  name: string;
  origin: string | null;
};

export type InventoryPageData = {
  gbStocks: ProductStockRow[];
  rbStocks: ProductStockRow[];
  pkgStocks: PackagingStockRow[];
  fgStocks: FGStockRow[];
  ledgerEntries: LedgerHistoryRow[];
  suppliers: SupplierOption[];
  gbProducts: GBProductOption[];
};

export type LedgerHistoryRow = {
  id: string;
  createdAt: string;
  itemName: string;
  itemCode: string;
  itemType: "PRODUCT" | "PACKAGING";
  entryType: "IN" | "OUT";
  refType: string;
  refId: string;
  quantity: number;
  unit: "kg" | "unit";
  notes: string | null;
  createdByName: string;
};

export type PurchaseActionInput = {
  supplierId: string;
  receivedAt: string;       // "YYYY-MM-DD"
  productId?: string;       // ID produk GB existing
  productName?: string;     // nama produk baru
  productOrigin?: string;
  weightKg: number;
  pricePerKg: number;
  shippingCost: number;
  paymentStatus?: PurchasePaymentState;
  initialPaidAmount?: number;
  paymentMethod?: "CASH" | "TRANSFER" | "QRIS";
  dueDate?: string;
  notes?: string;
};

export type PackagingPurchaseInput = {
  supplierId: string;
  receivedAt: string;
  packagingId: string;
  quantityUnits: number;
  pricePerUnit: number;
  shippingCost: number;
  paymentStatus?: PurchasePaymentState;
  initialPaidAmount?: number;
  paymentMethod?: "CASH" | "TRANSFER" | "QRIS";
  dueDate?: string;
  notes?: string;
};

export type ActionResult =
  | { success: true; purchaseCode: string }
  | { success: false; error: string };

// =============================================================================
// HELPERS
// =============================================================================


/** Generate kode Purchase: PUR-YYYYMM-NNN */
async function generatePurchaseCode(): Promise<string> {
  const now = new Date();
  const prefix = `PUR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await (await requireTenantPrisma()).purchase.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

/** Generate kode Product untuk Green Bean baru: GB-SLUG */
async function generateProductCode(name: string): Promise<string> {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
  const prefix = `GB-${slug}`;
  const existing = await (await requireTenantPrisma()).product.count({
    where: { code: { startsWith: prefix } },
  });
  return existing === 0 ? prefix : `${prefix}-${existing + 1}`;
}

// =============================================================================
// QUERIES
// =============================================================================

async function fetchProductStocks(
  type: "GREEN_BEAN" | "ROASTED_BEAN"
): Promise<ProductStockRow[]> {
  const products = await (await requireTenantPrisma()).product.findMany({
    where: { type, isActive: true },
    include: {
      purchases: {
        where: { status: "COMPLETED" },
        orderBy: { receivedAt: "desc" },
        take: 1,
        select: { pricePerUnit: true, weightKg: true, shippingCost: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    let latestHppPerKg: number | null = null;
    if (p.purchases[0]) {
      const pur = p.purchases[0];
      const wKg = Number(pur.weightKg ?? 0);
      if (wKg > 0) {
        latestHppPerKg =
          (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost ?? 0)) / wKg;
      }
    }

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      type: p.type as "GREEN_BEAN" | "ROASTED_BEAN",
      origin: p.origin,
      roastLevel: p.roastLevel,
      stockKg: Number(p.stockKg),
      latestHppPerKg,
    };
  });
}

async function fetchPackagingStocks(): Promise<PackagingStockRow[]> {
  const packagings = await (await requireTenantPrisma()).packaging.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  return packagings.map((pkg) => ({
      id: pkg.id,
      code: pkg.code,
      name: pkg.name,
      weightGrams: Number(pkg.weightGrams),
      costPerUnit: Number(pkg.costPerUnit),
      stockUnit: pkg.stockUnit,
    }));
}

function parsePurchaseDueDate(status: PurchasePaymentState, dueDate?: string) {
  if (status === "PAID") return null;
  if (!dueDate) throw new Error("Tanggal jatuh tempo wajib diisi untuk pembelian kredit.");
  const parsed = new Date(`${dueDate}T23:59:59`);
  if (Number.isNaN(parsed.getTime())) throw new Error("Tanggal jatuh tempo tidak valid.");
  return parsed;
}

function generateSupplierPaymentCode(paidAt: Date) {
  const prefix = `SPAY-${paidAt.getFullYear()}${String(paidAt.getMonth() + 1).padStart(2, "0")}`;
  return `${prefix}-${randomBytes(4).toString("hex").toUpperCase()}`;
}

async function fetchFGStocks(): Promise<FGStockRow[]> {
  const products = await (await requireTenantPrisma()).product.findMany({
    where: { type: "FINISHED_GOODS", isActive: true },
    include: {
      productionBatches: {
        where: { status: "COMPLETED" },
        orderBy: { producedAt: "desc" },
        take: 1,
        select: { hppPerUnit: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    const latestHppPerUnit = p.productionBatches[0] 
      ? Number(p.productionBatches[0].hppPerUnit) 
      : null;

    return {
      id: p.id,
      code: p.code,
      name: p.name,
      type: "FINISHED_GOODS",
      stockUnit: p.stockUnit,
      latestHppPerUnit,
    };
  });
}

async function fetchLedgerHistory(): Promise<LedgerHistoryRow[]> {
  const entries = await (await requireTenantPrisma()).inventoryLedger.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      createdAt: true,
      entryType: true,
      refType: true,
      refId: true,
      quantityKg: true,
      quantityUnit: true,
      notes: true,
      product: { select: { code: true, name: true } },
      packaging: { select: { code: true, name: true } },
      createdBy: { select: { name: true } },
    },
  });

  return entries.map((entry) => {
    const usesKg = entry.quantityKg !== null;
    return {
      id: entry.id,
      createdAt: entry.createdAt.toISOString(),
      itemName: entry.product?.name ?? entry.packaging?.name ?? "Item dihapus",
      itemCode: entry.product?.code ?? entry.packaging?.code ?? "-",
      itemType: entry.product ? "PRODUCT" : "PACKAGING",
      entryType: entry.entryType,
      refType: entry.refType,
      refId: entry.refId,
      quantity: usesKg ? Number(entry.quantityKg) : Number(entry.quantityUnit ?? 0),
      unit: usesKg ? "kg" : "unit",
      notes: entry.notes,
      createdByName: entry.createdBy.name,
    };
  });
}

// =============================================================================
// PUBLIC SERVER ACTIONS
// =============================================================================

export async function getInventoryPageData(): Promise<InventoryPageData> {
  const [gbStocks, rbStocks, pkgStocks, fgStocks, ledgerEntries, suppliers, gbProducts] =
    await Promise.all([
      fetchProductStocks("GREEN_BEAN"),
      fetchProductStocks("ROASTED_BEAN"),
      fetchPackagingStocks(),
      fetchFGStocks(),
      fetchLedgerHistory(),
      (await requireTenantPrisma()).supplier.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
        orderBy: { name: "asc" },
      }),
      (await requireTenantPrisma()).product.findMany({
        where: { type: "GREEN_BEAN", isActive: true },
        select: { id: true, name: true, origin: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return { gbStocks, rbStocks, pkgStocks, fgStocks, ledgerEntries, suppliers, gbProducts };
}

// Tambah packaging options ke page data helper
export async function getPackagingOptions() {
  return (await requireTenantPrisma()).packaging.findMany({
    where: { isActive: true },
    select: { id: true, name: true, code: true, costPerUnit: true },
    orderBy: { name: "asc" },
  });
}

/**
 * Catat Barang Datang (Green Bean).
 *
 * ACID transaction:
 *   1. Find-or-create Product (GREEN_BEAN)
 *   2. Insert Purchase (status = COMPLETED)
 *   3. Insert InventoryLedger (IN, refType = PURCHASE_GB)
 *
 * HPP per kg = (pricePerKg * weightKg + shippingCost) / weightKg — disimpan
 * sebagai snapshot di Purchase.pricePerUnit setelah disesuaikan ke HPP.
 * Harga asli (harga beli) tetap bisa direkon dari Purchase.pricePerUnit × weightKg.
 *
 * Catatan: pricePerUnit di schema = harga beli per kg (bukan HPP).
 * HPP dihitung from (pricePerUnit * weight + shipping) / weight untuk laporan.
 */
export async function createGreenBeanPurchase(
  input: PurchaseActionInput
): Promise<ActionResult> {
  try {
    await requireRole("OWNER", "MANAGER", "OPERATOR");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();

    // 1. Find or create Product
    let product = input.productId
      ? await (await requireTenantPrisma()).product.findUnique({ where: { id: input.productId } })
      : null;

    if (!product && input.productName) {
      const code = await generateProductCode(input.productName);
      product = await (await requireTenantPrisma()).product.upsert({
        where: { tenantId_code: { tenantId, code } },
        create: {
          code,
          name: input.productName,
          type: "GREEN_BEAN",
          origin: input.productOrigin ?? null,
        },
        update: {},
      });
    }

    if (!product) {
      return { success: false, error: "Produk tidak ditemukan atau nama tidak valid." };
    }

    // 2. Hitung total biaya
    const weightKg = input.weightKg;
    const pricePerKg = input.pricePerKg;
    const shippingCost = input.shippingCost ?? 0;
    const totalCost = pricePerKg * weightKg + shippingCost;
    const payment = resolveInitialPurchasePayment(
      totalCost,
      input.paymentStatus,
      input.initialPaidAmount,
    );
    const dueDate = parsePurchaseDueDate(payment.paymentStatus, input.dueDate);
    const receivedAt = new Date(`${input.receivedAt}T00:00:00`);
    if (Number.isNaN(receivedAt.getTime())) {
      return { success: false, error: "Tanggal penerimaan tidak valid." };
    }

    // 3. Generate kode
    const purchaseCode = await generatePurchaseCode();

    // 4. ACID transaction
    await (await requireTenantPrisma()).$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          code: purchaseCode,
          type: "GREEN_BEAN",
          supplierId: input.supplierId,
          productId: product!.id,
          weightKg: weightKg,
          pricePerUnit: pricePerKg,
          shippingCost: shippingCost,
          totalCost: totalCost,
          status: "COMPLETED",
          paymentStatus: payment.paymentStatus,
          paidAmount: payment.paidAmount,
          dueDate,
          receivedAt,
          notes: input.notes ?? null,
          createdById: userId,
        },
      });

      if (payment.paidAmount > 0) {
        await tx.supplierPayment.create({
          data: {
            code: generateSupplierPaymentCode(receivedAt),
            purchaseId: purchase.id,
            amount: payment.paidAmount,
            method: input.paymentMethod ?? "CASH",
            paidAt: receivedAt,
            notes: payment.paymentStatus === "PARTIAL" ? "Uang muka pembelian" : "Pembayaran pembelian",
            createdById: userId,
          },
        });
      }

      await appendLedger(tx, {
        data: {
          productId: product!.id,
          entryType: "IN",
          refType: "PURCHASE_GB",
          refId: purchase.id,
          quantityKg: weightKg,
          incomingPrice: totalCost / weightKg,
          notes: `Barang datang: ${purchase.code}`,
          createdById: userId,
        },
      });

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "Purchase",
        entityId: purchase.id,
        after: {
          code: purchase.code,
          type: purchase.type,
          totalCost: Number(purchase.totalCost),
          paymentStatus: purchase.paymentStatus,
          paidAmount: Number(purchase.paidAmount),
        },
      });
    });

    revalidatePath("/inventory");
    return { success: true, purchaseCode };
  } catch (err) {
    console.error("[createGreenBeanPurchase]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
    };
  }
}

// =============================================================================
// CREATE PACKAGING PURCHASE
// =============================================================================

export async function createPackagingPurchase(
  input: PackagingPurchaseInput
): Promise<ActionResult> {
  try {
    await requireRole("OWNER", "MANAGER", "OPERATOR");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();

    const packaging = await (await requireTenantPrisma()).packaging.findUnique({
      where: { id: input.packagingId },
    });
    if (!packaging) return { success: false, error: "Kemasan tidak ditemukan." };

    const totalCost = input.pricePerUnit * input.quantityUnits + input.shippingCost;
    const payment = resolveInitialPurchasePayment(
      totalCost,
      input.paymentStatus,
      input.initialPaidAmount,
    );
    const dueDate = parsePurchaseDueDate(payment.paymentStatus, input.dueDate);
    const receivedAt = new Date(`${input.receivedAt}T00:00:00`);
    if (Number.isNaN(receivedAt.getTime())) {
      return { success: false, error: "Tanggal penerimaan tidak valid." };
    }
    const purchaseCode = await generatePurchaseCode();

    await (await requireTenantPrisma()).$transaction(async (tx) => {
      const purchase = await tx.purchase.create({
        data: {
          code:         purchaseCode,
          type:         "PACKAGING",
          supplierId:   input.supplierId,
          packagingId:  input.packagingId,
          quantityUnits: input.quantityUnits,
          pricePerUnit: input.pricePerUnit,
          shippingCost: input.shippingCost,
          totalCost,
          status:       "COMPLETED",
          paymentStatus: payment.paymentStatus,
          paidAmount:   payment.paidAmount,
          dueDate,
          receivedAt,
          notes:        input.notes ?? null,
          createdById:  userId,
        },
      });

      if (payment.paidAmount > 0) {
        await tx.supplierPayment.create({
          data: {
            code: generateSupplierPaymentCode(receivedAt),
            purchaseId: purchase.id,
            amount: payment.paidAmount,
            method: input.paymentMethod ?? "CASH",
            paidAt: receivedAt,
            notes: payment.paymentStatus === "PARTIAL" ? "Uang muka pembelian" : "Pembayaran pembelian",
            createdById: userId,
          },
        });
      }

      await appendLedger(tx, {
        data: {
          packagingId:  input.packagingId,
          entryType:    "IN",
          refType:      "PURCHASE_PKG",
          refId:        purchase.id,
          quantityUnit: input.quantityUnits,
          incomingPrice: totalCost / input.quantityUnits,
          notes:        `Kemasan datang: ${purchase.code}`,
          createdById:  userId,
        },
      });

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "Purchase",
        entityId: purchase.id,
        after: {
          code: purchase.code,
          type: purchase.type,
          totalCost: Number(purchase.totalCost),
          paymentStatus: purchase.paymentStatus,
          paidAmount: Number(purchase.paidAmount),
        },
      });
    });

    revalidatePath("/inventory");
    return { success: true, purchaseCode };
  } catch (err) {
    console.error("[createPackagingPurchase]", err);
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan." };
  }
}
// =============================================================================
// CREATE PACKAGING (QUICK ADD)
// =============================================================================

export async function createPackaging(data: {
  code: string;
  name: string;
  weightGrams: number;
  costPerUnit: number;
}) {
  try {
    await requireRole("OWNER", "MANAGER");
    const newPkg = await (await requireTenantPrisma()).packaging.create({
      data: {
        code: data.code,
        name: data.name,
        weightGrams: data.weightGrams,
        costPerUnit: data.costPerUnit,
        isActive: true,
      },
    });

    // Refresh halaman agar dropdown kemasan otomatis mendapatkan data terbaru
    revalidatePath("/inventory"); 

    return { success: true as const, packagingId: newPkg.id };
  } catch (err) {
    console.error("[createPackaging]", err);
    return { 
      success: false as const, 
      error: "Gagal menyimpan kemasan. Pastikan kode kemasan unik dan belum digunakan." 
    };
  }
}
// =============================================================================
// STOCK OPNAME (ADJUSTMENT)
// =============================================================================

export async function adjustStock(input: {
  targetId: string;
  isPackaging: boolean;
  type: "IN" | "OUT";
  quantity: number;
  notes: string;
}) {
  try {
    await requireRole("OWNER", "MANAGER", "OPERATOR");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    
    // Validasi input
    if (input.quantity <= 0) {
      throw new Error("Kuantitas penyesuaian harus lebih dari 0");
    }

    await (await requireTenantPrisma()).$transaction(async (tx) => {
      let qtyKg: number | null = null;
      let qtyUnit: number | null = null;
      const refType: "ADJUSTMENT_IN" | "ADJUSTMENT_OUT" = input.type === "IN" ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT";

      if (input.isPackaging) {
        qtyUnit = input.quantity;
      } else {
        const prod = await tx.product.findUnique({ where: { id: input.targetId } });
        if (!prod) throw new Error("Produk tidak ditemukan");
        if (prod.type === "FINISHED_GOODS") {
          qtyUnit = input.quantity;
        } else {
          qtyKg = input.quantity;
        }
      }

      await appendLedger(tx, {
        data: {
          productId:   input.isPackaging ? null : input.targetId,
          packagingId: input.isPackaging ? input.targetId : null,
          entryType:   input.type,
          refType,
          refId:       "OPNAME-" + Date.now(),
          quantityKg:  qtyKg,
          quantityUnit: qtyUnit,
          notes:       input.notes || "Penyesuaian stok fisik (Opname)",
          createdById: userId,
        }
      });

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "ADJUST",
        entityType: input.isPackaging ? "PackagingStock" : "ProductStock",
        entityId: input.targetId,
        metadata: {
          direction: input.type,
          quantity: input.quantity,
          notes: input.notes,
        },
      });
    });

    revalidatePath("/inventory");
    return { success: true };
  } catch (err) {
    console.error("[adjustStock]", err);
    return { success: false, error: err instanceof Error ? err.message : "Terjadi kesalahan." };
  }
}
