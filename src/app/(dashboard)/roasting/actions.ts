"use server";

import { revalidatePath } from "next/cache";
import { appendLedger } from "@/lib/stock";
import { getCurrentTenantId, getSystemUserId, requireRole, requireTenantPrisma } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { randomBytes } from "crypto";
import { validateRoastingWeights } from "@/lib/operations";
import { getCurrentDate } from "@/lib/date-utils";

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

export type ParentRoastingBatchRow = {
  id: string;
  code: string;
  inputProductName: string;
  outputProductName: string;
  targetWeightKg: number;
  actualOutputKg: number | null;
  totalShrinkagePercent: number | null;
  status: string;
  createdAt: string;
  notes: string | null;
};

export type RoastingPageData = {
  batches: ParentRoastingBatchRow[];
  gbOptions: GBStockOption[];
  rbOptions: RBProductOption[];
};

export type CreateParentRoastingBatchInput = {
  mode: "ARTISAN" | "MANUAL";
  inputProductId: string;
  targetWeightKg: number;
  outputMode: "existing" | "new";
  outputProductId?: string;
  outputProductName?: string;
  outputProductOrigin?: string;
  outputRoastLevel?: string;
  actualOutputKg?: number;
  notes?: string;
};

export type RoastingActionResult =
  | { success: true; batchCode: string }
  | { success: false; error: string };

// =============================================================================
// HELPERS
// =============================================================================

async function generateBatchCode(): Promise<string> {
  const now = getCurrentDate();
  const prefix = `RST-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const randStr = randomBytes(4).toString("hex").toUpperCase();
  return `${prefix}-${randStr}`;
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
    select: { id: true, name: true, origin: true, stockKg: true },
    orderBy: { name: "asc" },
  });

  return products
    .map((p) => ({
      id: p.id,
      name: p.name,
      origin: p.origin,
      stockKg: Number(p.stockKg),
    }))
    .filter((p) => p.stockKg > 0);
}

async function fetchRBOptions(): Promise<RBProductOption[]> {
  return (await requireTenantPrisma()).product.findMany({
    where: { type: "ROASTED_BEAN", isActive: true },
    select: { id: true, name: true, origin: true, roastLevel: true },
    orderBy: { name: "asc" },
  });
}

async function fetchBatchHistory(): Promise<ParentRoastingBatchRow[]> {
  const batches = await (await requireTenantPrisma()).parentRoastingBatch.findMany({
    orderBy: { createdAt: "desc" },
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
    targetWeightKg:     Number(b.targetWeightKg),
    actualOutputKg:    b.actualOutputKg ? Number(b.actualOutputKg) : null,
    totalShrinkagePercent: b.totalShrinkagePercent ? Number(b.totalShrinkagePercent) : null,
    status:            b.status,
    notes:             b.notes,
    createdAt:         b.createdAt.toISOString(),
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

export async function createParentRoastingBatch(
  input: CreateParentRoastingBatchInput
): Promise<RoastingActionResult> {
  try {
    await requireRole("OWNER", "MANAGER", "OPERATOR");
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    const weightError = validateRoastingWeights(input);
    if (weightError) return { success: false, error: weightError };

    const tp = await requireTenantPrisma();
    const inputProduct = await tp.product.findUnique({
      where: { id: input.inputProductId },
      select: { type: true, isActive: true, stockKg: true, avgCostPerKg: true },
    });
    if (!inputProduct || !inputProduct.isActive || inputProduct.type !== "GREEN_BEAN") {
      return { success: false, error: "Produk input harus Green Bean aktif." };
    }
    const currentStock = Number(inputProduct.stockKg);
    if (currentStock < input.targetWeightKg) {
      return {
        success: false,
        error: `Stok Green Bean tidak cukup. Tersedia: ${currentStock.toFixed(3)} kg, dibutuhkan: ${input.targetWeightKg.toFixed(3)} kg.`,
      };
    }

    let outputProduct = input.outputProductId
      ? await tp.product.findUnique({ where: { id: input.outputProductId } })
      : null;
    if (outputProduct && (outputProduct.type !== "ROASTED_BEAN" || !outputProduct.isActive)) {
      return { success: false, error: "Produk output harus Roasted Bean aktif." };
    }

    if (!outputProduct && input.outputProductName) {
      const code = await generateRBCode(input.outputProductName);
      outputProduct = await tp.product.upsert({
        where: { tenantId_code: { tenantId, code } },
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

    let totalShrinkagePercent = null;
    if (input.mode === "MANUAL") {
      totalShrinkagePercent = ((input.targetWeightKg - Number(input.actualOutputKg)) / input.targetWeightKg) * 100;
    }

    const batchCode = await generateBatchCode();

    await tp.$transaction(async (tx) => {
      const batch = await tx.parentRoastingBatch.create({
        data: {
          code: batchCode,
          inputProductId:   input.inputProductId,
          targetWeightKg:   input.targetWeightKg,
          outputProductId:  outputProduct!.id,
          actualOutputKg:   input.mode === "MANUAL" ? Number(input.actualOutputKg) : null,
          totalShrinkagePercent: totalShrinkagePercent,
          status:           input.mode === "MANUAL" ? "COMPLETED" : "PENDING",
          notes:            input.notes?.trim() || null,
          completedAt:      input.mode === "MANUAL" ? getCurrentDate() : null,
          createdById:      userId,
        },
      });

      // Always deduct GB immediately
      await appendLedger(tx, {
        data: {
          productId:   input.inputProductId,
          entryType:   "OUT",
          refType:     "ROASTING_GB_OUT",
          refId:       batch.id,
          quantityKg:  input.targetWeightKg,
          notes:       `Roasting: ${batch.code}`,
          createdById: userId,
        },
      });

      // If MANUAL, also add RB immediately
      if (input.mode === "MANUAL") {
        await appendLedger(tx, {
          data: {
            productId:   outputProduct!.id,
            entryType:   "IN",
            refType:     "ROASTING_RB_IN",
            refId:       batch.id,
            quantityKg:  Number(input.actualOutputKg),
            incomingPrice: (Number(inputProduct.avgCostPerKg ?? 0) * input.targetWeightKg) / Number(input.actualOutputKg),
            notes:       `Roasting: ${batch.code}`,
            createdById: userId,
          },
        });
      }

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "CREATE",
        entityType: "ParentRoastingBatch",
        entityId: batch.id,
        after: {
          code: batch.code,
          mode: input.mode,
          status: batch.status,
          targetWeightKg: Number(batch.targetWeightKg),
          actualOutputKg: batch.actualOutputKg
            ? Number(batch.actualOutputKg)
            : null,
        },
      });
    });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    return { success: true, batchCode };
  } catch (err) {
    console.error("[createParentRoastingBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
    };
  }
}

export async function completeParentRoastingBatch(
  batchId: string,
  actualOutputKg: number
): Promise<RoastingActionResult> {
  try {
    await requireRole("OWNER", "MANAGER", "OPERATOR");
    if (!Number.isFinite(actualOutputKg) || actualOutputKg <= 0) {
      return { success: false, error: "Berat hasil harus lebih dari 0." };
    }
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    const tenantPrisma = await requireTenantPrisma();

    const batchCode = await tenantPrisma.$transaction(async (tx) => {
      const batch = await tx.parentRoastingBatch.findUnique({ 
        where: { id: batchId },
        include: { inputProduct: { select: { avgCostPerKg: true } } }
      });
      if (!batch || batch.status !== "PENDING") {
        throw new Error("Batch tidak valid atau sudah selesai.");
      }
      if (actualOutputKg >= Number(batch.targetWeightKg)) {
        throw new Error("Berat keluar tidak boleh >= berat masuk.");
      }
      const totalShrinkagePercent =
        ((Number(batch.targetWeightKg) - actualOutputKg) / Number(batch.targetWeightKg)) * 100;
      const claimed = await tx.parentRoastingBatch.updateMany({
        where: { id: batchId, status: "PENDING" },
        data: {
          actualOutputKg,
          totalShrinkagePercent,
          status: "COMPLETED",
          completedAt: getCurrentDate(),
        },
      });
      if (claimed.count !== 1) {
        throw new Error("Batch sudah diselesaikan oleh proses lain.");
      }

      await appendLedger(tx, {
        data: {
          productId:   batch.outputProductId,
          entryType:   "IN",
          refType:     "ROASTING_RB_IN",
          refId:       batch.id,
          quantityKg:  actualOutputKg,
          incomingPrice: (Number(batch.inputProduct.avgCostPerKg ?? 0) * Number(batch.targetWeightKg)) / actualOutputKg,
          notes:       `Roasting: ${batch.code}`,
          createdById: userId,
        },
      });

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "COMPLETE",
        entityType: "ParentRoastingBatch",
        entityId: batch.id,
        before: { status: batch.status },
        after: {
          status: "COMPLETED",
          actualOutputKg,
          totalShrinkagePercent,
        },
      });
      return batch.code;
    }, { isolationLevel: "Serializable" });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    return { success: true, batchCode };
  } catch (err) {
    console.error("[completeParentRoastingBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Terjadi kesalahan sistem.",
    };
  }
}

export type VoidResult =
  | { success: true }
  | { success: false; error: string };

export async function voidParentRoastingBatch(
  batchId: string,
  reason: string
): Promise<VoidResult> {
  try {
    await requireRole("OWNER", "MANAGER");
    if (!reason.trim()) {
      return { success: false, error: "Alasan void wajib diisi." };
    }
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();

    await (await requireTenantPrisma()).$transaction(async (tx) => {
      const batch = await tx.parentRoastingBatch.findUnique({
        where: { id: batchId },
      });
      if (!batch) throw new Error("Batch tidak ditemukan.");
      if (batch.status === "VOID") throw new Error("Batch sudah divoid.");

      await tx.parentRoastingBatch.update({
        where: { id: batchId },
        data: {
          status: "VOID",
          voidReason: reason.trim(),
          voidAt: getCurrentDate(),
        },
      });

      // Return GB (Always)
      await appendLedger(tx, {
        data: {
          productId:   batch.inputProductId,
          entryType:   "IN",
          refType:     "VOID_REVERSAL",
          refId:       batch.id,
          quantityKg:  batch.targetWeightKg,
          notes:       `Reversal Roasting: ${batch.code}`,
          createdById: userId,
        },
      });

      // Return RB only if it was COMPLETED (RB was added)
      if (batch.status === "COMPLETED" && batch.actualOutputKg) {
        await appendLedger(tx, {
          data: {
            productId:   batch.outputProductId,
            entryType:   "OUT",
            refType:     "VOID_REVERSAL",
            refId:       batch.id,
            quantityKg:  batch.actualOutputKg,
            notes:       `Reversal Roasting: ${batch.code}`,
            createdById: userId,
          },
        });
      }

      await recordAudit(tx, {
        tenantId,
        userId,
        action: "VOID",
        entityType: "ParentRoastingBatch",
        entityId: batch.id,
        before: { status: batch.status },
        after: { status: "VOID", reason: reason.trim() },
      });
    }, { isolationLevel: "Serializable" });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    return { success: true };
  } catch (err) {
    console.error("[voidParentRoastingBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membatalkan batch.",
    };
  }
}
