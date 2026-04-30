import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import { COURSE_LEVEL_VALUES, formatCourseLevel } from "@/lib/courseLevels";
import { ROADMAP_SEMESTER_VALUES } from "@/lib/roadmapOptions";
import { getRoadmaps } from "@/lib/roadmapQueries";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";
import type { RoadmapSemester } from "@/types/roadmap";

type DepartmentRow = RowDataPacket & {
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

type CourseIdRow = RowDataPacket & {
  course_id: number;
};

type MajorRow = RowDataPacket & {
  major_id: number;
  name: string;
  is_active: number;
};

type RoadmapIdRow = RowDataPacket & {
  roadmap_id: number;
};

type RoadmapCourseInput = {
  course_id: number;
  year_number: number;
  semester: RoadmapSemester;
  sequence_order: number;
};

function cleanMajorName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ");
}

function isValidLevel(value: string) {
  return (COURSE_LEVEL_VALUES as readonly string[]).includes(value);
}

function isValidSemester(value: string): value is RoadmapSemester {
  return (ROADMAP_SEMESTER_VALUES as readonly string[]).includes(value);
}

function normalizeCourseItems(value: unknown): RoadmapCourseInput[] | null {
  if (!Array.isArray(value)) return null;

  const seenCourseIds = new Set<number>();
  const normalized: RoadmapCourseInput[] = [];

  for (let index = 0; index < value.length; index += 1) {
    const item = value[index];
    const courseId = Number(item?.course_id);
    const yearNumber = Number(item?.year_number);
    const semester = String(item?.semester || "").toLowerCase();

    if (!Number.isInteger(courseId) || courseId <= 0) return null;
    if (!Number.isInteger(yearNumber) || yearNumber < 1 || yearNumber > 8) {
      return null;
    }
    if (!isValidSemester(semester)) return null;
    if (seenCourseIds.has(courseId)) return null;

    seenCourseIds.add(courseId);
    normalized.push({
      course_id: courseId,
      year_number: yearNumber,
      semester,
      sequence_order: index + 1,
    });
  }

  return normalized;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    const roadmaps = await getRoadmaps();

    return NextResponse.json({
      success: true,
      roadmaps,
    });
  } catch (error: unknown) {
    console.error("GET ADMIN ROADMAPS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const body = await req.json();
    const universityId = Number(body?.university_id);
    const departmentId = Number(body?.department_id);
    const majorName = cleanMajorName(body?.major_name);
    const level = typeof body?.level === "string" ? body.level : "";
    const totalCredits = Number(body?.total_credits);
    const courseItems = normalizeCourseItems(body?.courses);

    if (!Number.isInteger(universityId) || universityId <= 0) {
      return NextResponse.json(
        { success: false, message: "Select a university first." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(departmentId) || departmentId <= 0) {
      return NextResponse.json(
        { success: false, message: "Select a department first." },
        { status: 400 },
      );
    }

    if (!majorName) {
      return NextResponse.json(
        { success: false, message: "Major name is required." },
        { status: 400 },
      );
    }

    if (!isValidLevel(level)) {
      return NextResponse.json(
        { success: false, message: "Select a valid student level." },
        { status: 400 },
      );
    }

    if (
      !Number.isInteger(totalCredits) ||
      totalCredits < 1 ||
      totalCredits > 500
    ) {
      return NextResponse.json(
        { success: false, message: "Major credits must be between 1 and 500." },
        { status: 400 },
      );
    }

    if (!courseItems || courseItems.length === 0) {
      return NextResponse.json(
        { success: false, message: "Add at least one course to the timeline." },
        { status: 400 },
      );
    }

    const [departmentRows] = await pool.query<DepartmentRow[]>(
      `SELECT
        d.department_id,
        d.name AS department,
        u.university_id,
        u.name AS university
      FROM department d
      JOIN university u ON u.university_id = d.university_id
      WHERE d.department_id = ?
        AND u.university_id = ?
        AND d.is_active = 1
        AND u.is_active = 1
      LIMIT 1`,
      [departmentId, universityId],
    );

    if (!departmentRows.length) {
      return NextResponse.json(
        { success: false, message: "Department does not belong to this university." },
        { status: 400 },
      );
    }

    const courseIds = courseItems.map((item) => item.course_id);
    const placeholders = courseIds.map(() => "?").join(", ");
    const [courseRows] = await pool.query<CourseIdRow[]>(
      `SELECT c.course_id
      FROM course c
      JOIN department d ON d.department_id = c.department_id
      JOIN university u ON u.university_id = d.university_id
      WHERE c.course_id IN (${placeholders})
        AND c.department_id = ?
        AND u.university_id = ?
        AND c.deleted_at IS NULL
        AND d.is_active = 1
        AND u.is_active = 1`,
      [...courseIds, departmentId, universityId],
    );

    if (courseRows.length !== courseIds.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Every roadmap course must belong to the selected department.",
        },
        { status: 400 },
      );
    }

    const connection = await pool.getConnection();
    let roadmapId = 0;

    try {
      await connection.beginTransaction();

      const [existingMajorRows] = await connection.query<MajorRow[]>(
        `SELECT major_id, name, is_active
        FROM major
        WHERE department_id = ? AND LOWER(name) = LOWER(?)
        LIMIT 1`,
        [departmentId, majorName],
      );

      let majorId: number;
      if (existingMajorRows.length) {
        majorId = existingMajorRows[0].major_id;
        await connection.query(
          "UPDATE major SET name = ?, is_active = 1 WHERE major_id = ?",
          [majorName, majorId],
        );
      } else {
        const [majorResult] = await connection.query<ResultSetHeader>(
          "INSERT INTO major (department_id, name) VALUES (?, ?)",
          [departmentId, majorName],
        );
        majorId = majorResult.insertId;
      }

      const [existingRoadmapRows] = await connection.query<RoadmapIdRow[]>(
        "SELECT roadmap_id FROM roadmap WHERE major_id = ? AND level = ? LIMIT 1",
        [majorId, level],
      );

      const roadmapTitle =
        typeof body?.title === "string" && body.title.trim()
          ? body.title.trim()
          : `${majorName} ${formatCourseLevel(level)} Roadmap`;

      if (existingRoadmapRows.length) {
        roadmapId = existingRoadmapRows[0].roadmap_id;
        await connection.query(
          `UPDATE roadmap
          SET title = ?, total_credits = ?, is_published = 1, created_by = ?
          WHERE roadmap_id = ?`,
          [roadmapTitle, totalCredits, user.userId, roadmapId],
        );
        await connection.query(
          "DELETE FROM roadmap_course WHERE roadmap_id = ?",
          [roadmapId],
        );
      } else {
        const [roadmapResult] = await connection.query<ResultSetHeader>(
          `INSERT INTO roadmap
            (major_id, level, title, total_credits, is_published, created_by)
          VALUES (?, ?, ?, ?, 1, ?)`,
          [majorId, level, roadmapTitle, totalCredits, user.userId],
        );
        roadmapId = roadmapResult.insertId;
      }

      const values = courseItems.map((item) => [
        roadmapId,
        item.course_id,
        item.year_number,
        item.semester,
        item.sequence_order,
      ]);

      await connection.query(
        `INSERT INTO roadmap_course
          (roadmap_id, course_id, year_number, semester, sequence_order)
        VALUES ?`,
        [values],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    const [roadmap] = await getRoadmaps({ roadmapId });

    return NextResponse.json({
      success: true,
      message: "Roadmap saved successfully",
      roadmap,
    });
  } catch (error: unknown) {
    console.error("POST ADMIN ROADMAP ERROR:", error);

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

export async function DELETE(req: NextRequest) {
  try {
    await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const url = new URL(req.url);
    const roadmapId = Number(url.searchParams.get("roadmap_id"));

    if (!Number.isInteger(roadmapId) || roadmapId <= 0) {
      return NextResponse.json(
        { success: false, message: "Select a valid roadmap to delete." },
        { status: 400 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM roadmap WHERE roadmap_id = ?",
      [roadmapId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Roadmap not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Roadmap deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE ADMIN ROADMAP ERROR:", error);

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
