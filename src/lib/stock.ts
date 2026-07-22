import { requireTenantPrisma } from "./auth";

// Use a flexible type that works with both base and tenant-scoped Prisma clients
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TransactionClient = any;

// Prisma Decimal is accepted as number | string for convenience
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlexibleNumber = number | string | { toNumber(): number } | null | undefined;

interface LedgerEntryData {
  productId?: string | null;
  packagingId?: string | null;
  entryType: "IN" | "OUT";
  quantityUnit?: FlexibleNumber;
  quantityKg?: FlexibleNumber;
  incomingPrice?: FlexibleNumber;
  lotNumber?: string | null;
  expiryDate?: Date | string | null;
  reference?: string;
  notes?: string;
  [key: string]: unknown;
}

/**
 * Hitung stok kopi (kg) untuk satu product dari agregasi InventoryLedger.
 * Digunakan oleh roasting & produksi untuk validasi stok sebelum transaksi.
 */
export async function computeKgStock(productId: string): Promise<number> {
  const prisma = await requireTenantPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stockKg: true },
  });
  return Number(product?.stockKg ?? 0);
}

/**
 * Hitung stok unit (pcs) untuk satu packaging dari agregasi InventoryLedger.
 */
export async function computeUnitStock(packagingId: string): Promise<number> {
  const prisma = await requireTenantPrisma();
  const packaging = await prisma.packaging.findUnique({
    where: { id: packagingId },
    select: { stockUnit: true },
  });
  return packaging?.stockUnit ?? 0;
}

/**
 * Hitung stok unit (pcs) untuk satu Finished Goods product dari agregasi InventoryLedger.
 * FG tracking menggunakan productId + quantityUnit (berbeda dari computeKgStock yang pakai quantityKg).
 */
export async function computeFGUnitStock(productId: string): Promise<number> {
  const prisma = await requireTenantPrisma();
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stockUnit: true },
  });
  return product?.stockUnit ?? 0;
}

/**
 * Buat entri InventoryLedger baru dan otomatis update cache stock di Product/Packaging.
 * Harus dijalankan di dalam transaksi (tx).
 */
export async function appendLedger(tx: TransactionClient, data: LedgerEntryData | { data: LedgerEntryData }) {
  const payload = ("data" in data ? data.data : data) as LedgerEntryData;
  const quantityUnit = Number(payload.quantityUnit ?? 0);
  const quantityKg = Number(payload.quantityKg ?? 0);

  if (Boolean(payload.productId) === Boolean(payload.packagingId)) {
    throw new Error("Ledger entry must target exactly one product or packaging item.");
  }
  if (quantityUnit < 0 || quantityKg < 0 || (quantityUnit === 0 && quantityKg === 0)) {
    throw new Error("Ledger quantity must be greater than zero.");
  }

  const isInbound = payload.entryType === "IN";
  if (!isInbound && payload.entryType !== "OUT") {
    throw new Error("Ledger entry type must be IN or OUT.");
  }

  // Calculate moving average cost if incomingPrice is provided
  let newAvgCostKg: number | undefined;
  let newAvgCostUnit: number | undefined;
  if (isInbound && payload.incomingPrice !== undefined) {
    const incPrice = Number(payload.incomingPrice);
    if (payload.productId) {
      const product = await tx.product.findUnique({
        where: { id: payload.productId },
        select: { stockKg: true, stockUnit: true, avgCostPerKg: true },
      });
      if (product && quantityKg > 0) {
        const oldStock = Number(product.stockKg);
        const oldAvg = Number(product.avgCostPerKg ?? 0);
        newAvgCostKg = (oldStock * oldAvg + quantityKg * incPrice) / (oldStock + quantityKg);
      }
      // FG unit cost is NOT tracked via moving average on avgCostPerKg.
      // FG cost comes from lastHpp (set by production batches).
      // AVOID: writing newAvgCostUnit to avgCostPerKg — that corrupts the kg cost.
    } else if (payload.packagingId) {
      const pkg = await tx.packaging.findUnique({
        where: { id: payload.packagingId },
        select: { stockUnit: true, avgCostPerUnit: true },
      });
      if (pkg && quantityUnit > 0) {
        const oldStock = Number(pkg.stockUnit);
        const oldAvg = Number(pkg.avgCostPerUnit ?? 0);
        newAvgCostUnit = (oldStock * oldAvg + quantityUnit * incPrice) / (oldStock + quantityUnit);
      }
    }
  }

  if (payload.productId) {
    if (quantityUnit > 0) {
      const result = await tx.product.updateMany({
        where: {
          id: payload.productId,
          ...(isInbound ? {} : { stockUnit: { gte: quantityUnit } }),
        },
        data: {
          stockUnit: isInbound
            ? { increment: quantityUnit }
            : { decrement: quantityUnit },
          ...(newAvgCostUnit !== undefined ? { avgCostPerKg: newAvgCostUnit } : {}),
        },
      });
      if (result.count !== 1) {
        throw new Error("Stok produk tidak cukup untuk menyelesaikan transaksi.");
      }
    }

    if (quantityKg > 0) {
      const result = await tx.product.updateMany({
        where: {
          id: payload.productId,
          ...(isInbound ? {} : { stockKg: { gte: quantityKg } }),
        },
        data: {
          stockKg: isInbound
            ? { increment: quantityKg }
            : { decrement: quantityKg },
          ...(newAvgCostKg !== undefined ? { avgCostPerKg: newAvgCostKg } : {}),
        },
      });
      if (result.count !== 1) {
        throw new Error("Stok kopi tidak cukup untuk menyelesaikan transaksi.");
      }
    }
  } else {
    const result = await tx.packaging.updateMany({
      where: {
        id: payload.packagingId,
        ...(isInbound ? {} : { stockUnit: { gte: quantityUnit } }),
      },
      data: {
        stockUnit: isInbound
          ? { increment: quantityUnit }
          : { decrement: quantityUnit },
        ...(newAvgCostUnit !== undefined ? { avgCostPerUnit: newAvgCostUnit } : {}),
      },
    });
    if (result.count !== 1) {
      throw new Error("Stok kemasan tidak cukup untuk menyelesaikan transaksi.");
    }
  }

  const dataToSave = { ...payload };
  delete dataToSave.incomingPrice; // Ensure incomingPrice is not saved to InventoryLedger
  
  return tx.inventoryLedger.create({ data: dataToSave });
}
