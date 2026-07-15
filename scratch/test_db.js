const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findFirst();
  console.log(tenant.subdomain);
}
main().catch(console.error).finally(() => prisma.$disconnect());
