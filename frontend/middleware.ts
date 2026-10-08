import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function decodeRole(token: string | undefined): string | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    // JWT uses base64url — edge runtime has atob but no Buffer.
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = JSON.parse(atob(base64));
    return typeof json.role === "string" ? json.role : null;
  } catch {
    return null;
  }
}

const ADMIN_PREFIXES = ["/dashboard/admin"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  // Protect all dashboard + roommate tooling at the route level.
  // (UI-level checks live in ProtectedRoute + role-aware sidebar.)
  const isProtected = pathname.startsWith("/dashboard") || pathname.startsWith("/roommates");

  if (isProtected && !token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin-only sections need ADMIN role.
  if (token && ADMIN_PREFIXES.some((p) => pathname.startsWith(p))) {
    const role = decodeRole(token);
    if (role !== "ADMIN") {
      const denied = req.nextUrl.clone();
      denied.pathname = "/dashboard";
      return NextResponse.redirect(denied);
    }
  }

  // Keep logged-in users out of auth pages.
  if (token && (pathname === "/login" || pathname === "/register")) {
    const dash = req.nextUrl.clone();
    dash.pathname = "/dashboard";
    return NextResponse.redirect(dash);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/roommates/:path*", "/login", "/register"],
};
