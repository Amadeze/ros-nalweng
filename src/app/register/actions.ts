"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function registerTenant(data: {
  roasteryName: string;
  subdomain: string;
  email: string;
  password: string;
}) {
  try {
    const { roasteryName, subdomain, email, password } = data;

    // 1. Basic validations
    if (!roasteryName || !subdomain || !email || !password) {
      return { success: false, error: "All fields are required" };
    }

    if (!/^[a-z0-9-]+$/.test(subdomain)) {
      return { success: false, error: "Subdomain can only contain lowercase letters, numbers, and hyphens" };
    }

    // 2. Check if subdomain exists
    const existingTenant = await prisma.tenant.findUnique({
      where: { subdomain },
    });
    if (existingTenant) {
      return { success: false, error: "Subdomain is already taken" };
    }

    // 3. Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      return { success: false, error: "Email is already registered" };
    }

    // 4. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create Tenant and User in transaction
    // Set 14 days trial
    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 14);

    const result = await prisma.$transaction(async (tx) => {
      const newTenant = await tx.tenant.create({
        data: {
          code: subdomain.toUpperCase(), // basic code generation
          name: roasteryName,
          subdomain: subdomain,
          subscriptionTier: "TRIAL",
          trialEndsAt: trialEndsAt,
        },
      });

      const newUser = await tx.user.create({
        data: {
          tenantId: newTenant.id,
          name: email.split("@")[0],
          email: email,
          password: hashedPassword,
          role: "OWNER",
        },
      });

      return { tenant: newTenant, user: newUser };
    });

    return { success: true, tenantId: result.tenant.id };
  } catch (error: any) {
    console.error("Registration error:", error);
    return { success: false, error: error.message || "Something went wrong" };
  }
}
