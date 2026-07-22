import { prisma, withTenant } from "./prisma";
import { getCurrentUser } from "./session";
import { redirect } from "next/navigation";
import type { SessionUser } from "./session";
import { getTenantAccessState } from "./subscription";
import { planHasFeature, type PlanFeature } from "./plans";
import { cache } from "react";

export const getTenantAccessRecord = cache(async (tenantId: string) =>
  prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      isActive: true,
      subscriptionTier: true,
      subscriptionStatus: true,
      trialEndsAt: true,
      nextBillingDate: true,
      setupCompletedAt: true,
    },
  }),
);

export async function requireCurrentUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

/** 
 * Gets the prisma client scoped to the current user's tenant.
 * Use this in all server actions instead of the global prisma.
 */
export async function requireTenantPrisma() {
  const user = await requireCurrentUser();
  const tenant = await getTenantAccessRecord(user.tenantId);

  if (!tenant || !tenant.isActive) {
    redirect("/login");
  }

  const accessState = getTenantAccessState(tenant);
  if (accessState === "INACTIVE") {
    redirect("/login");
  }
  if (accessState === "SUBSCRIPTION_REQUIRED") {
    redirect("/billing");
  }

  return withTenant(user.tenantId);
}

export async function getCurrentTenantId(): Promise<string> {
  return (await requireCurrentUser()).tenantId;
}

export async function requireRole(...allowedRoles: SessionUser["role"][]) {
  const user = await requireCurrentUser();
  if (!allowedRoles.includes(user.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireFeature(feature: PlanFeature) {
  const user = await requireCurrentUser();
  const tenant = await getTenantAccessRecord(user.tenantId);
  if (!tenant || !tenant.isActive) {
    redirect("/login");
  }
  const accessState = getTenantAccessState(tenant);
  if (accessState === "INACTIVE") {
    redirect("/login");
  }
  if (accessState === "SUBSCRIPTION_REQUIRED") {
    redirect("/billing");
  }
  if (!planHasFeature(tenant.subscriptionTier, feature)) {
    throw new Error("FEATURE_NOT_AVAILABLE");
  }
  return tenant.subscriptionTier;
}

/** 
 * Retrieves the current user's ID safely.
 */
export async function getSystemUserId(): Promise<string> {
  return (await requireCurrentUser()).id;
}
