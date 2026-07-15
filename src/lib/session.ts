import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "MANAGER" | "OPERATOR" | "CASHIER" | "SUPERADMIN";
  tenantId: string;
}

export const SESSION_OPTIONS = {
  password: process.env.SESSION_SECRET ?? "ros-nalweng-super-secret-key-minimum-32-chars!!",
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
