// Handles API auth logout requests.
import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({
    success: true,
    message: "Logged out successfully",
  });

  // Clear auth cookie
  res.cookies.set("auth_token", "", {
    maxAge: 0,
    path: "/",
  });

  // Clear remember-me cookie
  res.cookies.set("remember_me_token", "", {
    maxAge: 0,
    path: "/",
  });

  return res;
}