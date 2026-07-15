import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { prisma } from "./src/lib/prisma";

async function main() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { customer: true, items: true }
  });
  console.log("Recent Invoices:", JSON.stringify(invoices, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
