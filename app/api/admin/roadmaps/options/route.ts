// Handles API admin roadmaps options requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { requireAdmin } from "@/lib/auth";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
};

type DepartmentRow = RowDataPacket & {
  department_id: number;
  name: string;
  university_id: number;
  university: string;
};

type MajorRow = RowDataPacket & {
  major_id: number;
  name: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

type CourseRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  credits: number;
  level: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureRoadmapTables();

    const [universities, departments, majors, courses] = await Promise.all([
      pool.query<UniversityRow[]>(
        `SELECT university_id, name, email_domain
        FROM university
        WHERE is_active = 1
        ORDER BY name ASC`,
      ),
      pool.query<DepartmentRow[]>(
        `SELECT
          d.department_id,
          d.name,
          u.university_id,
          u.name AS university
        FROM department d
        JOIN university u ON u.university_id = d.university_id
        WHERE d.is_active = 1
          AND u.is_active = 1
        ORDER BY u.name ASC, d.name ASC`,
      ),
      pool.query<MajorRow[]>(
        `SELECT
          m.major_id,
          m.name,
          d.department_id,
          d.name AS department,
          u.university_id,
          u.name AS university
        FROM major m
        JOIN department d ON d.department_id = m.department_id
        JOIN university u ON u.university_id = d.university_id
        WHERE m.is_active = 1
          AND d.is_active = 1
          AND u.is_active = 1
        ORDER BY u.name ASC, d.name ASC, m.name ASC`,
      ),
      pool.query<CourseRow[]>(
        `SELECT
          c.course_id,
          c.code,
          c.title,
          c.credits,
          c.level,
          d.department_id,
          d.name AS department,
          u.university_id,
          u.name AS university
        FROM course c
        JOIN department d ON d.department_id = c.department_id
        JOIN university u ON u.university_id = d.university_id
        WHERE c.deleted_at IS NULL
          AND d.is_active = 1
          AND u.is_active = 1
        ORDER BY u.name ASC, d.name ASC, c.code ASC`,
      ),
    ]);

    return NextResponse.json({
      success: true,
      universities: universities[0],
      departments: departments[0],
      majors: majors[0],
      courses: courses[0],
    });
  } catch (error: unknown) {
    console.error("GET ROADMAP OPTIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

