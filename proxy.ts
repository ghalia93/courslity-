// Protects authenticated and admin routes before requests reach the app.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth_token";

function isAdminRole(role: string) {
  const normalized = role.trim().toLowerCase();
  return (
    normalized === "admin" ||
    normalized === "super_admin" ||
    normalized === "administrator" ||
    normalized === "university_admin" ||
    normalized === "university admin"
  );
}

export async function proxy(req: NextRequest) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return NextResponse.next();

  const encodedSecret = new TextEncoder().encode(secret);
  const token = req.cookies.get(AUTH_COOKIE)?.value;
  const pathname = req.nextUrl.pathname;

  const isAdminRoute = pathname.startsWith("/admin");
  const isProtectedRoute =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile");

  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/signup");

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, encodedSecret);

      const role = String((payload as { role?: string }).role ?? "")
        .trim()
        .toLowerCase();
      if (isAdminRoute && !isAdminRole(role)) {
        return NextResponse.redirect(new URL("/", req.url));
      }

    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAuthPage && token) {
    try {
      const { payload } = await jwtVerify(token, encodedSecret);
      const role = String((payload as { role?: string }).role ?? "");
      return NextResponse.redirect(
        new URL(isAdminRole(role) ? "/admin" : "/", req.url),
      );
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
