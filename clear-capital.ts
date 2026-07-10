import { prisma } from './src/lib/prisma';

async function main() {
  await prisma.capitalTransaction.deleteMany({});
  console.log("Semua data CapitalTransaction (Modal Disetor & Prive) berhasil dihapus.");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
