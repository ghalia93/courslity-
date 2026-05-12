// Handles API admin universities id departments requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";

type DepartmentRow = RowDataPacket & {
  department_id: number;
  name: string;
  is_active: number;
};

type UniversityIdRow = RowDataPacket & {
  university_id: number;
};

type DepartmentListRow = RowDataPacket & {
  department_id: number;
  name: string;
};

type DepartmentScopeRow = RowDataPacket & {
  department_id: number;
  name: string;
};

/**
 * GET /api/admin/universities/[id]/departments
 *
 * Returns all active departments belonging to the given university,
 * ordered alphabetically.
 *
 * Response:
 * {
 *   success: true,
 *   departments: { department_id: number, name: string }[]
 * }
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university ID" },
        { status: 400 },
      );
    }

    // Confirm the university exists
    const [uniRows] = await pool.query<UniversityIdRow[]>(
      "SELECT university_id FROM university WHERE university_id = ? AND is_active = 1 LIMIT 1",
      [universityId],
    );

    if (!uniRows || uniRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 },
      );
    }

    const [rows] = await pool.query<DepartmentListRow[]>(
      `SELECT department_id, name
        FROM department
        WHERE university_id = ? AND is_active = 1
        ORDER BY name ASC`,
      [universityId],
    );

    return NextResponse.json({
      success: true,
      departments: rows,
    });
  } catch (error: unknown) {
    console.error("GET DEPARTMENTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * POST /api/admin/universities/[id]/departments
 *
 * Creates a department under a university. University Admin only.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUniversityAdmin(req);

    const { id } = await params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 },
      );
    }

    const [uniRows] = await pool.query<UniversityIdRow[]>(
      "SELECT university_id FROM university WHERE university_id = ? AND is_active = 1 LIMIT 1",
      [universityId],
    );

    if (!uniRows || uniRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 },
      );
    }

    const [existing] = await pool.query<DepartmentRow[]>(
      `SELECT department_id, name, is_active
        FROM department
        WHERE university_id = ? AND LOWER(name) = LOWER(?)
        LIMIT 1`,
      [universityId, name],
    );

    if (existing.length > 0) {
      const department = existing[0];

      if (!department.is_active) {
        await pool.query(
          "UPDATE department SET is_active = 1, name = ? WHERE department_id = ?",
          [name, department.department_id],
        );
      }

      return NextResponse.json({
        success: true,
        department: {
          department_id: department.department_id,
          name: department.is_active ? department.name : name,
        },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO department (name, university_id) VALUES (?, ?)",
      [name, universityId],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Department created successfully",
        department: {
          department_id: result.insertId,
          name,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST DEPARTMENT ERROR:", error);
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
 * PATCH /api/admin/universities/[id]/departments
 *
 * Renames an active department under a university. University Admin only.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const { id } = await params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university ID" },
        { status: 400 },
      );
    }

    const body = await req.json();
    const departmentId = Number(body?.department_id);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { success: false, message: "department_id is required" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Department name is required" },
        { status: 400 },
      );
    }

    const [departmentRows] = await pool.query<DepartmentScopeRow[]>(
      `SELECT department_id, name
        FROM department
        WHERE department_id = ?
          AND university_id = ?
          AND is_active = 1
        LIMIT 1`,
      [departmentId, universityId],
    );

    if (!departmentRows.length) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [duplicates] = await pool.query<DepartmentScopeRow[]>(
      `SELECT department_id, name
        FROM department
        WHERE university_id = ?
          AND LOWER(name) = LOWER(?)
          AND department_id <> ?
          AND is_active = 1
        LIMIT 1`,
      [universityId, name, departmentId],
    );

    if (duplicates.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Another active department already has this name",
        },
        { status: 409 },
      );
    }

    await pool.query("UPDATE department SET name = ? WHERE department_id = ?", [
      name,
      departmentId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Department updated successfully",
      department: { department_id: departmentId, name },
    });
  } catch (error: unknown) {
    console.error("PATCH DEPARTMENT ERROR:", error);
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
 * DELETE /api/admin/universities/[id]/departments
 *
 * Soft-deactivates a department, its majors, and their published roadmaps.
 * Courses and reviews stay in the database.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const connection = await pool.getConnection();

  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const { id } = await params;
    const universityId = parseInt(id, 10);

    if (isNaN(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid university ID" },
        { status: 400 },
      );
    }

    const url = new URL(req.url);
    const body =
      req.headers.get("content-type")?.includes("application/json")
        ? await req.json().catch(() => ({}))
        : {};
    const departmentId = Number(
      body?.department_id ?? url.searchParams.get("department_id"),
    );

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { success: false, message: "department_id is required" },
        { status: 400 },
      );
    }

    const [departmentRows] = await connection.query<DepartmentScopeRow[]>(
      `SELECT department_id, name
        FROM department
        WHERE department_id = ?
          AND university_id = ?
          AND is_active = 1
        LIMIT 1`,
      [departmentId, universityId],
    );

    if (!departmentRows.length) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    await connection.beginTransaction();
    await connection.query(
      `UPDATE roadmap r
        JOIN major m ON m.major_id = r.major_id
        SET r.is_published = 0
        WHERE m.department_id = ?`,
      [departmentId],
    );
    await connection.query(
      "UPDATE major SET is_active = 0 WHERE department_id = ?",
      [departmentId],
    );
    await connection.query(
      "UPDATE department SET is_active = 0 WHERE department_id = ?",
      [departmentId],
    );
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Department deleted successfully",
      department_id: departmentId,
    });
  } catch (error: unknown) {
    await connection.rollback().catch(() => {});
    console.error("DELETE DEPARTMENT ERROR:", error);
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
  } finally {
    connection.release();
  }
}
