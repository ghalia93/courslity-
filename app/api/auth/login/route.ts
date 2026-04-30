import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { normalizeRole } from "@/lib/roles";

type LoginUserRow = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  password: string;
  role: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const email = body?.email;
    const password = body?.password;
    const remember = body?.remember === true;

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "Password is required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Email must be valid" },
        { status: 400 }
      );
    }

    const [rows] = await pool.query<LoginUserRow[]>(
      "SELECT user_id, full_name, email, password, role FROM `user` WHERE email = ? AND deleted_at IS NULL LIMIT 1",
      [email]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = rows[0];
    const role = normalizeRole(user.role);

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      return NextResponse.json(
        { success: false, message: "Server misconfigured: JWT_SECRET missing" },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      {
        userId: user.user_id,
        email: user.email,
        role,
      },
      secret,
      { expiresIn: "2h" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.user_id,
        fullName: user.full_name,
        email: user.email,
        role,
      },
    });

    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      ...(remember ? { maxAge: 60 * 60 * 24 * 30 } : {}),
    });

    return response;
  } catch (error: unknown) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
