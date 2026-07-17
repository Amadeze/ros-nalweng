const { prisma } = require('./src/lib/prisma');

async function run() {
  const count = await prisma.recipeItem.deleteMany({
    where: { tenantId: 'default' }
  });
  console.log('Deleted orphaned items:', count);
}

run().catch(console.error).finally(() => process.exit(0));
