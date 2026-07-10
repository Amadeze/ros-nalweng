import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Allow Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Read session from cookie
  const res = NextResponse.next();
  const session = await getIronSession<{ user?: SessionUser }>(request, res, SESSION_OPTIONS);

  if (!session.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const role = session.user.role;

  // Role-based Access Control (RBAC)
  if (role === "OPERATOR") {
    const allowed = ["/dashboard", "/inventory", "/roasting", "/produksi"];
    if (!allowed.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (role === "CASHIER") {
    const allowed = ["/dashboard", "/penjualan", "/master-data"];
    if (!allowed.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

