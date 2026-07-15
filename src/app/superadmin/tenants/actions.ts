"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function createTenant(data: {
  code: string;
  name: string;
  subdomain: string;
  adminName: string;
  adminEmail: string;
}) {
  try {
    // Basic validation
    if (!data.code || !data.name || !data.subdomain || !data.adminEmail || !data.adminName) {
      return { success: false, error: "Semua field harus diisi." };
    }

    const cleanSubdomain = data.subdomain.toLowerCase().trim().replace(/[^a-z0-9-]/g, "");

    // Check existing
    const existingTenant = await prisma.tenant.findFirst({
      where: {
        OR: [{ code: data.code }, { subdomain: cleanSubdomain }],
      },
    });

    if (existingTenant) {
      return { success: false, error: "Kode Outlet atau Subdomain sudah digunakan." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: data.adminEmail },
    });

    if (existingUser) {
      return { success: false, error: "Email Admin sudah terdaftar di sistem." };
    }

    // Hash password (default: admin123)
    const hashedPassword = await bcrypt.hash("admin123", 10);

    // Create Tenant and Admin User
    await prisma.$transaction(async (tx) => {
      const tenant = await tx.tenant.create({
        data: {
          code: data.code,
          name: data.name,
          subdomain: cleanSubdomain,
        },
      });

      await tx.user.create({
        data: {
          name: data.adminName,
          email: data.adminEmail.toLowerCase().trim(),
          password: hashedPassword,
          role: "OWNER",
          tenantId: tenant.id,
        },
      });
    });

    revalidatePath("/superadmin/tenants");
    return { success: true };
  } catch (error: any) {
    console.error("Create Tenant Error:", error);
    return { success: false, error: error.message || "Gagal membuat tenant." };
  }
}
