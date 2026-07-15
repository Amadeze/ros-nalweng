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

/**
 * Buat entri InventoryLedger baru dan otomatis update cache stock di Product/Packaging.
 * Harus dijalankan di dalam transaksi (tx).
 */
export async function appendLedger(tx: any, data: any) {
  const ledger = await tx.inventoryLedger.create({ data });
  
  const diffUnit = ledger.entryType === 'IN' ? (ledger.quantityUnit || 0) : -(ledger.quantityUnit || 0);
  const diffKg = ledger.entryType === 'IN' ? Number(ledger.quantityKg || 0) : -Number(ledger.quantityKg || 0);

  if (ledger.productId) {
    await tx.product.update({
      where: { id: ledger.productId },
      data: {
        stockUnit: { increment: diffUnit },
        stockKg: { increment: diffKg }
      }
    });
  } else if (ledger.packagingId) {
    await tx.packaging.update({
      where: { id: ledger.packagingId },
      data: {
        stockUnit: { increment: diffUnit }
      }
    });
  }

  return ledger;
}
