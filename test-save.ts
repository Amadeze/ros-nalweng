import { prisma } from "./src/lib/prisma";

async function main() {
  try {
    const t = await prisma.tenant.findFirst();
    if (!t) throw new Error("No tenant");
    console.log("Updating tenant", t.id);
    
    await prisma.tenant.update({
      where: { id: t.id },
      data: {
        contactEmail: "test@example.com",
        instagramHandle: "test"
      }
    });
    console.log("SUCCESS!");
  } catch(e) {
    console.error("ERROR", e);
  }
}
main();
