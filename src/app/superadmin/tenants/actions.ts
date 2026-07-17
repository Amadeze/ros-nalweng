"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { requireRole } from "@/lib/auth";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import { sendPasswordResetEmail } from "@/lib/notifications";

export async function createTenant(data: {
  code: string;
  name: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
}) {
  try {
    await requireRole("SUPERADMIN");

    // Basic validation
    if (!data.code || !data.name || !data.subdomain || !data.adminEmail || !data.adminName) {
      return { success: false, error: "Semua field harus diisi." };
    }

    const cleanSubdomain = data.subdomain.toLowerCase().trim();
    const cleanCode = data.code.toUpperCase().trim();
    const cleanEmail = data.adminEmail.toLowerCase().trim();
    if (
      cleanSubdomain.length < 3 ||
      cleanSubdomain.length > 40 ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleanSubdomain)
    ) {
      return { success: false, error: "Format subdomain tidak valid." };
    }
    if (["www", "app", "admin", "api", "mail", "support"].includes(cleanSubdomain)) {
      return { success: false, error: "Subdomain tersebut dicadangkan oleh sistem." };
    }
    if (!/^[A-Z0-9-]{3,30}$/.test(cleanCode)) {
      return { success: false, error: "Kode outlet hanya boleh berisi huruf, angka, dan tanda hubung." };
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return { success: false, error: "Email admin tidak valid." };
    }

    // Check existing
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ code: cleanCode }, { subdomain: cleanSubdomain }],
      },
    });

    if (existingTenant) {
      return { success: false, error: "Kode Outlet atau Subdomain sudah digunakan." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return { success: false, error: "Email Admin sudah terdaftar di sistem." };
    }

    const setupToken = createPasswordResetToken();
    const hashedPassword = await bcrypt.hash(createPasswordResetToken(), 12);
    const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);

    // Create Tenant and Admin User
    const owner = await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          code: cleanCode,
          name: data.name.trim(),
          subdomain: cleanSubdomain,
          subscriptionTier: "TRIAL",
          subscriptionStatus: "ACTIVE",
          trialEndsAt,
        },
      });

      const user = await tx.user.create({
        data: {
          name: data.adminName.trim(),
          email: cleanEmail,
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });

      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashPasswordResetToken(setupToken),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
      });
      return user;
    });

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const emailResult = await sendPasswordResetEmail(
      owner.email,
      owner.name,
      `${appUrl}/reset-password?token=${encodeURIComponent(setupToken)}`,
    );

    revalidatePath("/superadmin/tenants");
    return {
      success: true,
      emailSent: emailResult.success && !("mocked" in emailResult),
    };
  } catch (error: any) {
    console.error("Create Tenant Error:", error);
    return { success: false, error: error.message || "Gagal membuat tenant." };
  }
}

export async function updateTenantAdmin(data: {
  id: string;
  isActive: boolean;
  subscriptionTier: "TRIAL" | "BASIC" | "PRO" | "ENTERPRISE";
  subscriptionStatus: "ACTIVE" | "PAST_DUE" | "CANCELED" | "EXPIRED";
}) {
  try {
    await requireRole("SUPERADMIN");
    if (!data.id) return { success: false, error: "Tenant ID is required." };

    await prisma.tenant.update({
      where: { id: data.id },
      data: {
        isActive: data.isActive,
        subscriptionTier: data.subscriptionTier,
        subscriptionStatus: data.subscriptionStatus,
      },
    });

    revalidatePath("/superadmin/tenants");
    return { success: true };
  } catch (error: any) {
    console.error("Update Tenant Error:", error);
    return { success: false, error: error.message || "Gagal mengupdate tenant." };
  }
}
