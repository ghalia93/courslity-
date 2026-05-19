// Handles API profile requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";
import { requireAuth } from "@/lib/auth";
import { domainMatches } from "@/lib/universityEmail";

type ProfileRow = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  university_id: number | null;
  university_name: string | null;
  email_domain: string | null;
};

type ExistingUserRow = RowDataPacket & {
  user_id: number;
};

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string | null;
};

async function getProfile(userId: number) {
  const [rows] = await pool.query<ProfileRow[]>(
    `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        u.university_id,
        un.name AS university_name,
        un.email_domain
      FROM \`user\` u
      LEFT JOIN university un 
        ON u.university_id = un.university_id
      WHERE u.user_id = ?
        AND u.deleted_at IS NULL
      LIMIT 1
      `,
    [userId],
  );

  return rows[0] ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const profile = await getProfile(user.userId);

    if (!profile) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: profile,
    });
  } catch (error: unknown) {
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const fullName = body?.fullName;
    const email = body?.email;
    const universityId = Number(body?.universityId);

    if (!fullName || typeof fullName !== "string" || !fullName.trim()) {
      return NextResponse.json(
        { success: false, message: "Full name is required" },
        { status: 400 },
      );
    }

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(universityId) || universityId < 1) {
      return NextResponse.json(
        { success: false, message: "Please select a valid university" },
        { status: 400 },
      );
    }

    const normalizedFullName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, message: "Valid email is required" },
        { status: 400 },
      );
    }

    const [universities] = await pool.query<UniversityRow[]>(
      "SELECT university_id, name, email_domain FROM university WHERE university_id = ? AND is_active = 1 LIMIT 1",
      [universityId],
    );

    if (universities.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university selected" },
        { status: 400 },
      );
    }

    const expectedDomain = universities[0].email_domain?.trim().toLowerCase();
    const typedDomain = normalizedEmail.split("@")[1]?.trim().toLowerCase() ?? "";

    if (expectedDomain && !domainMatches(typedDomain, expectedDomain)) {
      return NextResponse.json(
        {
          success: false,
          message: `Email must use @${expectedDomain} for the selected university`,
        },
        { status: 400 },
      );
    }

    const [existing] = await pool.query<ExistingUserRow[]>(
      "SELECT user_id FROM `user` WHERE email = ? AND user_id <> ? AND deleted_at IS NULL LIMIT 1",
      [normalizedEmail, user.userId],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE `user` SET full_name = ?, email = ?, university_id = ? WHERE user_id = ? AND deleted_at IS NULL",
      [normalizedFullName, normalizedEmail, universityId, user.userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    const profile = await getProfile(user.userId);

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully",
      data: profile,
    });
  } catch (error: unknown) {
    console.error("PROFILE PATCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
