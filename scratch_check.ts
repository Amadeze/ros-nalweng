import { prisma } from './src/lib/prisma';

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: 'su@nalweng.com' }
  });
  console.log(user);
}

main().catch(console.error).finally(() => prisma.$disconnect());
