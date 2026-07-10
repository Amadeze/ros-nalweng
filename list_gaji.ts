import { prisma } from "./src/lib/prisma";

async function main() {
  const expenses = await prisma.expense.findMany({
    where: {
      OR: [
        { category: 'GAJI' },
        { description: { contains: 'gaji', mode: 'insensitive' } }
      ]
    }
  });
  console.log(`Found ${expenses.length} gaji expenses.`);
  console.log(expenses);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
