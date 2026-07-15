import { prisma } from '../src/lib/prisma';

async function main() {
  console.log('Migrating stock caching fields...');

  // 1. Update Product Stocks
  const products = await prisma.product.findMany();
  for (const product of products) {
    const ledgers = await prisma.inventoryLedger.findMany({
      where: { productId: product.id }
    });
    
    let stockUnit = 0;
    let stockKg = 0;

    for (const l of ledgers) {
      if (l.quantityUnit) {
        stockUnit += l.entryType === 'IN' ? l.quantityUnit : -l.quantityUnit;
      }
      if (l.quantityKg) {
        const kg = Number(l.quantityKg);
        stockKg += l.entryType === 'IN' ? kg : -kg;
      }
    }

    // Get last HPP for Finished Goods
    let lastHpp = null;
    if (product.type === 'FINISHED_GOODS') {
      const latestBatch = await prisma.productionBatch.findFirst({
        where: { outputProductId: product.id, status: 'COMPLETED' },
        orderBy: { producedAt: 'desc' }
      });
      if (latestBatch) {
        lastHpp = latestBatch.hppPerUnit;
      }
    }

    await prisma.product.update({
      where: { id: product.id },
      data: {
        stockUnit,
        stockKg,
        lastHpp
      }
    });
    console.log(`Updated Product: ${product.name} (Unit: ${stockUnit}, Kg: ${stockKg})`);
  }

  // 2. Update Packaging Stocks
  const packagings = await prisma.packaging.findMany();
  for (const pkg of packagings) {
    const ledgers = await prisma.inventoryLedger.findMany({
      where: { packagingId: pkg.id }
    });
    
    let stockUnit = 0;
    for (const l of ledgers) {
      if (l.quantityUnit) {
        stockUnit += l.entryType === 'IN' ? l.quantityUnit : -l.quantityUnit;
      }
    }

    await prisma.packaging.update({
      where: { id: pkg.id },
      data: { stockUnit }
    });
    console.log(`Updated Packaging: ${pkg.name} (Unit: ${stockUnit})`);
  }

  console.log('Stock migration complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
