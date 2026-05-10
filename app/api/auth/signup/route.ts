// Handles API auth signup requests.
import { NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";
import bcrypt from "bcryptjs";

type ExistingUserRow = RowDataPacket & {
  user_id: number;
};

type UniversityRow = RowDataPacket & {
  university_id: number;
  email_domain: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const fullName = body?.fullName;
    const email = body?.email;
    const password = body?.password;
    const universityId = body?.universityId;

    if (!fullName || typeof fullName !== "string") {
      return NextResponse.json(
        { success: false, message: "fullName is required" },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 },
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "password is required" },
        { status: 400 },
      );
    }

    if (!universityId || typeof universityId !== "number") {
      return NextResponse.json(
        { success: false, message: "Valid universityId is required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    if (!/[0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least one number",
        },
        { status: 400 },
      );
    }

    if (!/[^a-zA-Z0-9]/.test(password)) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must contain at least one special character",
        },
        { status: 400 },
      );
    }

    const [existing] = await pool.query<ExistingUserRow[]>(
      "SELECT user_id FROM `user` WHERE email = ? LIMIT 1",
      [email],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 },
      );
    }

    const [uni] = await pool.query<UniversityRow[]>(
      "SELECT university_id, email_domain FROM university WHERE university_id = ? AND is_active = 1 LIMIT 1",
      [universityId],
    );

    if (uni.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university selected" },
        { status: 400 },
      );
    }

    const expectedDomain = uni[0].email_domain?.trim().toLowerCase();
    const typedDomain = email.split("@")[1]?.trim().toLowerCase() ?? "";

    if (expectedDomain && typedDomain !== expectedDomain) {
      return NextResponse.json(
        {
          success: false,
          message: `Email must use @${expectedDomain} for the selected university`,
        },
        { status: 400 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO `user` (full_name, email, password, role, university_id) VALUES (?, ?, ?, ?, ?)",
      [fullName, email, hashedPassword, "student", universityId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "User registered successfully",
        user: {
          id: result.insertId,
          fullName,
          email,
          universityId,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("SIGNUP ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Signup failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
