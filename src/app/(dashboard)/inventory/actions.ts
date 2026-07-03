"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

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
  suppliers: SupplierOption[];
  gbProducts: GBProductOption[];
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
  notes?: string;
};

export type PackagingPurchaseInput = {
  supplierId: string;
  receivedAt: string;
  packagingId: string;
  quantityUnits: number;
  pricePerUnit: number;
  shippingCost: number;
  notes?: string;
};

export type ActionResult =
  | { success: true; purchaseCode: string }
  | { success: false; error: string };

// =============================================================================
// HELPERS
// =============================================================================

/** Upsert system user untuk dev (sebelum auth diimplementasi). */
async function getSystemUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: "system@ros.internal" },
    create: {
      name: "System",
      email: "system@ros.internal",
      password: "",
      role: "OWNER",
    },
    update: {},
    select: { id: true },
  });
  return user.id;
}

/** Generate kode Purchase: PUR-YYYYMM-NNN */
async function generatePurchaseCode(): Promise<string> {
  const now = new Date();
  const prefix = `PUR-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.purchase.count({
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
  const existing = await prisma.product.count({
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
  const products = await prisma.product.findMany({
    where: { type, isActive: true },
    include: {
      ledgerEntries: {
        select: { entryType: true, quantityKg: true },
      },
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
    const stockKg = p.ledgerEntries.reduce((sum, e) => {
      const qty = Number(e.quantityKg ?? 0);
      return e.entryType === "IN" ? sum + qty : sum - qty;
    }, 0);

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
      stockKg,
      latestHppPerKg,
    };
  });
}

async function fetchPackagingStocks(): Promise<PackagingStockRow[]> {
  const packagings = await prisma.packaging.findMany({
    where: { isActive: true },
    include: {
      ledgerEntries: {
        select: { entryType: true, quantityUnit: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return packagings.map((pkg) => {
    const stockUnit = pkg.ledgerEntries.reduce((sum, e) => {
      const qty = e.quantityUnit ?? 0;
      return e.entryType === "IN" ? sum + qty : sum - qty;
    }, 0);

    return {
      id: pkg.id,
      code: pkg.code,
      name: pkg.name,
      weightGrams: Number(pkg.weightGrams),
      costPerUnit: Number(pkg.costPerUnit),
      stockUnit,
    };
  });
}

// =============================================================================
// PUBLIC SERVER ACTIONS
// =============================================================================

/** Ambil semua data yang dibutuhkan halaman Inventory. */
export async function getInventoryPageData(): Promise<InventoryPageData> {
  const [gbStocks, rbStocks, pkgStocks, suppliers, gbProducts] =
    await Promise.all([
      fetchProductStocks("GREEN_BEAN"),
      fetchProductStocks("ROASTED_BEAN"),
      fetchPackagingStocks(),
      prisma.supplier.findMany({
        where: { isActive: true },
        select: { id: true, code: true, name: true },
        orderBy: { name: "asc" },
      }),
      prisma.product.findMany({
        where: { type: "GREEN_BEAN", isActive: true },
        select: { id: true, name: true, origin: true },
        orderBy: { name: "asc" },
      }),
    ]);

  return { gbStocks, rbStocks, pkgStocks, suppliers, gbProducts };
}

// Tambah packaging options ke page data helper
export async function getPackagingOptions() {
  return prisma.packaging.findMany({
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
    const userId = await getSystemUserId();

    // 1. Find or create Product
    let product = input.productId
      ? await prisma.product.findUnique({ where: { id: input.productId } })
      : null;

    if (!product && input.productName) {
      const code = await generateProductCode(input.productName);
      product = await prisma.product.upsert({
        where: { code },
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

    // 3. Generate kode
    const purchaseCode = await generatePurchaseCode();

    // 4. ACID transaction
    await prisma.$transaction(async (tx) => {
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
          receivedAt: new Date(input.receivedAt),
          notes: input.notes ?? null,
          createdById: userId,
        },
      });

      await tx.inventoryLedger.create({
        data: {
          productId: product!.id,
          entryType: "IN",
          refType: "PURCHASE_GB",
          refId: purchase.id,
          quantityKg: weightKg,
          notes: `Barang datang: ${purchase.code}`,
          createdById: userId,
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
    const userId = await getSystemUserId();

    const packaging = await prisma.packaging.findUnique({
      where: { id: input.packagingId },
    });
    if (!packaging) return { success: false, error: "Kemasan tidak ditemukan." };

    const totalCost = input.pricePerUnit * input.quantityUnits + input.shippingCost;
    const purchaseCode = await generatePurchaseCode();

    await prisma.$transaction(async (tx) => {
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
          receivedAt:   new Date(input.receivedAt),
          notes:        input.notes ?? null,
          createdById:  userId,
        },
      });

      await tx.inventoryLedger.create({
        data: {
          packagingId:  input.packagingId,
          entryType:    "IN",
          refType:      "PURCHASE_PKG",
          refId:        purchase.id,
          quantityUnit: input.quantityUnits,
          notes:        `Kemasan datang: ${purchase.code}`,
          createdById:  userId,
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
