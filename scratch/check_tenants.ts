import { prisma } from '../src/lib/prisma';

async function main() {
  const tenants = await prisma.tenant.findMany({
    select: { id: true, name: true, subdomain: true }
  });
  console.log(tenants);
}

main().catch(console.error);
