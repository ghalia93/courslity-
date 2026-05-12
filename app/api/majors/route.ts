// Handles API majors requests.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type MajorRow = RowDataPacket & {
  major_id: number;
  name: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

function getPositiveIntParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const universityId = getPositiveIntParam(
      url.searchParams.get("university_id"),
    );
    const departmentId = getPositiveIntParam(
      url.searchParams.get("department_id"),
    );
    const university = (url.searchParams.get("university") || "")
      .trim()
      .toLowerCase();
    const department = (url.searchParams.get("department") || "")
      .trim()
      .toLowerCase();

    const conditions = [
      "m.is_active = 1",
      "d.is_active = 1",
      "u.is_active = 1",
      `EXISTS (
        SELECT 1
        FROM roadmap r_public
        INNER JOIN roadmap_course rc_public
          ON rc_public.roadmap_id = r_public.roadmap_id
        INNER JOIN course c_public
          ON c_public.course_id = rc_public.course_id
        WHERE r_public.major_id = m.major_id
          AND r_public.is_published = 1
          AND c_public.deleted_at IS NULL
      )`,
    ];
    const params: Array<number | string> = [];

    if (universityId) {
      conditions.push("u.university_id = ?");
      params.push(universityId);
    } else if (university) {
      conditions.push("LOWER(u.name) = ?");
      params.push(university);
    }

    if (departmentId) {
      conditions.push("d.department_id = ?");
      params.push(departmentId);
    } else if (department) {
      conditions.push("LOWER(d.name) = ?");
      params.push(department);
    }

    const [rows] = await pool.query<MajorRow[]>(
      `SELECT
        m.major_id,
        m.name,
        d.department_id,
        d.name AS department,
        u.university_id,
        u.name AS university
      FROM major m
      INNER JOIN department d ON d.department_id = m.department_id
      INNER JOIN university u ON u.university_id = d.university_id
      WHERE ${conditions.join(" AND ")}
      ORDER BY u.name ASC, d.name ASC, m.name ASC`,
      params,
    );

    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error("MAJORS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load majors" },
      { status: 500 },
    );
  }
}
