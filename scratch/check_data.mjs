import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const invoices = await prisma.invoiceItem.findMany({
    include: {
      product: true
    },
    take: 10
  });

  console.log(JSON.stringify(invoices, null, 2));

  const recipes = await prisma.recipe.findMany({
    take: 5
  });
  console.log(JSON.stringify(recipes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
