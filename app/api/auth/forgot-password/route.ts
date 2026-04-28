import { NextResponse } from "next/server";
import pool from "@/db";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "@/lib/email";

const RESET_TOKEN_EXPIRES_IN = "1h";
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000; // 1 hour in ms

/**
 * POST /api/auth/forgot-password
 *
 * Public endpoint — no login required.
 * Looks up the user by email, creates a single-use reset token,
 * stores it in the DB, and emails a reset link.
 *
 * Always returns 200 to prevent email enumeration.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = body?.email;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "email must be valid" },
        { status: 400 }
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 }
      );
    }

    // Look up user — but don't reveal existence in the response
    const [rows]: any = await pool.query(
      "SELECT user_id, email FROM `user` WHERE email = ? AND deleted_at IS NULL LIMIT 1",
      [email.toLowerCase().trim()]
    );

    if (rows.length > 0) {
      const user = rows[0];

      // Create a short-lived reset token
      const resetToken = jwt.sign(
        {
          userId: user.user_id,
          email: user.email,
          purpose: "password-reset",
        },
        secret,
        { expiresIn: RESET_TOKEN_EXPIRES_IN }
      );

      const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS)
        .toISOString()
        .slice(0, 19)
        .replace("T", " "); // MySQL DATETIME format

      // Upsert token (one per user)
      await pool.query(
        `INSERT INTO password_reset_token (user_id, token, expires_at, used_at)
         VALUES (?, ?, ?, NULL)
         ON DUPLICATE KEY UPDATE
           token      = VALUES(token),
           expires_at = VALUES(expires_at),
           used_at    = NULL`,
        [user.user_id, resetToken, expiresAt]
      );

      const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password/${resetToken}`;

      // 🔥 Safe email sending (works for all team members)
      try {
        await sendPasswordResetEmail({ to: user.email, resetUrl });
      } catch (err) {
        console.log("⚠ Email sending failed (DEV MODE)");
        console.log("RESET LINK:", resetUrl);
      }
    }

    // Always return success (prevents email enumeration)
    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error: any) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Request failed" },
      { status: 500 }
    );
  }
}
