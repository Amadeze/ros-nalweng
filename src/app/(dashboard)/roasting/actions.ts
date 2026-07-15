"use server";

import { revalidatePath } from "next/cache";
import { computeKgStock, appendLedger } from "@/lib/stock";
import { getSystemUserId, requireTenantPrisma } from "@/lib/auth";

// =============================================================================
// TYPES
// =============================================================================

export type GBStockOption = {
  id: string;
  name: string;
  origin: string | null;
  stockKg: number;
};

export type RBProductOption = {
  id: string;
  name: string;
  origin: string | null;
  roastLevel: string | null;
};

export type RoastingBatchRow = {
  id: string;
  code: string;
  inputProductName: string;
  outputProductName: string;
  inputWeightKg: number;
  outputWeightKg: number;
  roastLossPercent: number;
  roastDurationMin: number | null;
  roastedAt: string;   // ISO string — serializable
  status: string;
  notes: string | null;
};

export type RoastingPageData = {
  batches: RoastingBatchRow[];
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
};

export type CreateRoastingBatchInput = {
  inputProductId: string;
  inputWeightKg: number;
  outputMode: "existing" | "new";
  outputProductId?: string;
  outputProductName?: string;
  outputProductOrigin?: string;
  outputRoastLevel?: string;
  outputWeightKg: number;
  roastDurationMin?: number;
  notes?: string;
};

export type RoastingActionResult =
  | { success: true; batchCode: string }
  | { success: false; error: string };

// =============================================================================
// HELPERS
// =============================================================================


async function generateBatchCode(): Promise<string> {
  const now = new Date();
  const prefix = `RST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const count = await (await requireTenantPrisma()).roastingBatch.count({
    where: { code: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(3, "0")}`;
}

async function generateRBCode(name: string): Promise<string> {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
  const prefix = `RB-${slug}`;
  const existing = await (await requireTenantPrisma()).product.count({
    where: { code: { startsWith: prefix } },
  });
  return existing === 0 ? prefix : `${prefix}-${existing + 1}`;
}

// =============================================================================
// QUERIES
// =============================================================================

async function fetchGBOptions(): Promise<GBStockOption[]> {
  const products = await (await requireTenantPrisma()).product.findMany({
    where: { type: "GREEN_BEAN", isActive: true },
    include: {
      ledgerEntries: { select: { entryType: true, quantityKg: true } },
    },
    orderBy: { name: "asc" },
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      origin: p.origin,
      stockKg: p.ledgerEntries.reduce((sum, e) => {
        const qty = Number(e.quantityKg ?? 0);
        return e.entryType === "IN" ? sum + qty : sum - qty;
      }, 0),
    }))
    .filter((p) => p.stockKg > 0); // hanya tampilkan GB yang ada stoknya
}

async function fetchRBOptions(): Promise<RBProductOption[]> {
  return (await requireTenantPrisma()).product.findMany({
    where: { type: "ROASTED_BEAN", isActive: true },
    select: { id: true, name: true, origin: true, roastLevel: true },
    orderBy: { name: "asc" },
  });
}

async function fetchBatchHistory(): Promise<RoastingBatchRow[]> {
  const batches = await (await requireTenantPrisma()).roastingBatch.findMany({
    orderBy: { roastedAt: "desc" },
    take: 100,
    include: {
      inputProduct:  { select: { name: true } },
      outputProduct: { select: { name: true } },
    },
  });

  return batches.map((b) => ({
    id: b.id,
    code: b.code,
    inputProductName:  b.inputProduct.name,
    outputProductName: b.outputProduct.name,
    inputWeightKg:     Number(b.inputWeightKg),
    outputWeightKg:    Number(b.outputWeightKg),
    roastLossPercent:  Number(b.roastLossPercent),
    roastDurationMin:  b.roastDurationMin,
    roastedAt:         b.roastedAt.toISOString(),
    status:            b.status,
    notes:             b.notes,
  }));
}

// =============================================================================
// PUBLIC SERVER ACTIONS
// =============================================================================

export async function getRoastingPageData(): Promise<RoastingPageData> {
  const [batches, gbOptions, rbOptions] = await Promise.all([
    fetchBatchHistory(),
    fetchGBOptions(),
    fetchRBOptions(),
  ]);
  return { batches, gbOptions, rbOptions };
}

/**
 * Catat Roasting Batch.
 *
 * ACID transaction:
 *   1. Validasi stok GB mencukupi
 *   2. Find-or-create Product Roasted Bean
 *   3. INSERT RoastingBatch (COMPLETED)
 *   4. INSERT InventoryLedger: GB OUT  (refType = ROASTING_GB_OUT)
 *   5. INSERT InventoryLedger: RB IN   (refType = ROASTING_RB_IN)
 *   6. Hitung roastLossPercent otomatis = (in - out) / in * 100
 */
export async function createRoastingBatch(
  input: CreateRoastingBatchInput
): Promise<RoastingActionResult> {
  try {
    const userId = await getSystemUserId();

    // 1. Validasi stok GB
    const currentStock = await computeKgStock(input.inputProductId);
    if (currentStock < input.inputWeightKg) {
      return {
        success: false,
        error: `Stok Green Bean tidak cukup. Tersedia: ${currentStock.toFixed(3)} kg, dibutuhkan: ${input.inputWeightKg.toFixed(3)} kg.`,
      };
    }

    // 2. Validasi logika berat
    if (input.outputWeightKg >= input.inputWeightKg) {
      return {
        success: false,
        error: "Berat keluar tidak boleh >= berat masuk. Roasting selalu menghasilkan susut.",
      };
    }

    // 3. Find-or-create output RB product
    let outputProduct = input.outputProductId
      ? await (await requireTenantPrisma()).product.findUnique({ where: { id: input.outputProductId } })
      : null;

    if (!outputProduct && input.outputProductName) {
      const code = await generateRBCode(input.outputProductName);
      outputProduct = await (await requireTenantPrisma()).product.upsert({
        where: { code },
        create: {
          code,
          name: input.outputProductName,
          type: "ROASTED_BEAN",
          origin: input.outputProductOrigin ?? null,
          roastLevel: (input.outputRoastLevel as
            | "LIGHT"
            | "MEDIUM"
            | "MEDIUM_DARK"
            | "DARK"
            | null) ?? null,
        },
        update: {},
      });
    }

    if (!outputProduct) {
      return { success: false, error: "Produk Roasted Bean tidak valid." };
    }

    // 4. Hitung shrinkage
    const roastLossPercent =
      ((input.inputWeightKg - input.outputWeightKg) / input.inputWeightKg) * 100;

    // 5. Generate kode
    const batchCode = await generateBatchCode();

    // 6. ACID transaction
    await (await requireTenantPrisma()).$transaction(async (tx) => {
      const batch = await tx.roastingBatch.create({
        data: {
          code: batchCode,
          inputProductId:   input.inputProductId,
          inputWeightKg:    input.inputWeightKg,
          outputProductId:  outputProduct!.id,
          outputWeightKg:   input.outputWeightKg,
          roastLossPercent: roastLossPercent,
          roastDurationMin: input.roastDurationMin ?? null,
          status:           "COMPLETED",
          notes:            input.notes ?? null,
          createdById:      userId,
        },
      });

      // GB keluar
      await appendLedger(tx, {
        data: {
          productId:   input.inputProductId,
          entryType:   "OUT",
          refType:     "ROASTING_GB_OUT",
          refId:       batch.id,
          quantityKg:  input.inputWeightKg,
          notes:       `Roasting: ${batch.code}`,
          createdById: userId,
        },
      });

      // RB masuk
      await appendLedger(tx, {
        data: {
          productId:   outputProduct!.id,
          entryType:   "IN",
          refType:     "ROASTING_RB_IN",
          refId:       batch.id,
          quantityKg:  input.outputWeightKg,
          notes:       `Roasting: ${batch.code}`,
          createdById: userId,
        },
      });
    });

    revalidatePath("/roasting");
    revalidatePath("/inventory"); // stok GB & RB berubah
    return { success: true, batchCode };
  } catch (err) {
    console.error("[createRoastingBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
    };
  }
}

// =============================================================================
// VOID ROASTING BATCH
// =============================================================================

export type VoidResult =
  | { success: true }
  | { success: false; error: string };

export async function voidRoastingBatch(
  batchId: string,
  reason: string
): Promise<VoidResult> {
  try {
    const userId = await getSystemUserId();

    const batch = await (await requireTenantPrisma()).roastingBatch.findUnique({
      where: { id: batchId },
      select: {
        id: true, code: true, status: true,
        inputProductId: true, inputWeightKg: true,
        outputProductId: true, outputWeightKg: true,
      },
    });

    if (!batch) return { success: false, error: "Batch tidak ditemukan." };
    if (batch.status === "VOID") return { success: false, error: "Batch sudah di-void." };

    await (await requireTenantPrisma()).$transaction(async (tx) => {
      // Reversal: kembalikan GB, kurangi RB
      await appendLedger(tx, {
        data: {
          productId:   batch.inputProductId,
          entryType:   "IN",
          refType:     "VOID_REVERSAL",
          refId:       batch.id,
          quantityKg:  batch.inputWeightKg,
          notes:       `VOID reversal: ${batch.code}`,
          createdById: userId,
        },
      });
      await appendLedger(tx, {
        data: {
          productId:   batch.outputProductId,
          entryType:   "OUT",
          refType:     "VOID_REVERSAL",
          refId:       batch.id,
          quantityKg:  batch.outputWeightKg,
          notes:       `VOID reversal: ${batch.code}`,
          createdById: userId,
        },
      });
      await tx.roastingBatch.update({
        where: { id: batch.id },
        data: { status: "VOID", voidReason: reason, voidAt: new Date() },
      });
    });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    return { success: true };
  } catch (err) {
    console.error("[voidRoastingBatch]", err);
    return { success: false, error: "Gagal melakukan void." };
  }
}
