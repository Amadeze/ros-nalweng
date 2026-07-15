import { prisma } from "./src/lib/prisma";
async function main() {
  const users = await prisma.user.count();
  console.log("SUCCESS! Users count:", users);
}
main().catch(console.error);
