"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { computeKgStock, computeUnitStock } from "@/lib/stock";
import { getSystemUserId } from "@/lib/auth";

// =============================================================================
// TYPES
// =============================================================================

/** Satu komponen RB dalam produksi (actual — bukan template resep). */
export type RBComponentInput = {
  productId: string;
  productName: string;   // hanya untuk display; server validasi via productId
  actualGrams: number;   // total gram yang BENAR-BENAR dipakai dalam batch ini
};

export type CreateProductionBatchInput = {
  outputProductId: string;
  recipeId?: string;           // template yang dipakai sebagai saran (boleh null)
  packagingId: string;
  unitsProduced: number;
  rbComponents: RBComponentInput[];
  notes?: string;
};

export type ProductionActionResult =
  | { success: true; batchCode: string }
  | { success: false; error: string };

// ── Page data ──

export type FGProductOption = {
  id: string;
  code: string;
  name: string;
  /** Recipe terkait jika ada, berisi saran komponen */
  recipe: RecipeSuggestion | null;
};

export type RecipeSuggestion = {
  id: string;
  outputGrams: number;
  packagingId: string;
  packagingName: string;
  items: RecipeItemSuggestion[];
};

export type RecipeItemSuggestion = {
  productId: string;
  productName: string;
  ratioPercent: number;
  gramsPerUnit: number;  // gram RB per 1 unit output (dari resep)
};

export type RBStockOption = {
  id: string;
  name: string;
  roastLevel: string | null;
  stockKg: number;
};

export type PackagingOption = {
  id: string;
  name: string;
  costPerUnit: number;
  stockUnit: number;
};

export type ProductionBatchRow = {
  id: string;
  code: string;
  outputProductName: string;
  packagingName: string;
  unitsProduced: number;
  totalRbUsedKg: number;
  hppPerUnit: number;
  producedAt: string;
  status: string;
  notes: string | null;
  recipeUsed: string | null;
};

export type ProductionPageData = {
  batches: ProductionBatchRow[];
  fgOptions: FGProductOption[];
  rbOptions: RBStockOption[];
  packagingOptions: PackagingOption[];
};

// =============================================================================
// HELPERS
// =============================================================================


async function generateBatchCode(): Promise<string> {
  const now = new Date();
  const prefix = `PRD-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await prisma.productionBatch.count({ where: { code: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

// =============================================================================
// QUERIES
// =============================================================================

async function fetchFGOptions(): Promise<FGProductOption[]> {
  const products = await prisma.product.findMany({
    where: { type: "FINISHED_GOODS", isActive: true },
    include: {
      recipes: {
        where: { isActive: true },
        take: 1,
        include: {
          packaging: { select: { id: true, name: true } },
          items: {
            include: {
              product: { select: { id: true, name: true } },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  return products.map((p) => {
    const recipe = p.recipes[0] ?? null;
    return {
      id: p.id,
      code: p.code,
      name: p.name,
      recipe: recipe
        ? {
            id: recipe.id,
            outputGrams: Number(recipe.outputGrams),
            packagingId: recipe.packagingId,
            packagingName: recipe.packaging.name,
            items: recipe.items.map((item) => ({
              productId: item.productId,
              productName: item.product.name,
              ratioPercent: Number(item.ratioPercent),
              gramsPerUnit: Number(item.gramsPerUnit),
            })),
          }
        : null,
    };
  });
}

async function fetchRBOptions(): Promise<RBStockOption[]> {
  const products = await prisma.product.findMany({
    where: { type: "ROASTED_BEAN", isActive: true },
    include: { ledgerEntries: { select: { entryType: true, quantityKg: true } } },
    orderBy: { name: "asc" },
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      roastLevel: p.roastLevel,
      stockKg: p.ledgerEntries.reduce((sum, e) => {
        const q = Number(e.quantityKg ?? 0);
        return e.entryType === "IN" ? sum + q : sum - q;
      }, 0),
    }))
    .filter((p) => p.stockKg > 0);
}

async function fetchPackagingOptions(): Promise<PackagingOption[]> {
  const pkgs = await prisma.packaging.findMany({
    where: { isActive: true },
    include: { ledgerEntries: { select: { entryType: true, quantityUnit: true } } },
    orderBy: { name: "asc" },
  });
  return pkgs
    .map((pkg) => ({
      id: pkg.id,
      name: pkg.name,
      costPerUnit: Number(pkg.costPerUnit),
      stockUnit: pkg.ledgerEntries.reduce(
        (sum, e) =>
          e.entryType === "IN" ? sum + (e.quantityUnit ?? 0) : sum - (e.quantityUnit ?? 0),
        0
      ),
    }))
    .filter((p) => p.stockUnit > 0);
}

async function fetchBatchHistory(): Promise<ProductionBatchRow[]> {
  const batches = await prisma.productionBatch.findMany({
    orderBy: { producedAt: "desc" },
    take: 100,
    include: {
      outputProduct: { select: { name: true } },
      packaging:     { select: { name: true } },
      recipe:        { select: { name: true } },
    },
  });

  return batches.map((b) => ({
    id: b.id,
    code: b.code,
    outputProductName: b.outputProduct.name,
    packagingName:     b.packaging.name,
    unitsProduced:     b.unitsProduced,
    totalRbUsedKg:     Number(b.totalRbUsedKg),
    hppPerUnit:        Number(b.hppPerUnit),
    producedAt:        b.producedAt.toISOString(),
    status:            b.status,
    notes:             b.notes,
    recipeUsed:        b.recipe?.name ?? null,
  }));
}

// =============================================================================
// PUBLIC SERVER ACTIONS
// =============================================================================

export async function getProductionPageData(): Promise<ProductionPageData> {
  const [batches, fgOptions, rbOptions, packagingOptions] = await Promise.all([
    fetchBatchHistory(),
    fetchFGOptions(),
    fetchRBOptions(),
    fetchPackagingOptions(),
  ]);
  return { batches, fgOptions, rbOptions, packagingOptions };
}

/**
 * Catat Batch Produksi.
 *
 * ACID transaction:
 *   1. Validasi: setiap komponen RB stok cukup
 *   2. Validasi: packaging stok cukup
 *   3. Hitung HPP snapshot = (sum RB cost + packaging cost) / unitsProduced
 *   4. INSERT ProductionBatch
 *   5. For each RB component → INSERT InventoryLedger: RB OUT
 *   6. INSERT InventoryLedger: PKG OUT
 *   7. INSERT InventoryLedger: FG IN
 */
export async function createProductionBatch(
  input: CreateProductionBatchInput
): Promise<ProductionActionResult> {
  try {
    if (input.rbComponents.length === 0) {
      return { success: false, error: "Minimal satu komponen Roasted Bean diperlukan." };
    }
    if (input.unitsProduced < 1) {
      return { success: false, error: "Jumlah unit yang diproduksi minimal 1." };
    }

    const userId = await getSystemUserId();

    // 1. Ambil data packaging untuk validasi stok & HPP
    const packaging = await prisma.packaging.findUnique({
      where: { id: input.packagingId },
      select: { id: true, name: true, costPerUnit: true },
    });
    if (!packaging) return { success: false, error: "Packaging tidak ditemukan." };

    // 2. Validasi stok packaging
    const pkgStock = await computeUnitStock(input.packagingId);
    if (pkgStock < input.unitsProduced) {
      return {
        success: false,
        error: `Stok packaging tidak cukup. Tersedia: ${pkgStock} pcs, dibutuhkan: ${input.unitsProduced} pcs.`,
      };
    }

    // 3. Validasi & hitung HPP setiap komponen RB
    let totalRbCost = 0;
    let totalRbUsedKg = 0;

    const rbDetails: Array<{
      productId: string;
      actualKg: number;
      hppPerKg: number;
    }> = [];

    for (const comp of input.rbComponents) {
      const actualKg = comp.actualGrams / 1000;
      if (actualKg <= 0) continue;

      // Validasi stok RB
      const rbStock = await computeKgStock(comp.productId);
      if (rbStock < actualKg) {
        const rbProduct = await prisma.product.findUnique({
          where: { id: comp.productId },
          select: { name: true },
        });
        return {
          success: false,
          error: `Stok "${rbProduct?.name ?? comp.productId}" tidak cukup. Tersedia: ${rbStock.toFixed(3)} kg, dibutuhkan: ${actualKg.toFixed(3)} kg.`,
        };
      }

      // Ambil HPP RB dari roasting batch terakhir via ledger (masuk dari ROASTING_RB_IN)
      const lastRbLedger = await prisma.inventoryLedger.findFirst({
        where: { productId: comp.productId, entryType: "IN", refType: "ROASTING_RB_IN" },
        orderBy: { createdAt: "desc" },
        select: { refId: true },
      });

      let hppPerKg = 0;
      if (lastRbLedger) {
        const roastBatch = await prisma.roastingBatch.findUnique({
          where: { id: lastRbLedger.refId },
          include: {
            inputProduct: {
              include: {
                purchases: {
                  where: { status: "COMPLETED" },
                  orderBy: { receivedAt: "desc" },
                  take: 1,
                  select: { pricePerUnit: true, weightKg: true, shippingCost: true },
                },
              },
            },
          },
        });
        if (roastBatch?.inputProduct.purchases[0]) {
          const pur = roastBatch.inputProduct.purchases[0];
          const wKg = Number(pur.weightKg ?? 0);
          if (wKg > 0) {
            const gbHppPerKg = (Number(pur.pricePerUnit) * wKg + Number(pur.shippingCost ?? 0)) / wKg;
            // RB HPP = GB HPP / (1 - shrinkage/100)
            const shrinkage = Number(roastBatch.roastLossPercent) / 100;
            hppPerKg = shrinkage < 1 ? gbHppPerKg / (1 - shrinkage) : gbHppPerKg;
          }
        }
      }

      totalRbCost += hppPerKg * actualKg;
      totalRbUsedKg += actualKg;
      rbDetails.push({ productId: comp.productId, actualKg, hppPerKg });
    }

    if (totalRbUsedKg === 0) {
      return { success: false, error: "Total berat Roasted Bean yang digunakan adalah 0." };
    }

    // 4. Hitung HPP per unit
    const pkgCostTotal = Number(packaging.costPerUnit) * input.unitsProduced;
    const totalCost = totalRbCost + pkgCostTotal;
    const hppPerUnit = totalCost / input.unitsProduced;

    // 5. Generate kode
    const batchCode = await generateBatchCode();

    // 6. ACID transaction
    await prisma.$transaction(async (tx) => {
      const batch = await tx.productionBatch.create({
        data: {
          code:            batchCode,
          recipeId:        input.recipeId ?? null,
          outputProductId: input.outputProductId,
          packagingId:     input.packagingId,
          unitsProduced:   input.unitsProduced,
          totalRbUsedKg:   totalRbUsedKg,
          hppPerUnit:      hppPerUnit,
          status:          "COMPLETED",
          notes:           input.notes ?? null,
          createdById:     userId,
        },
      });

      // RB keluar per komponen
      for (const rb of rbDetails) {
        await tx.inventoryLedger.create({
          data: {
            productId:   rb.productId,
            entryType:   "OUT",
            refType:     "PRODUCTION_RB_OUT",
            refId:       batch.id,
            quantityKg:  rb.actualKg,
            notes:       `Produksi: ${batch.code}`,
            createdById: userId,
          },
        });
      }

      // Packaging keluar
      await tx.inventoryLedger.create({
        data: {
          packagingId:  input.packagingId,
          entryType:    "OUT",
          refType:      "PRODUCTION_PKG_OUT",
          refId:        batch.id,
          quantityUnit: input.unitsProduced,
          notes:        `Produksi: ${batch.code}`,
          createdById:  userId,
        },
      });

      // Finished Goods masuk
      await tx.inventoryLedger.create({
        data: {
          productId:    input.outputProductId,
          entryType:    "IN",
          refType:      "PRODUCTION_FG_IN",
          refId:        batch.id,
          quantityUnit: input.unitsProduced,
          notes:        `Produksi: ${batch.code}`,
          createdById:  userId,
        },
      });
    });

    revalidatePath("/produksi");
    revalidatePath("/inventory");
    return { success: true, batchCode };
  } catch (err) {
    console.error("[createProductionBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
    };
  }
}

// =============================================================================
// VOID PRODUCTION BATCH
// =============================================================================

export type VoidResult =
  | { success: true }
  | { success: false; error: string };

export async function voidProductionBatch(
  batchId: string,
  reason: string
): Promise<VoidResult> {
  try {
    const userId = await getSystemUserId();

    const batch = await prisma.productionBatch.findUnique({
      where: { id: batchId },
      include: {
        outputProduct: { select: { id: true } },
      },
    });

    if (!batch) return { success: false, error: "Batch tidak ditemukan." };
    if (batch.status === "VOID") return { success: false, error: "Batch sudah di-void." };

    // Ambil semua ledger entries milik batch ini
    const ledgerEntries = await prisma.inventoryLedger.findMany({
      where: { refId: batchId, refType: { in: ["PRODUCTION_RB_OUT", "PRODUCTION_PKG_OUT", "PRODUCTION_FG_IN"] } },
    });

    await prisma.$transaction(async (tx) => {
      // Balik setiap ledger entry
      for (const entry of ledgerEntries) {
        await tx.inventoryLedger.create({
          data: {
            productId:    entry.productId,
            packagingId:  entry.packagingId,
            entryType:    entry.entryType === "IN" ? "OUT" : "IN",
            refType:      "VOID_REVERSAL",
            refId:        batchId,
            quantityKg:   entry.quantityKg,
            quantityUnit: entry.quantityUnit,
            notes:        `VOID reversal: ${batch.code}`,
            createdById:  userId,
          },
        });
      }

      await tx.productionBatch.update({
        where: { id: batchId },
        data: { status: "VOID", voidReason: reason, voidAt: new Date() },
      });
    });

    revalidatePath("/produksi");
    revalidatePath("/inventory");
    return { success: true };
  } catch (err) {
    console.error("[voidProductionBatch]", err);
    return { success: false, error: "Gagal melakukan void." };
  }
}
