import { prisma, withTenant } from "./prisma";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";

/** 
 * Gets the prisma client scoped to the current user's tenant.
 * Use this in all server actions instead of the global prisma.
 */
export async function requireTenantPrisma() {
  const user = await getCurrentUser();
  if (!user || !user.tenantId) {
    redirect("/login");
  }
  return withTenant(user.tenantId);
}

/** 
 * Retrieves the current user's ID safely.
 */
export async function getSystemUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user.id;
}
