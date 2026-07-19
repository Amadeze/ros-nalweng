"use server";

import { revalidatePath } from "next/cache";
import { appendLedger } from "@/lib/stock";
import { getCurrentTenantId, getSystemUserId, requireRole, requireTenantPrisma } from "@/lib/auth";
import { recordAudit } from "@/lib/audit";
import { randomBytes } from "crypto";
import { validateRoastingWeights } from "@/lib/operations";
import { getCurrentDate } from "@/lib/date-utils";
import { Prisma } from "@prisma/client";
import { analyzeRoastOutcome, type RoastOutcome } from "@/lib/roast-intent";
import { greenBeanIdentity, roastedBeanName, type RoastLevelValue } from "@/lib/roast-product";

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
  sourceGreenBeanId: string | null;
};

export type ParentRoastingBatchRow = {
  id: string;
  code: string;
  inputProductId: string;
  outputProductId: string;
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
  operationKey: string;
  mode: "ARTISAN" | "MANUAL";
  inputProductId: string;
  targetWeightKg: number;
  outputMode: "auto" | "existing" | "new";
  outputProductId?: string;
  outputProductName?: string;
  outputProductOrigin?: string;
  outputRoastLevel?: string;
  actualOutputKg?: number;
  notes?: string;
};

export type RoastingActionResult =
  | { success: true; batchCode: string; outcome?: RoastOutcome }
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

function generateRBCode(name: string): string {
  const slug = name
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 12);
  return `RB-${slug || "BARU"}-${randomBytes(2).toString("hex").toUpperCase()}`;
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
    select: { id: true, name: true, origin: true, roastLevel: true, sourceGreenBeanId: true },
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
    inputProductId: b.inputProductId,
    outputProductId: b.outputProductId,
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
    if (!input.operationKey || !/^[0-9a-f-]{36}$/i.test(input.operationKey)) {
      return { success: false, error: "Identitas transaksi tidak valid. Buka ulang form lalu coba lagi." };
    }
    if (!(["ARTISAN", "MANUAL"] as const).includes(input.mode)) {
      return { success: false, error: "Metode pencatatan roasting tidak valid." };
    }
    const userId = await getSystemUserId();
    const tenantId = await getCurrentTenantId();
    const weightError = validateRoastingWeights(input);
    if (weightError) return { success: false, error: weightError };

    const tenantPrisma = await requireTenantPrisma();
    const previousAttempt = await tenantPrisma.parentRoastingBatch.findFirst({
      where: { operationKey: input.operationKey },
      select: { code: true, targetWeightKg: true, actualOutputKg: true },
    });
    if (previousAttempt) {
      return {
        success: true,
        batchCode: previousAttempt.code,
        outcome: previousAttempt.actualOutputKg
          ? analyzeRoastOutcome(
              Number(previousAttempt.targetWeightKg),
              Number(previousAttempt.actualOutputKg),
            )
          : undefined,
      };
    }

    const roastLevels = ["LIGHT", "MEDIUM", "MEDIUM_DARK", "DARK"] as const;
    const requestedRoastLevel = roastLevels.includes(
      input.outputRoastLevel as (typeof roastLevels)[number],
    )
      ? (input.outputRoastLevel as (typeof roastLevels)[number])
      : null;
    if (!requestedRoastLevel) {
      return { success: false, error: "Pilih level roasting: Light, Medium, Medium Dark, atau Dark." };
    }
    const batchCode = await generateBatchCode();
    const result = await tenantPrisma.$transaction(async (tx) => {
      const inputProduct = await tx.product.findUnique({
        where: { id: input.inputProductId },
        select: {
          id: true,
          name: true,
          type: true,
          category: true,
          origin: true,
          description: true,
          imageUrl: true,
          isActive: true,
          stockKg: true,
          avgCostPerKg: true,
        },
      });
      if (!inputProduct || !inputProduct.isActive || inputProduct.type !== "GREEN_BEAN") {
        throw new Error("Produk input harus Green Bean aktif.");
      }
      const currentStock = Number(inputProduct.stockKg);
      if (currentStock < input.targetWeightKg) {
        throw new Error(
          `Stok Green Bean tidak cukup. Tersedia: ${currentStock.toFixed(3)} kg, dibutuhkan: ${input.targetWeightKg.toFixed(3)} kg.`,
        );
      }

      const automaticName = roastedBeanName(
        inputProduct.name,
        requestedRoastLevel as RoastLevelValue,
      );
      let outputProduct = input.outputMode === "existing" && input.outputProductId
        ? await tx.product.findUnique({ where: { id: input.outputProductId } })
        : null;
      if (outputProduct && (outputProduct.type !== "ROASTED_BEAN" || !outputProduct.isActive)) {
        throw new Error("Produk output harus Roasted Bean aktif.");
      }

      if (outputProduct) {
        if (outputProduct.roastLevel !== requestedRoastLevel) {
          throw new Error("Level roasting tidak cocok dengan produk Roasted Bean yang dipilih.");
        }
        if (outputProduct.sourceGreenBeanId && outputProduct.sourceGreenBeanId !== inputProduct.id) {
          throw new Error("Roasted Bean tersebut berasal dari Green Bean yang berbeda.");
        }
        if (!outputProduct.sourceGreenBeanId) {
          const sameIdentity = outputProduct.name
            .toLocaleLowerCase("id-ID")
            .includes(greenBeanIdentity(inputProduct.name).toLocaleLowerCase("id-ID"));
          const sameOrigin = !inputProduct.origin
            || outputProduct.origin?.toLocaleLowerCase("id-ID") === inputProduct.origin.toLocaleLowerCase("id-ID");
          if (!sameIdentity || !sameOrigin) {
            throw new Error("Produk output tidak cocok dengan identitas Green Bean yang dipilih.");
          }
          outputProduct = await tx.product.update({
            where: { id: outputProduct.id },
            data: { sourceGreenBeanId: inputProduct.id },
          });
        }
      }

      if (!outputProduct) {
        outputProduct = await tx.product.findFirst({
          where: {
            type: "ROASTED_BEAN",
            roastLevel: requestedRoastLevel,
            sourceGreenBeanId: inputProduct.id,
          },
        });
        if (!outputProduct) {
          outputProduct = await tx.product.findFirst({
            where: {
              type: "ROASTED_BEAN",
              roastLevel: requestedRoastLevel,
              sourceGreenBeanId: null,
              name: { equals: automaticName, mode: "insensitive" },
              origin: inputProduct.origin,
            },
          });
        }
        if (outputProduct) {
          outputProduct = await tx.product.update({
            where: { id: outputProduct.id },
            data: { sourceGreenBeanId: inputProduct.id, isActive: true },
          });
        } else {
          outputProduct = await tx.product.upsert({
            where: {
              tenantId_sourceGreenBeanId_roastLevel: {
                tenantId,
                sourceGreenBeanId: inputProduct.id,
                roastLevel: requestedRoastLevel,
              },
            },
            update: { isActive: true },
            create: {
              code: generateRBCode(automaticName),
              name: automaticName,
              type: "ROASTED_BEAN",
              category: inputProduct.category,
              origin: inputProduct.origin,
              roastLevel: requestedRoastLevel,
              sourceGreenBeanId: inputProduct.id,
              description: inputProduct.description,
              imageUrl: inputProduct.imageUrl,
            },
          });
        }
      }

      let outcome: RoastOutcome | undefined;
      if (input.mode === "MANUAL") {
        const comparableBatches = await tx.parentRoastingBatch.findMany({
          where: {
            inputProductId: input.inputProductId,
            outputProductId: outputProduct.id,
            status: "COMPLETED",
            totalShrinkagePercent: { not: null },
          },
          orderBy: { completedAt: "desc" },
          take: 10,
          select: { totalShrinkagePercent: true },
        });
        outcome = analyzeRoastOutcome(
          input.targetWeightKg,
          Number(input.actualOutputKg),
          comparableBatches.map((batch) => Number(batch.totalShrinkagePercent)),
        );
      }

      const batch = await tx.parentRoastingBatch.create({
        data: {
          code: batchCode,
          operationKey: input.operationKey,
          inputProductId:   input.inputProductId,
          targetWeightKg:   input.targetWeightKg,
          outputProductId:  outputProduct.id,
          actualOutputKg:   input.mode === "MANUAL" ? Number(input.actualOutputKg) : null,
          totalShrinkagePercent: outcome?.lossPercent ?? null,
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
            productId:   outputProduct.id,
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
        metadata: {
          operationKey: input.operationKey,
          outcomeStatus: outcome?.status ?? null,
          expectedLossPercent: outcome?.expectedLossPercent ?? null,
          expectedRange: outcome
            ? [outcome.expectedMinPercent, outcome.expectedMaxPercent]
            : null,
          historySampleCount: outcome?.historySampleCount ?? 0,
        },
      });
      return { batchCode: batch.code, outcome };
    }, { isolationLevel: "Serializable" });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/laporan");
    revalidatePath("/produksi");
    return { success: true, ...result };
  } catch (err) {
    console.error("[createParentRoastingBatch]", err);
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002" && input.operationKey) {
      const existing = await (await requireTenantPrisma()).parentRoastingBatch.findFirst({
        where: { operationKey: input.operationKey },
        select: { code: true },
      });
      if (existing) return { success: true, batchCode: existing.code };
    }
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

    const result = await tenantPrisma.$transaction(async (tx) => {
      const batch = await tx.parentRoastingBatch.findUnique({ 
        where: { id: batchId },
        include: { inputProduct: { select: { avgCostPerKg: true } } }
      });
      if (!batch) {
        throw new Error("Batch roasting tidak ditemukan.");
      }
      if (batch.status === "COMPLETED" && batch.actualOutputKg) {
        const recordedOutputKg = Number(batch.actualOutputKg);
        if (Math.abs(recordedOutputKg - actualOutputKg) < 0.0001) {
          return {
            batchCode: batch.code,
            outcome: analyzeRoastOutcome(Number(batch.targetWeightKg), recordedOutputKg),
          };
        }
        throw new Error("Batch sudah selesai dengan berat hasil yang berbeda.");
      }
      if (batch.status !== "PENDING") {
        throw new Error("Batch tidak dapat diselesaikan karena statusnya bukan proses.");
      }

      const recentComparable = await tx.parentRoastingBatch.findMany({
        where: {
          id: { not: batch.id },
          inputProductId: batch.inputProductId,
          outputProductId: batch.outputProductId,
          status: "COMPLETED",
          totalShrinkagePercent: { not: null },
        },
        orderBy: { completedAt: "desc" },
        take: 10,
        select: { totalShrinkagePercent: true },
      });
      const outcome = analyzeRoastOutcome(
        Number(batch.targetWeightKg),
        actualOutputKg,
        recentComparable.map((item) => Number(item.totalShrinkagePercent)),
      );
      const claimed = await tx.parentRoastingBatch.updateMany({
        where: { id: batchId, status: "PENDING" },
        data: {
          actualOutputKg,
          totalShrinkagePercent: outcome.lossPercent,
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
          totalShrinkagePercent: outcome.lossPercent,
          outcomeStatus: outcome.status,
          expectedLossPercent: outcome.expectedLossPercent,
          expectedLossRange: [outcome.expectedMinPercent, outcome.expectedMaxPercent],
        },
      });
      return { batchCode: batch.code, outcome };
    }, { isolationLevel: "Serializable" });

    revalidatePath("/roasting");
    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/laporan");
    revalidatePath("/produksi");
    return { success: true, ...result };
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
    revalidatePath("/dashboard");
    revalidatePath("/laporan");
    revalidatePath("/produksi");
    return { success: true };
  } catch (err) {
    console.error("[voidParentRoastingBatch]", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Gagal membatalkan batch.",
    };
  }
}
