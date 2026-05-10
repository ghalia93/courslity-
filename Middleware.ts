// Protects authenticated and admin routes before requests reach the app.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const AUTH_COOKIE = "auth_token";

export async function middleware(req: NextRequest) {
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
      const isAdminRole =
        role === "admin" ||
        role === "super_admin" ||
        role === "administrator" ||
        role === "university_admin" ||
        role === "university admin";
      if (isAdminRoute && !isAdminRole) {
        return NextResponse.redirect(new URL("/", req.url));
      }

    } catch {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  if (isAuthPage && token) {
    try {
      await jwtVerify(token, encodedSecret);
      return NextResponse.redirect(new URL("/", req.url));
    } catch {}
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
