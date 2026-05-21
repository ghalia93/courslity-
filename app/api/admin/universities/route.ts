// Handles API admin universities requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureUniversityDescriptionColumn } from "@/lib/universityDb";

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
  description: string | null;
  is_active: number;
};

type UniversityListRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
  description: string | null;
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
    await ensureUniversityDescriptionColumn();

    const [rows] = await pool.query<UniversityListRow[]>(
      `SELECT university_id, name, email_domain, description
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
    await ensureUniversityDescriptionColumn();

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";
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

    if (description.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Description is too long" },
        { status: 400 },
      );
    }

    const [existing] = await pool.query<UniversityRow[]>(
      "SELECT university_id, name, email_domain, description, is_active FROM university WHERE LOWER(name) = LOWER(?) LIMIT 1",
      [name],
    );

    if (existing.length > 0) {
      const university = existing[0];

      if (!university.is_active) {
        await pool.query(
          "UPDATE university SET is_active = 1, name = ?, email_domain = ?, description = ? WHERE university_id = ?",
          [name, emailDomain, description || null, university.university_id],
        );
      } else if (
        university.email_domain !== emailDomain ||
        description !== (university.description ?? "")
      ) {
        await pool.query(
          "UPDATE university SET email_domain = ?, description = ? WHERE university_id = ?",
          [emailDomain, description || null, university.university_id],
        );
      }

      return NextResponse.json({
        success: true,
        university: {
          university_id: university.university_id,
          name: university.is_active ? university.name : name,
          email_domain: emailDomain,
          description: description || university.description || "",
        },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO university (name, email_domain, description) VALUES (?, ?, ?)",
      [name, emailDomain, description || null],
    );

    return NextResponse.json(
      {
        success: true,
        message: "University created successfully",
        university: {
          university_id: result.insertId,
          name,
          email_domain: emailDomain,
          description,
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

/**
 * PATCH /api/admin/universities
 *
 * Updates a university description. University Admin only.
 */
export async function PATCH(req: NextRequest) {
  try {
    await requireUniversityAdmin(req);
    await ensureUniversityDescriptionColumn();

    const body = await req.json();
    const universityId = Number(body?.university_id ?? body?.universityId);
    const description =
      typeof body?.description === "string" ? body.description.trim() : "";

    if (!Number.isInteger(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid university is required" },
        { status: 400 },
      );
    }

    if (description.length > 5000) {
      return NextResponse.json(
        { success: false, message: "Description is too long" },
        { status: 400 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE university SET description = ? WHERE university_id = ? AND is_active = 1",
      [description || null, universityId],
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 },
      );
    }

    const [rows] = await pool.query<UniversityListRow[]>(
      `SELECT university_id, name, email_domain, description
       FROM university
       WHERE university_id = ?
       LIMIT 1`,
      [universityId],
    );

    return NextResponse.json({
      success: true,
      message: "University description updated",
      university: rows[0],
    });
  } catch (error: unknown) {
    console.error("PATCH UNIVERSITY ERROR:", error);
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
