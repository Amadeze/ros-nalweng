const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = bcrypt.hashSync('admin123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@nalweng.com' },
    update: { password: hash, role: 'OWNER', isActive: true, name: 'Admin Nalweng' },
    create: { name: 'Admin Nalweng', email: 'admin@nalweng.com', password: hash, role: 'OWNER', isActive: true },
  });
  console.log('OK: admin@nalweng.com (password: admin123)');

  await prisma.user.upsert({
    where: { email: 'system@ros.internal' },
    update: { password: 'system' },
    create: { name: 'System', email: 'system@ros.internal', password: 'system', role: 'OWNER' },
  });
  console.log('OK: system@ros.internal');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
