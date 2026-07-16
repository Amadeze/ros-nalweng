import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  const tenant = await prisma.tenant.findUnique({
    where: { subdomain: 'beanslab' }
  });

  if (!tenant) {
    console.error("Tenant 'beanslab' not found. It might have been deleted or created differently.");
    return;
  }

  const email = 'admin@beanslab.com';
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    console.log("User admin@beanslab.com already exists!");
    return;
  }

  const hashedPassword = await bcrypt.hash('password123', 10);

  const newUser = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      name: 'Beanslab Admin',
      email: email,
      password: hashedPassword,
      role: 'SUPERADMIN',
    },
  });

  console.log('Successfully created SUPERADMIN for beanslab:', newUser.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
