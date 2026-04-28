import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import bcrypt from "bcryptjs";

type CountRow = RowDataPacket & {
  total: number;
};

type UserListRow = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  role: string;
  created_at: string | Date;
  deleted_at: string | Date | null;
  university_name: string | null;
};

type ExistingUserRow = RowDataPacket & {
  user_id: number;
};

//display users (admin: user management table)
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") || 10)));
    const q = (searchParams.get("q") || "").trim();

    const offset = (page - 1) * limit;

    let where = "";
    const params: string[] = [];

    if (q) {
      where = `WHERE u.full_name LIKE ? OR u.email LIKE ?`;
      params.push(`%${q}%`, `%${q}%`);
    }

    // Total count
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total FROM user u ${where}`,
      params
    );

    const total = countRows[0].total;

    // Data query
    const [rows] = await pool.query<UserListRow[]>(
      `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.role,
        u.created_at,
        u.deleted_at,
        uni.name AS university_name
      FROM user u
      LEFT JOIN university uni 
        ON uni.university_id = u.university_id
      ${where}
      ORDER BY u.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const users = rows.map((user) => ({
      id: user.user_id,
      name: user.full_name,
      email: user.email,
      university: user.university_name,
      role: user.role,
      joined: user.created_at,
      active: !user.deleted_at,
      isProtected: !user.deleted_at && user.role === "admin",
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total
      }
    });

  } catch {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
}

//add admin (user management)
export async function POST(req: NextRequest) {
  try {
    const currentAdmin = await requireAdmin(req);

    const body = await req.json();
    const fullName = body?.fullName;
    const email = body?.email;
    const password = body?.password;
    const requestedRole = body?.role ?? "admin";

    if (!fullName || typeof fullName !== "string") {
      return NextResponse.json(
        { success: false, message: "fullName is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "email is required" },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, message: "password is required" },
        { status: 400 }
      );
    }

    if (!email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "email must be valid" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "password must be at least 6 characters" },
        { status: 400 }
      );
    }

    if (requestedRole !== "admin" && requestedRole !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "role must be admin or super_admin" },
        { status: 400 }
      );
    }

    if (requestedRole === "super_admin" && currentAdmin.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only University Admins can create University Admin accounts" },
        { status: 403 }
      );
    }

    // Check if email exists
    const [existing] = await pool.query<ExistingUserRow[]>(
      "SELECT user_id FROM `user` WHERE email = ? LIMIT 1",
      [email]
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO `user` (full_name, email, password, role) VALUES (?, ?, ?, ?)",
      [fullName, email, hashedPassword, requestedRole]
    );

    const roleLabel =
      requestedRole === "super_admin" ? "University Admin" : "Admin";

    return NextResponse.json(
      {
        success: true,
        message: `${roleLabel} created successfully`,
        user: {
          id: result.insertId,
          name: fullName,
          email,
          role: requestedRole
        }
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
}
