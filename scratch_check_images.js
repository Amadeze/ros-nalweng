const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  const tenants = await prisma.tenant.findMany({
    select: {
      subdomain: true,
      name: true,
      logoUrl: true,
      heroImageUrl: true,
      backgroundImageUrl: true
    }
  });
  console.log(JSON.stringify(tenants, null, 2));
}

check().catch(console.error).finally(() => prisma.$disconnect());
