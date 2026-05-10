// Handles API admin universities requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
  is_active: number;
};

type UniversityListRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
};

function normalizeEmailDomain(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/^@+/, "").toLowerCase();
}

/**
 * GET /api/admin/universities
 *
 * Returns all active universities ordered alphabetically.
 *
 * Response:
 * {
 *   success: true,
 *   universities: { university_id: number, name: string, email_domain: string }[]
 * }
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const [rows] = await pool.query<UniversityListRow[]>(
      `SELECT university_id, name, email_domain
        FROM university
        WHERE is_active = 1
        ORDER BY name ASC`,
    );

    return NextResponse.json({
      success: true,
      universities: rows,
    });
  } catch (error: unknown) {
    console.error("GET UNIVERSITIES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * POST /api/admin/universities
 *
 * Creates a university. University Admin only.
 */
export async function POST(req: NextRequest) {
  try {
    await requireUniversityAdmin(req);

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const emailDomain = normalizeEmailDomain(
      body?.emailDomain ?? body?.email_domain,
    );

    if (!name) {
      return NextResponse.json(
        { success: false, message: "University name is required" },
        { status: 400 },
      );
    }

    if (!emailDomain || !emailDomain.includes(".")) {
      return NextResponse.json(
        { success: false, message: "Expected email domain is required" },
        { status: 400 },
      );
    }

    const [existing] = await pool.query<UniversityRow[]>(
      "SELECT university_id, name, email_domain, is_active FROM university WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [name],
    );

    if (existing.length > 0) {
      const university = existing[0];

      if (!university.is_active) {
        await pool.query(
          "UPDATE university SET is_active = 1, name = ?, email_domain = ? WHERE university_id = ?",
          [name, emailDomain, university.university_id],
        );
      } else if (university.email_domain !== emailDomain) {
        await pool.query(
          "UPDATE university SET email_domain = ? WHERE university_id = ?",
          [emailDomain, university.university_id],
        );
      }

      return NextResponse.json({
        success: true,
        university: {
          university_id: university.university_id,
          name: university.is_active ? university.name : name,
          email_domain: emailDomain,
        },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO university (name, email_domain) VALUES (?, ?)",
      [name, emailDomain],
    );

    return NextResponse.json(
      {
        success: true,
        message: "University created successfully",
        university: {
          university_id: result.insertId,
          name,
          email_domain: emailDomain,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST UNIVERSITY ERROR:", error);
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json(
        { success: false, message: "You are not the University Admin" },
        { status: 403 },
      );
    }

    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
