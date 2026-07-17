import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "OPERATOR" | "CASHIER" | "SUPERADMIN";
  tenantId: string;
}

const sessionPassword = process.env.SESSION_SECRET;

if (process.env.NODE_ENV === "production" && !sessionPassword) {
  throw new Error("SESSION_SECRET must be configured in production.");
}

export const SESSION_OPTIONS = {
  password: sessionPassword ?? "ros-development-session-secret-minimum-32-characters",
  cookieName: "ros_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 8, // 8 jam
  },
};

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const session = await getIronSession<{ user?: SessionUser }>(cookieStore, SESSION_OPTIONS);
    return session.user ?? null;
  } catch {
    return null;
  }
}
