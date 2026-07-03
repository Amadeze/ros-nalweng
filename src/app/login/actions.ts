"use server";

import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

type AppSession = IronSession<{ user?: SessionUser }>;

// ─── Login ───────────────────────────────────────────────────────────────────

export type LoginResult =
  | { success: true }
  | { success: false; error: string };

export async function loginAction(email: string, password: string): Promise<LoginResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true, role: true, password: true, isActive: true },
    });

    if (!user || !user.isActive) {
      return { success: false, error: "Email atau password salah." };
    }

    // Support plain-text password "system" untuk seed user, and bcrypt for others
    let valid = false;
    if (user.password === password) {
      valid = true; // plain text (seed users only)
    } else {
      valid = await bcrypt.compare(password, user.password);
    }

    if (!valid) {
      return { success: false, error: "Email atau password salah." };
    }

    const cookieStore = await cookies();
    const session = await getIronSession<{ user?: SessionUser }>(cookieStore, SESSION_OPTIONS);

    session.user = {
      id:    user.id,
      name:  user.name,
      email: user.email,
      role:  user.role as SessionUser["role"],
    };

    await session.save();

    return { success: true };
  } catch (err) {
    console.error("[loginAction]", err);
    return { success: false, error: "Terjadi kesalahan. Coba lagi." };
  }
}

// ─── Logout ──────────────────────────────────────────────────────────────────

export async function logoutAction() {
  const cookieStore = await cookies();
  const session = await getIronSession<{ user?: SessionUser }>(cookieStore, SESSION_OPTIONS);
  session.destroy();
  redirect("/login");
}

// ─── Get current user (server component helper) ──────────────────────────────

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<{ user?: SessionUser }>(cookieStore, SESSION_OPTIONS);
    return session.user ?? null;
  } catch {
    return null;
  }
}
