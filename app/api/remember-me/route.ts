import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { requireAuth } from "@/lib/auth";

const REMEMBER_ME_DAYS = 30;
const REMEMBER_ME_COOKIE = "remember_me_token";

/**
 * POST /api/auth/remember-me
 *
 * Protected — requires a valid Bearer token (the user must be logged in).
 * Call this right after login when the user has "Remember me" checked.
 *
 * Issues a long-lived httpOnly cookie so future visits can restore the session
 * without requiring the user to log in again.
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 },
      );
    }

    // Create a long-lived token scoped to "remember me" only
    const rememberMeToken = jwt.sign(
      {
        userId: user.userId,
        email: user.email,
        role: user.role,
        purpose: "remember-me",
      },
      secret,
      { expiresIn: `${REMEMBER_ME_DAYS}d` },
    );

    const response = NextResponse.json({
      success: true,
      message: "Remember me activated. You will be kept logged in.",
    });

    response.cookies.set(REMEMBER_ME_COOKIE, rememberMeToken, {
      httpOnly: true, // Not accessible via JS (XSS protection)
      secure: process.env.NODE_ENV === "production", // HTTPS only in prod
      sameSite: "lax", // CSRF protection
      maxAge: REMEMBER_ME_DAYS * 24 * 60 * 60, // seconds
      path: "/",
    });

    return response;
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "You must be logged in to use Remember Me" },
        { status: 401 },
      );
    }

    console.error("REMEMBER ME ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Request failed", error: error?.message },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/auth/remember-me
 *
 * Clears the remember-me cookie on logout.
 * No authentication required — a logged-out user may also call this to clean up.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: "Remember me cookie cleared.",
  });

  response.cookies.set(REMEMBER_ME_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0, // Immediately expire
    path: "/",
  });

  return response;
}
