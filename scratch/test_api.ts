import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient().$extends({
  query: {
    inventoryLedger: {
      async create({ args, query }) {
        const client = Prisma.getExtensionContext(this);
        const ledger = await query(args);

        const diffUnit = ledger.entryType === 'IN' ? (ledger.quantityUnit||0) : -(ledger.quantityUnit||0);
        const diffKg = ledger.entryType === 'IN' ? Number(ledger.quantityKg||0) : -Number(ledger.quantityKg||0);

        if (ledger.productId) {
           await (client as any).product.update({
             where: { id: ledger.productId },
             data: {
               stockUnit: { increment: diffUnit },
               stockKg: { increment: diffKg }
             }
           });
        } else if (ledger.packagingId) {
           await (client as any).packaging.update({
             where: { id: ledger.packagingId },
             data: {
               stockUnit: { increment: diffUnit }
             }
           });
        }
        return ledger;
      }
    }
  }
});

async function main() {
  console.log("Checking if this compiles...");
}
main();
