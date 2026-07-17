"use server";

import { headers } from "next/headers";

import { prisma } from "@/lib/prisma";
import {
  createPasswordResetToken,
  hashPasswordResetToken,
} from "@/lib/password-reset";
import {
  enforceRateLimit,
  RateLimitError,
  requestIdentifier,
} from "@/lib/rate-limit";
import { sendPasswordResetEmail } from "@/lib/notifications";

const GENERIC_MESSAGE =
  "Jika email terdaftar, tautan reset password akan segera dikirim.";

export async function requestPasswordReset(emailInput: string) {
  try {
    const email = emailInput.toLowerCase().trim();
    const requestHeaders = await headers();
    await enforceRateLimit({
      scope: "forgot-password",
      identifier: `${requestIdentifier(requestHeaders)}:${email}`,
      limit: 5,
      windowSeconds: 60 * 60,
    });

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        isActive: true,
        tenant: { select: { isActive: true } },
      },
    });

    if (!user || !user.isActive || !user.tenant.isActive) {
      return { success: true, message: GENERIC_MESSAGE };
    }

    const token = createPasswordResetToken();
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
    await prisma.$transaction([
      prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashPasswordResetToken(token),
          expiresAt,
        },
      }),
    ]);

    const appUrl = process.env.APP_URL || "http://localhost:3000";
    await sendPasswordResetEmail(
      user.email,
      user.name,
      `${appUrl}/reset-password?token=${encodeURIComponent(token)}`,
    );

    return { success: true, message: GENERIC_MESSAGE };
  } catch (error) {
    console.error("[requestPasswordReset]", error);
    return {
      success: false,
      message:
        error instanceof RateLimitError
          ? error.message
          : "Permintaan reset password belum dapat diproses.",
    };
  }
}
