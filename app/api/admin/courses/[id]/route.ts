import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";
import { COURSE_LEVEL_VALUES } from "@/lib/courseLevels";

type CourseDetailRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  language: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
  deleted_at: Date | string | null;
  rating: number | string;
  number_of_reviews: number | string;
  exam: number | string;
  workload: number | string;
  attendance: number | string;
  grading: number | string;
};

type CourseIdRow = RowDataPacket & {
  course_id: number;
};

type PrerequisiteRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
};

type DepartmentIdRow = RowDataPacket & {
  department_id: number;
};

/**
 * GET /api/admin/courses/[id]
 *
 * Returns a single course with the full Course shape (including nested metrics)
 * plus its prerequisites list.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const courseId = parseInt(id, 10);

    if (isNaN(courseId) || courseId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<CourseDetailRow[]>(
      `SELECT
        c.course_id,
        c.code,
        c.title,
        c.description,
        c.credits,
        c.level,
        c.language,
        c.department_id,
        d.name                                                AS department,
        uni.university_id,
        uni.name                                              AS university,
        c.deleted_at,
        COALESCE(ROUND(AVG(r.overall_rating),         2), 0) AS rating,
        COUNT(r.review_id)                                    AS number_of_reviews,
        COALESCE(ROUND(AVG(r.exam_difficulty_rating), 2), 0) AS exam,
        COALESCE(ROUND(AVG(r.workload_rating),        2), 0) AS workload,
        COALESCE(ROUND(AVG(r.attendance_rating),      2), 0) AS attendance,
        COALESCE(ROUND(AVG(r.grading_rating),         2), 0) AS grading
      FROM course c
      JOIN department  d   ON d.department_id   = c.department_id
      JOIN university  uni ON uni.university_id  = d.university_id
      LEFT JOIN review r   ON r.course_id = c.course_id AND r.deleted_at IS NULL
      WHERE c.course_id = ?
      GROUP BY
        c.course_id, c.code, c.title, c.description, c.credits,
        c.level, c.language, c.department_id, d.name,
        uni.university_id, uni.name, c.deleted_at`,
      [courseId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const row = rows[0];

    // Fetch prerequisites
    const [prereqs] = await pool.query<PrerequisiteRow[]>(
      `SELECT c.course_id, c.code, c.title
        FROM course_prerequisite cp
        JOIN course c ON c.course_id = cp.prereq_course_id
        WHERE cp.course_id = ? AND c.deleted_at IS NULL`,
      [courseId],
    );

    const course = {
      course_id: row.course_id,
      code: row.code,
      title: row.title,
      description: row.description,
      credits: row.credits,
      level: row.level,
      language: row.language,
      department_id: row.department_id,
      department: row.department,
      university_id: row.university_id,
      university: row.university,
      deleted_at: row.deleted_at,
      rating: Number(row.rating),
      number_of_reviews: Number(row.number_of_reviews),
      metrics: {
        exam: Number(row.exam),
        workload: Number(row.workload),
        attendance: Number(row.attendance),
        grading: Number(row.grading),
      },
      prerequisites: prereqs,
    };

    return NextResponse.json({ success: true, course });
  } catch (error: unknown) {
    console.error("GET COURSE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * PATCH /api/admin/courses/[id]
 *
 * Partially updates a course. Only fields present in the body are updated.
 * Course `code` is intentionally not patchable — changing a code breaks
 * existing references. Delete and recreate instead.
 *
 * Body (all optional): {
 *   title, description, credits, language, level, department_id
 * }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUniversityAdmin(req);

    const { id } = await params;
    const courseId = parseInt(id, 10);

    if (isNaN(courseId) || courseId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 },
      );
    }

    // Confirm the course exists and is not deleted
    const [existing] = await pool.query<CourseIdRow[]>(
      "SELECT course_id FROM course WHERE course_id = ? AND deleted_at IS NULL LIMIT 1",
      [courseId],
    );

    if (!existing || existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const { title, description, credits, language, level, department_id } =
      body;

    const setClauses: string[] = [];
    const values: Array<string | number> = [];

    if (title !== undefined) {
      if (typeof title !== "string" || !title.trim()) {
        return NextResponse.json(
          { success: false, message: "title must be a non-empty string" },
          { status: 400 },
        );
      }
      setClauses.push("title = ?");
      values.push(title.trim());
    }

    if (description !== undefined) {
      if (typeof description !== "string" || !description.trim()) {
        return NextResponse.json(
          { success: false, message: "description must be a non-empty string" },
          { status: 400 },
        );
      }
      setClauses.push("description = ?");
      values.push(description.trim());
    }

    if (credits !== undefined) {
      const c = Number(credits);
      if (isNaN(c) || c < 1 || c > 9) {
        return NextResponse.json(
          { success: false, message: "credits must be between 1 and 9" },
          { status: 400 },
        );
      }
      setClauses.push("credits = ?");
      values.push(c);
    }

    const validLanguages = [
      "English",
      "Arabic",
      "French",
      "German",
      "Spanish",
      "Other",
    ];
    if (language !== undefined) {
      if (!validLanguages.includes(language)) {
        return NextResponse.json(
          {
            success: false,
            message: `language must be one of: ${validLanguages.join(", ")}`,
          },
          { status: 400 },
        );
      }
      setClauses.push("language = ?");
      values.push(language);
    }

    const validLevels = COURSE_LEVEL_VALUES;
    if (level !== undefined) {
      if (!validLevels.includes(level)) {
        return NextResponse.json(
          {
            success: false,
            message: `level must be one of: ${validLevels.join(", ")}`,
          },
          { status: 400 },
        );
      }
      setClauses.push("level = ?");
      values.push(level);
    }

    if (department_id !== undefined) {
      const deptId = Number(department_id);
      if (isNaN(deptId)) {
        return NextResponse.json(
          { success: false, message: "department_id must be a number" },
          { status: 400 },
        );
      }
      const [deptRows] = await pool.query<DepartmentIdRow[]>(
        "SELECT department_id FROM department WHERE department_id = ? AND is_active = 1 LIMIT 1",
        [deptId],
      );
      if (!deptRows || deptRows.length === 0) {
        return NextResponse.json(
          { success: false, message: "Department not found" },
          { status: 404 },
        );
      }
      setClauses.push("department_id = ?");
      values.push(deptId);
    }

    if (setClauses.length === 0) {
      return NextResponse.json(
        { success: false, message: "No valid fields provided to update" },
        { status: 400 },
      );
    }

    values.push(courseId);
    await pool.query(
      `UPDATE course SET ${setClauses.join(", ")} WHERE course_id = ?`,
      values,
    );

    return NextResponse.json({
      success: true,
      message: "Course updated successfully",
    });
  } catch (error: unknown) {
    console.error("PATCH COURSE ERROR:", error);
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
 * DELETE /api/admin/courses/[id]
 *
 * Soft-deletes a course by setting deleted_at = NOW().
 * Reviews and prerequisites are preserved for historical reference.
 * The frontend marks the row as "Deleted" with opacity-50 styling.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireUniversityAdmin(req);

    const { id } = await params;
    const courseId = parseInt(id, 10);

    if (isNaN(courseId) || courseId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid course ID" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<CourseIdRow[]>(
      "SELECT course_id FROM course WHERE course_id = ? AND deleted_at IS NULL LIMIT 1",
      [courseId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE course SET deleted_at = NOW() WHERE course_id = ?",
      [courseId],
    );

    return NextResponse.json({
      success: true,
      message: "Course deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE COURSE ERROR:", error);
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
