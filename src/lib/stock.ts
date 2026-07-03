import { prisma } from "./prisma";

/**
 * Hitung stok kopi (kg) untuk satu product dari agregasi InventoryLedger.
 * Digunakan oleh roasting & produksi untuk validasi stok sebelum transaksi.
 */
export async function computeKgStock(productId: string): Promise<number> {
  const entries = await prisma.inventoryLedger.findMany({
    where: { productId },
    select: { entryType: true, quantityKg: true },
  });
  return entries.reduce((sum, e) => {
    const qty = Number(e.quantityKg ?? 0);
    return e.entryType === "IN" ? sum + qty : sum - qty;
  }, 0);
}

/**
 * Hitung stok unit (pcs) untuk satu packaging dari agregasi InventoryLedger.
 */
export async function computeUnitStock(packagingId: string): Promise<number> {
  const entries = await prisma.inventoryLedger.findMany({
    where: { packagingId },
    select: { entryType: true, quantityUnit: true },
  });
  return entries.reduce((sum, e) => {
    return e.entryType === "IN" ? sum + (e.quantityUnit ?? 0) : sum - (e.quantityUnit ?? 0);
  }, 0);
}

/**
 * Hitung stok unit (pcs) untuk satu Finished Goods product dari agregasi InventoryLedger.
 * FG tracking menggunakan productId + quantityUnit (berbeda dari computeKgStock yang pakai quantityKg).
 */
export async function computeFGUnitStock(productId: string): Promise<number> {
  const entries = await prisma.inventoryLedger.findMany({
    where: { productId, quantityUnit: { not: null } },
    select: { entryType: true, quantityUnit: true },
  });
  return entries.reduce((sum, e) => {
    return e.entryType === "IN" ? sum + (e.quantityUnit ?? 0) : sum - (e.quantityUnit ?? 0);
  }, 0);
}
