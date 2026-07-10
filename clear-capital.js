const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
