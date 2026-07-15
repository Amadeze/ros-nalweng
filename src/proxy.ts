import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

const PUBLIC_PATHS = ["/login"];
const ROOT_DOMAINS = ['localhost', '127.0.0.1', 'ros.com', 'www.ros.com', 'app.ros.com', 'beanslab.vercel.app', 'ros-beanslab.vercel.app'];

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  // Allow Next.js internals and public tenant APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.startsWith("/api/tenant/") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Get hostname of request (e.g. demo.ros.com, demo.localhost:3000)
  let hostname = request.headers.get('host') || '';
  hostname = hostname.split(':')[0]; // Remove port if present

  // 1. SUBDOMAIN ROUTING (B2B PORTAL)
  // If the hostname is NOT a root domain, it's a tenant subdomain
  if (!ROOT_DOMAINS.includes(hostname)) {
    let subdomain = '';
    
    if (hostname.endsWith('.localhost')) {
      subdomain = hostname.replace('.localhost', '');
    } else if (hostname.endsWith('.ros.com')) {
      subdomain = hostname.replace('.ros.com', '');
    } else {
      subdomain = hostname.split('.')[0]; 
    }

    // Do not rewrite admin and api paths so they can be accessed on any domain
    if (pathname.startsWith('/login') || pathname.startsWith('/dashboard') || pathname.startsWith('/register') || pathname.startsWith('/api')) {
      return NextResponse.next();
    }

    if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
      // Rewrite the route to /tenant/[subdomain]/...
      // B2B portals are public, so we don't enforce authentication
      return NextResponse.rewrite(new URL(`/tenant/${subdomain}${pathname}${url.search}`, request.url));
    }
  }

  // 2. MAIN SAAS APP (ROOT DOMAINS)
  // Allow public paths on main app
  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
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
