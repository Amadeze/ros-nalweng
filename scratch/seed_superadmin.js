import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const tenant = await prisma.tenant.upsert({
    where: { id: "default" },
    update: {},
    create: { id: "default", code: "SYS-000", name: "System Admin Tenant", subdomain: "admin" }
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@ros-system.com" },
    update: {
      password: "admin", 
      role: "SUPERADMIN",
      tenantId: "default"
    },
    create: {
      name: "System Admin",
      email: "admin@ros-system.com",
      password: "admin",
      role: "SUPERADMIN",
      tenantId: "default"
    }
  });

  console.log("Superadmin created/updated:", admin.email);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
