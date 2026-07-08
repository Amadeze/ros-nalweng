import { prisma } from "./prisma";

/** 
 * Upsert system user untuk operasional background/dev.
 * Di masa depan, idealnya server actions mengambil ID user dari iron-session.
 */
export async function getSystemUserId(): Promise<string> {
  const user = await prisma.user.upsert({
    where: { email: "system@ros.internal" },
    create: {
      name: "System",
      email: "system@ros.internal",
      password: "system",
      role: "OWNER",
    },
    update: {},
    select: { id: true },
  });
  return user.id;
}
