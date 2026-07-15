const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const tenant = await prisma.tenant.findUnique({ where: { code: 'NALWENG' } });
  if (tenant) {
    await prisma.tenant.update({
      where: { id: tenant.id },
      data: { subdomain: 'nalweng' }
    });
    console.log('Successfully set subdomain "nalweng" for tenant NALWENG');
  } else {
    console.log('Tenant NALWENG not found');
  }
  
  // also create another tenant for testing
  const tenant2 = await prisma.tenant.findUnique({ where: { code: 'TOKO_B' } });
  if (!tenant2) {
    await prisma.tenant.create({
      data: {
        code: 'TOKO_B',
        name: 'Toko B Roastery',
        subdomain: 'tokob'
      }
    });
    console.log('Successfully created tenant TOKO_B with subdomain "tokob"');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
