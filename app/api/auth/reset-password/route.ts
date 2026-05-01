import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ensurePasswordResetTable } from "@/lib/passwordReset";

type ResetTokenRow = RowDataPacket & {
  token: string;
  expires_at: string | Date;
  used_at: string | Date | null;
  is_expired: number;
};

type UserIdRow = RowDataPacket & {
  user_id: number;
};

/**
 * POST /api/auth/reset-password
 *
 * Public endpoint — the user arrives here via the emailed link and is not logged in.
 * Validates the token, ensures it hasn't been used or expired,
 * hashes the new password, and updates the user record.
 *
 * Accepts: { token: string, password: string }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { token, password } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, message: "token is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "password is required" },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "password must be at least 6 characters" },
        { status: 400 },
      );
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 },
      );
    }

    // 1) Verify the JWT signature and expiry
    let payload: { userId: number; email: string; purpose: string };
    try {
      payload = jwt.verify(token, secret) as typeof payload;
    } catch {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    // 2) Ensure this token was issued for a password reset (not a session token)
    if (payload.purpose !== "password-reset") {
      return NextResponse.json(
        { success: false, message: "Invalid reset token" },
        { status: 400 },
      );
    }

    await ensurePasswordResetTable();

    // 3) Look up the stored token record
    const [rows] = await pool.query<ResetTokenRow[]>(
      `SELECT token, expires_at, used_at, expires_at < NOW() AS is_expired
        FROM password_reset_token
        WHERE user_id = ?
        LIMIT 1`,
      [payload.userId],
    );

    if (rows.length === 0 || rows[0].token !== token) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    const record = rows[0];

    const [userRows] = await pool.query<UserIdRow[]>(
      "SELECT user_id FROM `user` WHERE user_id = ? AND deleted_at IS NULL LIMIT 1",
      [payload.userId],
    );

    if (userRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset link" },
        { status: 400 },
      );
    }

    // 4) Ensure it hasn't already been used
    if (record.used_at !== null) {
      return NextResponse.json(
        { success: false, message: "This reset link has already been used" },
        { status: 400 },
      );
    }

    // 5) Ensure it hasn't expired in the DB (double-check beyond JWT expiry)
    if (Number(record.is_expired) === 1) {
      return NextResponse.json(
        {
          success: false,
          message: "This reset link has expired. Please request a new one.",
        },
        { status: 400 },
      );
    }

    // 6) Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      // Update the user's password
      await conn.query(
        "UPDATE `user` SET password = ? WHERE user_id = ? AND deleted_at IS NULL",
        [hashedPassword, payload.userId],
      );

      // Mark the reset token as used so it can't be replayed
      await conn.query(
        "UPDATE password_reset_token SET used_at = NOW() WHERE user_id = ?",
        [payload.userId],
      );

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    return NextResponse.json({
      success: true,
      message: "Password has been successfully reset",
    });
  } catch (error: unknown) {
    console.error("RESET PASSWORD ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Reset failed",
        error: error instanceof Error ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
