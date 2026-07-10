import { prisma } from "./src/lib/prisma";

async function main() {
  const result = await prisma.expense.deleteMany({
    where: {
      category: 'GAJI'
    }
  });
  console.log(`Deleted ${result.count} gaji expenses.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
