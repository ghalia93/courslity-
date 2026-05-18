// Handles API admin courses requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin, requireUniversityAdmin } from "@/lib/auth";
import pool from "@/db";
import { getSemesterFromCourseCode, getYearFromCourseCode } from "@/lib/courseCode";
import { COURSE_LEVEL_VALUES, formatCourseLevel } from "@/lib/courseLevels";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";
import { notifyStudentsAboutCourse } from "@/lib/notificationsDb";

type AdminCourseRow = RowDataPacket & {
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
  majorIds: string | null;
  majors: string | null;
  deleted_at: Date | string | null;
  rating: number | string;
  number_of_reviews: number | string;
  exam: number | string;
  workload: number | string;
  attendance: number | string;
  grading: number | string;
};

type DepartmentCourseRow = RowDataPacket & {
  department_id: number;
  name: string;
  university_id: number;
  university: string;
};

type ExistingCourseRow = RowDataPacket & {
  course_id: number;
};

type MajorCourseRow = RowDataPacket & {
  major_id: number;
  name: string;
};

type RoadmapIdRow = RowDataPacket & {
  roadmap_id: number;
};

type SequenceRow = RowDataPacket & {
  next_order: number | string | null;
};

/**
 * GET /api/admin/courses
 *
 * Returns major-linked courses (including soft-deleted) so the frontend can
 * show them with an "opacity-50 / Deleted" style and let the status filter
 * work in-memory.
 *
 * Filtering by university, department, level, language, and status is handled
 * by the frontend useMemo - matching how the page is built.
 *
 * Query params:
 *   q     - search across code, title, department name, university name
 *   sort  - rating_high | rating_low | reviews_most  (default: rating_high)
 *
 * Response shape matches the Course type in the frontend exactly:
 * {
 *   course_id, code, title, description, credits, level, language,
 *   department_id, department, university_id, university, deleted_at,
 *   rating, number_of_reviews,
 *   metrics: { exam, workload, attendance, grading }
 * }
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureRoadmapTables();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const sort = (searchParams.get("sort") || "rating_high").trim();

    const conditions = [
      `EXISTS (
        SELECT 1
        FROM roadmap_course rc_required
        INNER JOIN roadmap r_required
          ON r_required.roadmap_id = rc_required.roadmap_id
          AND r_required.is_published = 1
        INNER JOIN major m_required
          ON m_required.major_id = r_required.major_id
          AND m_required.is_active = 1
        WHERE rc_required.course_id = c.course_id
          AND m_required.department_id = c.department_id
      )`,
    ];
    const params: string[] = [];

    if (q) {
      conditions.push(`(
        c.code  LIKE ? OR
        c.title LIKE ? OR
        d.name  LIKE ? OR
        uni.name LIKE ? OR
        EXISTS (
          SELECT 1
          FROM roadmap_course rc_search
          JOIN roadmap r_search
            ON r_search.roadmap_id = rc_search.roadmap_id
            AND r_search.is_published = 1
          JOIN major m_search
            ON m_search.major_id = r_search.major_id
            AND m_search.is_active = 1
          WHERE rc_search.course_id = c.course_id
            AND m_search.name LIKE ?
        )
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like);
    }

    const where =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortClause: Record<string, string> = {
      rating_high: "rating DESC",
      rating_low: "rating ASC",
      reviews_most: "number_of_reviews DESC",
    };
    const orderBy = sortClause[sort] ?? "rating DESC";

    const [rows] = await pool.query<AdminCourseRow[]>(
      `SELECT
        c.course_id,
        c.code,
        c.title,
        c.description,
        c.credits,
        c.level,
        c.language,
        c.department_id,
        d.name                                              AS department,
        uni.university_id,
        uni.name                                            AS university,
        GROUP_CONCAT(DISTINCT m.major_id ORDER BY m.name ASC) AS majorIds,
        GROUP_CONCAT(DISTINCT m.name ORDER BY m.name ASC SEPARATOR '||') AS majors,
        c.deleted_at,
        COALESCE(ROUND(AVG(r.overall_rating),    2), 0)    AS rating,
        COUNT(DISTINCT r.review_id)                         AS number_of_reviews,
        COALESCE(ROUND(AVG(r.exam_difficulty_rating), 2), 0) AS exam,
        COALESCE(ROUND(AVG(r.workload_rating),        2), 0) AS workload,
        COALESCE(ROUND(AVG(r.attendance_rating),      2), 0) AS attendance,
        COALESCE(ROUND(AVG(r.grading_rating),         2), 0) AS grading
      FROM course c
      JOIN department  d   ON d.department_id   = c.department_id
      JOIN university  uni ON uni.university_id  = d.university_id
      LEFT JOIN review r   ON r.course_id = c.course_id AND r.deleted_at IS NULL
      LEFT JOIN roadmap_course rc_major
        ON rc_major.course_id = c.course_id
      LEFT JOIN roadmap roadmap_major
        ON roadmap_major.roadmap_id = rc_major.roadmap_id
        AND roadmap_major.is_published = 1
      LEFT JOIN major m
        ON m.major_id = roadmap_major.major_id
        AND m.department_id = c.department_id
        AND m.is_active = 1
      ${where}
      GROUP BY
        c.course_id, c.code, c.title, c.description, c.credits,
        c.level, c.language, c.department_id, d.name,
        uni.university_id, uni.name, c.deleted_at
      ORDER BY ${orderBy}`,
      params,
    );

    // Reshape flat metric columns into the nested metrics object the frontend expects
    const courses = rows.map((row) => ({
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
      majorIds: row.majorIds
        ? row.majorIds
            .split(",")
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        : [],
      majors: row.majors ? row.majors.split("||").filter(Boolean) : [],
      deleted_at: row.deleted_at,
      rating: Number(row.rating),
      number_of_reviews: Number(row.number_of_reviews),
      metrics: {
        exam: Number(row.exam),
        workload: Number(row.workload),
        attendance: Number(row.attendance),
        grading: Number(row.grading),
      },
    }));

    return NextResponse.json({
      success: true,
      courses,
    });
  } catch (error: unknown) {
    console.error("GET COURSES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * POST /api/admin/courses
 *
 * Creates a new course. Admin only.
 *
 * Body: {
 *   code: string,
 *   title: string,
 *   description: string,
 *   credits: number,         // 1-9
 *   language: string,        // English | Arabic | French | German | Spanish | Other
 *   level: string,           // freshman | undergraduate | graduate | master_degree | doctoral
 *   department_id: number,
 *   major_id: number,
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUniversityAdmin(req);
    await ensureRoadmapTables();

    const body = await req.json();
    const {
      code,
      title,
      description,
      credits,
      language,
      level,
      department_id,
      major_id,
    } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { success: false, message: "code is required" },
        { status: 400 },
      );
    }

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { success: false, message: "title is required" },
        { status: 400 },
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { success: false, message: "description is required" },
        { status: 400 },
      );
    }

    const creditsNum = Number(credits);
    if (!credits || isNaN(creditsNum) || creditsNum < 1 || creditsNum > 9) {
      return NextResponse.json(
        { success: false, message: "credits must be a number between 1 and 9" },
        { status: 400 },
      );
    }

    const validLanguages = [
      "English",
      "Arabic",
      "French",
      "German",
      "Spanish",
      "Other",
    ];
    if (!language || !validLanguages.includes(language)) {
      return NextResponse.json(
        {
          success: false,
          message: `language must be one of: ${validLanguages.join(", ")}`,
        },
        { status: 400 },
      );
    }

    const validLevels = COURSE_LEVEL_VALUES;
    if (!level || !validLevels.includes(level)) {
      return NextResponse.json(
        {
          success: false,
          message: `level must be one of: ${validLevels.join(", ")}`,
        },
        { status: 400 },
      );
    }

    if (!department_id || isNaN(Number(department_id))) {
      return NextResponse.json(
        { success: false, message: "department_id is required" },
        { status: 400 },
      );
    }

    if (!major_id || isNaN(Number(major_id))) {
      return NextResponse.json(
        { success: false, message: "major_id is required" },
        { status: 400 },
      );
    }

    const departmentId = Number(department_id);
    const majorId = Number(major_id);
    const cleanCode = code.trim();
    const cleanTitle = title.trim();
    const cleanDescription = description.trim();

    // Verify department exists and is active
    const [deptRows] = await pool.query<DepartmentCourseRow[]>(
      `SELECT d.department_id, d.name, d.university_id, u.name AS university
        FROM department d
        JOIN university u ON u.university_id = d.university_id
        WHERE d.department_id = ? AND d.is_active = 1 AND u.is_active = 1
        LIMIT 1`,
      [departmentId],
    );

    if (!deptRows || deptRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Department not found" },
        { status: 404 },
      );
    }

    const [majorRows] = await pool.query<MajorCourseRow[]>(
      `SELECT major_id, name
        FROM major
        WHERE major_id = ?
          AND department_id = ?
          AND is_active = 1
        LIMIT 1`,
      [majorId, departmentId],
    );

    if (!majorRows.length) {
      return NextResponse.json(
        {
          success: false,
          message: "Major not found in the selected department",
        },
        { status: 404 },
      );
    }

    // Prevent duplicate code within the same department
    const [existing] = await pool.query<ExistingCourseRow[]>(
      "SELECT course_id FROM course WHERE code = ? AND department_id = ? AND deleted_at IS NULL LIMIT 1",
      [cleanCode, departmentId],
    );

    if (existing.length > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A course with this code already exists in the selected department",
        },
        { status: 409 },
      );
    }

    const yearNumber = getYearFromCourseCode(cleanCode) ?? 1;
    const semester = getSemesterFromCourseCode(cleanCode) ?? "fall";
    const roadmapTitle = `${majorRows[0].name} ${formatCourseLevel(
      level,
    )} Roadmap`;

    const connection = await pool.getConnection();
    let courseId = 0;

    try {
      await connection.beginTransaction();

      const [result] = await connection.query<ResultSetHeader>(
        `INSERT INTO course (code, title, description, credits, language, level, department_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          cleanCode,
          cleanTitle,
          cleanDescription,
          creditsNum,
          language,
          level,
          departmentId,
        ],
      );

      courseId = result.insertId;

      await connection.query(
        `INSERT INTO roadmap
          (major_id, level, title, total_credits, is_published, created_by)
        VALUES (?, ?, ?, 0, 1, ?)
        ON DUPLICATE KEY UPDATE
          title = IF(title = '', VALUES(title), title),
          is_published = 1`,
        [majorId, level, roadmapTitle, user.userId],
      );

      const [roadmapRows] = await connection.query<RoadmapIdRow[]>(
        "SELECT roadmap_id FROM roadmap WHERE major_id = ? AND level = ? LIMIT 1",
        [majorId, level],
      );

      const roadmapId = roadmapRows[0]?.roadmap_id;
      if (!roadmapId) {
        throw new Error("Failed to create or load roadmap for selected major");
      }

      const [sequenceRows] = await connection.query<SequenceRow[]>(
        `SELECT COALESCE(MAX(sequence_order), 0) + 10 AS next_order
        FROM roadmap_course
        WHERE roadmap_id = ?
          AND year_number = ?
          AND semester = ?`,
        [roadmapId, yearNumber, semester],
      );

      const sequenceOrder = Number(sequenceRows[0]?.next_order ?? 10);

      await connection.query(
        `INSERT IGNORE INTO roadmap_course
          (roadmap_id, course_id, year_number, semester, sequence_order)
        VALUES (?, ?, ?, ?, ?)`,
        [roadmapId, courseId, yearNumber, semester, sequenceOrder],
      );

      await connection.query(
        `UPDATE roadmap r
        SET total_credits = (
          SELECT COALESCE(SUM(c.credits), 0)
          FROM roadmap_course rc
          JOIN course c ON c.course_id = rc.course_id
          WHERE rc.roadmap_id = r.roadmap_id
            AND c.deleted_at IS NULL
        )
        WHERE r.roadmap_id = ?`,
        [roadmapId],
      );

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

    try {
      await notifyStudentsAboutCourse({
        universityId: deptRows[0].university_id,
        courseCode: cleanCode,
        courseTitle: cleanTitle,
      });
    } catch (notificationError) {
      console.error("COURSE NOTIFICATION ERROR:", notificationError);
    }

    // Return the full Course shape so the frontend can prepend it to state directly
    return NextResponse.json(
      {
        success: true,
        message: "Course created successfully",
        course: {
          course_id: courseId,
          code: cleanCode,
          title: cleanTitle,
          description: cleanDescription,
          credits: creditsNum,
          language,
          level,
          department_id: departmentId,
          department: deptRows[0].name ?? "",
          majorIds: [majorId],
          majors: [majorRows[0].name],
          university_id: deptRows[0].university_id,
          university: deptRows[0].university ?? "",
          deleted_at: null,
          rating: 0,
          number_of_reviews: 0,
          metrics: { exam: 0, workload: 0, attendance: 0, grading: 0 },
        },
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    console.error("POST COURSE ERROR:", error);
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
