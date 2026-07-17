import { getIronSession } from "iron-session";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { SESSION_OPTIONS, type SessionUser } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/register", "/forgot-password", "/reset-password", "/about", "/pricing", "/_next", "/favicon.ico", "/images", "/tenant"];
const ROOT_DOMAINS = ['localhost', '127.0.0.1', 'ros.com', 'www.ros.com', 'app.ros.com', 'beanslab.vercel.app', 'ros-beanslab.vercel.app'];
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._-]{1,80}$/;

function requestContext(request: NextRequest) {
  const incoming = request.headers.get("x-request-id")?.trim();
  const requestId = incoming && REQUEST_ID_PATTERN.test(incoming)
    ? incoming
    : crypto.randomUUID();
  const headers = new Headers(request.headers);
  headers.set("x-request-id", requestId);
  return { requestId, headers };
}

function withRequestId(response: NextResponse, requestId: string) {
  response.headers.set("X-Request-Id", requestId);
  return response;
}

function nextResponse(headers: Headers, requestId: string) {
  return withRequestId(NextResponse.next({ request: { headers } }), requestId);
}

export async function proxy(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;
  const { requestId, headers } = requestContext(request);

  // Allow Next.js internals and public tenant APIs
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/_next") ||
    pathname.startsWith("/api/health") ||
    pathname.startsWith("/api/tenant/") ||
    pathname.startsWith("/api/webhooks/") ||
    pathname.startsWith("/api/cron/") ||
    pathname === "/favicon.ico"
  ) {
    return nextResponse(headers, requestId);
  }

  // Get hostname of request (e.g. demo.ros.com, demo.localhost:3000)
  let hostname = request.headers.get('host') || '';
  hostname = hostname.split(':')[0]; // Remove port if present

  // 1. SUBDOMAIN ROUTING (B2B PORTAL)
  // If the hostname is NOT a root domain, it's a tenant subdomain
  const isVercelDomain = hostname.endsWith('.vercel.app');
  const isRootDomain = ROOT_DOMAINS.includes(hostname) || isVercelDomain;

  if (!isRootDomain) {
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
      return nextResponse(headers, requestId);
    }

    if (subdomain && subdomain !== 'app' && subdomain !== 'www') {
      // Rewrite the route to /tenant/[subdomain]/...
      // B2B portals are public, so we don't enforce authentication
      return withRequestId(
        NextResponse.rewrite(
          new URL(`/tenant/${subdomain}${pathname}${url.search}`, request.url),
          { request: { headers } },
        ),
        requestId,
      );
    }
  }

  // 2. MAIN SAAS APP (ROOT DOMAINS)
  // Allow public paths on main app
  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return nextResponse(headers, requestId);
  }

  // Read session from cookie
  const res = nextResponse(headers, requestId);
  const session = await getIronSession<{ user?: SessionUser }>(request, res, SESSION_OPTIONS);

  if (!session.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return withRequestId(NextResponse.redirect(loginUrl), requestId);
  }

  const role = session.user.role;

  // Role-based Access Control (RBAC)
  if (role === "OPERATOR") {
    const allowed = ["/dashboard", "/inventory", "/roasting", "/produksi"];
    if (!allowed.some(p => pathname.startsWith(p))) {
      return withRequestId(NextResponse.redirect(new URL("/dashboard", request.url)), requestId);
    }
  }

  if (role === "CASHIER") {
    const allowed = ["/dashboard", "/penjualan", "/master-data"];
    if (!allowed.some(p => pathname.startsWith(p))) {
      return withRequestId(NextResponse.redirect(new URL("/dashboard", request.url)), requestId);
    }
  }

  // Superadmin protection
  if (pathname.startsWith("/superadmin") && role !== "SUPERADMIN") {
    return withRequestId(NextResponse.redirect(new URL("/dashboard", request.url)), requestId);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
