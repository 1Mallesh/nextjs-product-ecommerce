import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Routes that require authentication (any role)
const AUTH_REQUIRED = [
  "/checkout",
  "/orders",
  "/wishlist",
  "/dashboard",
];

// Routes restricted to a specific role only
const ROLE_ONLY_ROUTES: Record<string, string[]> = {
  ADMIN: ["/dashboard/admin"],
  VENDOR: ["/dashboard/vendor", "/vendor/onboarding"],
  DELIVERY_BOY: ["/dashboard/delivery", "/delivery/onboarding"],
  CUSTOMER: ["/dashboard/customer"],
};

// Routes that are completely off-limits to customers
const CUSTOMER_FORBIDDEN = [
  "/dashboard/admin",
  "/dashboard/vendor",
  "/dashboard/delivery",
  "/vendor/onboarding",
  "/delivery/onboarding",
];

function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get("tokomort_access_token")?.value ?? null;
}

function getPayloadFromToken(token: string): { role?: string; sub?: string } | null {
  try {
    const base64 = token.split(".")[1];
    if (!base64) return null;
    // atob works in the Edge runtime
    return JSON.parse(atob(base64.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

function loginRedirect(req: NextRequest, pathname: string): NextResponse {
  const url = req.nextUrl.clone();
  url.pathname = "/auth/login";
  url.searchParams.set("redirect", pathname);
  return NextResponse.redirect(url);
}

function unauthorizedRedirect(req: NextRequest): NextResponse {
  return NextResponse.redirect(new URL("/unauthorized", req.url));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Let auth pages and public assets through
  if (pathname.startsWith("/auth/") || pathname.startsWith("/_next") || pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  const requiresAuth = AUTH_REQUIRED.some((r) => pathname.startsWith(r));
  if (!requiresAuth) return NextResponse.next();

  const token = getTokenFromRequest(request);

  // Not authenticated → login
  if (!token) return loginRedirect(request, pathname);

  const payload = getPayloadFromToken(token);
  const role = payload?.role ?? null;

  // Token unreadable → treat as unauthenticated
  if (!role) return loginRedirect(request, pathname);

  // CUSTOMER cannot access non-customer dashboards
  if (role === "CUSTOMER") {
    const forbidden = CUSTOMER_FORBIDDEN.some((r) => pathname.startsWith(r));
    if (forbidden) return unauthorizedRedirect(request);
    return NextResponse.next();
  }

  // Other roles: check they are on their own routes only
  for (const [requiredRole, routes] of Object.entries(ROLE_ONLY_ROUTES)) {
    const isRoleRoute = routes.some((r) => pathname.startsWith(r));
    if (isRoleRoute && role !== requiredRole) {
      return unauthorizedRedirect(request);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
    "/vendor/onboarding/:path*",
    "/vendor/onboarding",
    "/delivery/onboarding/:path*",
    "/delivery/onboarding",
  ],
};
