import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_ROUTES = [
  "/dashboard",
  "/checkout",
  "/orders",
];

const ROLE_ROUTES: Record<string, string[]> = {
  ADMIN: ["/dashboard/admin"],
  VENDOR: ["/dashboard/vendor", "/vendor/onboarding"],
  DELIVERY_BOY: ["/dashboard/delivery", "/delivery/onboarding"],
  CUSTOMER: ["/dashboard/customer"],
};

function getTokenFromRequest(req: NextRequest): string | null {
  return req.cookies.get("tokomort_access_token")?.value ?? null;
}

function getRoleFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((r) => pathname.startsWith(r));

  if (!isProtected) return NextResponse.next();

  const token = getTokenFromRequest(request);

  if (!token) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  const role = getRoleFromToken(token);

  for (const [requiredRole, routes] of Object.entries(ROLE_ROUTES)) {
    const isRoleRoute = routes.some((r) => pathname.startsWith(r));
    if (isRoleRoute && role !== requiredRole) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/vendor/onboarding/:path*",
    "/delivery/onboarding/:path*",
  ],
};
