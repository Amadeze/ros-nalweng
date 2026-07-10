import { prisma } from './src/lib/prisma';

async function main() {
  const expenses = await prisma.expense.findMany();
  console.log("Total expenses:", expenses.length);
  if (expenses.length > 0) {
    console.log(expenses.slice(0, 5));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
