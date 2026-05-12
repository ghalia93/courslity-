// Handles API admin department majors requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";

type RouteContext = {
  params: Promise<{ id: string; departmentId: string }>;
};

type DepartmentScopeRow = RowDataPacket & {
  department_id: number;
};

type MajorRow = RowDataPacket & {
  major_id: number;
  name: string;
  is_active: number;
};

function parsePositiveInt(value: string | number | null | undefined) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

async function validateDepartmentScope(
  universityId: number,
  departmentId: number,
) {
  const [rows] = await pool.query<DepartmentScopeRow[]>(
    `SELECT d.department_id
      FROM department d
      JOIN university u ON u.university_id = d.university_id
      WHERE d.department_id = ?
        AND d.university_id = ?
        AND d.is_active = 1
        AND u.is_active = 1
      LIMIT 1`,
    [departmentId, universityId],
  );

  return rows.length > 0;
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await requireAdmin(req);
    await ensureRoadmapTables();

    const { id, departmentId } = await params;
    const universityId = parsePositiveInt(id);
    const selectedDepartmentId = parsePositiveInt(departmentId);

    if (!universityId || !selectedDepartmentId) {
      return NextResponse.json(
        { success: false, message: "Invalid university or department ID" },
        { status: 400 },
      );
    }

    if (!(await validateDepartmentScope(universityId, selectedDepartmentId))) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [rows] = await pool.query<MajorRow[]>(
      `SELECT major_id, name, is_active
        FROM major
        WHERE department_id = ?
          AND is_active = 1
        ORDER BY name ASC`,
      [selectedDepartmentId],
    );

    return NextResponse.json({
      success: true,
      majors: rows.map((major) => ({
        major_id: major.major_id,
        name: major.name,
      })),
    });
  } catch (error: unknown) {
    console.error("GET MAJORS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const { id, departmentId } = await params;
    const universityId = parsePositiveInt(id);
    const selectedDepartmentId = parsePositiveInt(departmentId);
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!universityId || !selectedDepartmentId) {
      return NextResponse.json(
        { success: false, message: "Invalid university or department ID" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Major name is required" },
        { status: 400 },
      );
    }

    if (!(await validateDepartmentScope(universityId, selectedDepartmentId))) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [existing] = await pool.query<MajorRow[]>(
      `SELECT major_id, name, is_active
        FROM major
        WHERE department_id = ?
          AND LOWER(name) = LOWER(?)
        LIMIT 1`,
      [selectedDepartmentId, name],
    );

    if (existing.length > 0) {
      const major = existing[0];

      if (!major.is_active) {
        await pool.query(
          "UPDATE major SET is_active = 1, name = ? WHERE major_id = ?",
          [name, major.major_id],
        );
      }

      return NextResponse.json({
        success: true,
        major: {
          major_id: major.major_id,
          name: major.is_active ? major.name : name,
        },
      });
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO major (department_id, name) VALUES (?, ?)",
      [selectedDepartmentId, name],
    );

    return NextResponse.json(
      {
        success: true,
        message: "Major created successfully",
        major: {
          major_id: result.insertId,
          name,
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST MAJOR ERROR:", error);
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

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const { id, departmentId } = await params;
    const universityId = parsePositiveInt(id);
    const selectedDepartmentId = parsePositiveInt(departmentId);
    const body = await req.json();
    const majorId = parsePositiveInt(body?.major_id);
    const name = typeof body?.name === "string" ? body.name.trim() : "";

    if (!universityId || !selectedDepartmentId || !majorId) {
      return NextResponse.json(
        { success: false, message: "Invalid university, department, or major ID" },
        { status: 400 },
      );
    }

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Major name is required" },
        { status: 400 },
      );
    }

    if (!(await validateDepartmentScope(universityId, selectedDepartmentId))) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [majorRows] = await pool.query<MajorRow[]>(
      `SELECT major_id, name, is_active
        FROM major
        WHERE major_id = ?
          AND department_id = ?
          AND is_active = 1
        LIMIT 1`,
      [majorId, selectedDepartmentId],
    );

    if (!majorRows.length) {
      return NextResponse.json(
        { success: false, message: "Major not found" },
        { status: 404 },
      );
    }

    const [duplicates] = await pool.query<MajorRow[]>(
      `SELECT major_id, name, is_active
        FROM major
        WHERE department_id = ?
          AND LOWER(name) = LOWER(?)
          AND major_id <> ?
          AND is_active = 1
        LIMIT 1`,
      [selectedDepartmentId, name, majorId],
    );

    if (duplicates.length) {
      return NextResponse.json(
        { success: false, message: "Another active major already has this name" },
        { status: 409 },
      );
    }

    await pool.query("UPDATE major SET name = ? WHERE major_id = ?", [
      name,
      majorId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Major updated successfully",
      major: { major_id: majorId, name },
    });
  } catch (error: unknown) {
    console.error("PATCH MAJOR ERROR:", error);
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

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const connection = await pool.getConnection();

  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const { id, departmentId } = await params;
    const universityId = parsePositiveInt(id);
    const selectedDepartmentId = parsePositiveInt(departmentId);
    const url = new URL(req.url);
    const body =
      req.headers.get("content-type")?.includes("application/json")
        ? await req.json().catch(() => ({}))
        : {};
    const majorId = parsePositiveInt(
      body?.major_id ?? url.searchParams.get("major_id"),
    );

    if (!universityId || !selectedDepartmentId || !majorId) {
      return NextResponse.json(
        { success: false, message: "Invalid university, department, or major ID" },
        { status: 400 },
      );
    }

    if (!(await validateDepartmentScope(universityId, selectedDepartmentId))) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [majorRows] = await connection.query<MajorRow[]>(
      `SELECT major_id, name, is_active
        FROM major
        WHERE major_id = ?
          AND department_id = ?
          AND is_active = 1
        LIMIT 1`,
      [majorId, selectedDepartmentId],
    );

    if (!majorRows.length) {
      return NextResponse.json(
        { success: false, message: "Major not found" },
        { status: 404 },
      );
    }

    await connection.beginTransaction();
    await connection.query(
      "UPDATE roadmap SET is_published = 0 WHERE major_id = ?",
      [majorId],
    );
    await connection.query("UPDATE major SET is_active = 0 WHERE major_id = ?", [
      majorId,
    ]);
    await connection.commit();

    return NextResponse.json({
      success: true,
      message: "Major deleted successfully",
      major_id: majorId,
    });
  } catch (error: unknown) {
    await connection.rollback().catch(() => {});
    console.error("DELETE MAJOR ERROR:", error);
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
