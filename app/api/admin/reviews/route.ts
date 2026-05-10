// Handles API admin reviews requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type ReviewQueryParam = string | number;

type CountRow = RowDataPacket & {
  total: number;
};

type AdminReviewRow = RowDataPacket & {
  review_id: number;
  reviewer_name: string;
  reviewer_email: string;
  course_code: string;
  course_title: string;
  university: string;
  department: string;
  semester_taken: string;
  review_text: string;
  instructor_name: string;
  overall_rating: number | string;
  grading_rating: number | string;
  workload_rating: number | string;
  attendance_rating: number | string;
  exam_difficulty_rating: number | string;
  upvotes: number | string;
  downvotes: number | string;
  created_at: string;
};

/**
 * GET /api/admin/reviews
 *
 * Returns paginated reviews with full join data matching the ReviewRow type
 * expected by the frontend (AdminReviewsPage).
 *
 * Query params:
 *   page        - page number (default 1)
 *   limit       - results per page (default 20, max 50)
 *   q           - search across course code/title, reviewer name/email,
 *                 instructor name, review text
 *   university  - filter by university name
 *   department  - filter by department name
 *   semester    - filter by semester_taken
 *   rating      - filter by floor(overall_rating): "1"-"5"
 *   sort        - newest | oldest | rating_high | rating_low | most_votes
 */
export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number(searchParams.get("page") || 1));
    const limit = Math.min(
      50,
      Math.max(1, Number(searchParams.get("limit") || 20)),
    );
    const offset = (page - 1) * limit;

    const q = (searchParams.get("q") || "").trim();
    const university = (searchParams.get("university") || "").trim();
    const department = (searchParams.get("department") || "").trim();
    const semester = (searchParams.get("semester") || "").trim();
    const rating = (searchParams.get("rating") || "").trim();
    const sort = (searchParams.get("sort") || "newest").trim();

    // Build dynamic WHERE conditions
    const conditions: string[] = ["r.deleted_at IS NULL"];
    const params: ReviewQueryParam[] = [];

    if (q) {
      conditions.push(`(
        c.code            LIKE ? OR
        c.title           LIKE ? OR
        u.full_name       LIKE ? OR
        u.email           LIKE ? OR
        r.instructor_name LIKE ? OR
        r.review_text     LIKE ?
      )`);
      const like = `%${q}%`;
      params.push(like, like, like, like, like, like);
    }

    if (university) {
      conditions.push("uni.name = ?");
      params.push(university);
    }

    if (department) {
      conditions.push("d.name = ?");
      params.push(department);
    }

    if (semester) {
      conditions.push("r.semester_taken = ?");
      params.push(semester);
    }

    if (rating && ["1", "2", "3", "4", "5"].includes(rating)) {
      conditions.push("FLOOR(r.overall_rating) = ?");
      params.push(Number(rating));
    }

    const where = `WHERE ${conditions.join(" AND ")}`;

    // Sort mapping
    const sortClause: Record<string, string> = {
      newest: "r.created_at DESC",
      oldest: "r.created_at ASC",
      rating_high: "r.overall_rating DESC",
      rating_low: "r.overall_rating ASC",
      most_votes: `(
  COALESCE(SUM(CASE WHEN rv.vote_value =  1 THEN 1 ELSE 0 END), 0) +
  COALESCE(SUM(CASE WHEN rv.vote_value = -1 THEN 1 ELSE 0 END), 0)
) DESC`,
    };
    const orderBy = sortClause[sort] ?? "r.created_at DESC";

    // Total count
    const [countRows] = await pool.query<CountRow[]>(
      `SELECT COUNT(*) AS total
        FROM review r
        JOIN \`user\`    u   ON u.user_id       = r.user_id
        JOIN course      c   ON c.course_id     = r.course_id
        JOIN department  d   ON d.department_id = c.department_id
        JOIN university  uni ON uni.university_id = d.university_id
        ${where}`,
      params,
    );

    const total = countRows[0].total;

    // Data query - aggregate vote counts inline
    const [rows] = await pool.query<AdminReviewRow[]>(
      `SELECT
        r.review_id,
        u.full_name                                        AS reviewer_name,
        u.email                                            AS reviewer_email,
        c.code                                             AS course_code,
        c.title                                            AS course_title,
        uni.name                                           AS university,
        d.name                                             AS department,
        r.semester_taken,
        r.review_text,
        r.instructor_name,
        r.overall_rating,
        r.grading_rating,
        r.workload_rating,
        r.attendance_rating,
        r.exam_difficulty_rating,
        COALESCE(SUM(CASE WHEN rv.vote_value =  1 THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN rv.vote_value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
        DATE_FORMAT(r.created_at, '%Y-%m-%d')             AS created_at
        FROM review r
        JOIN \`user\`    u   ON u.user_id       = r.user_id
        JOIN course      c   ON c.course_id     = r.course_id
        JOIN department  d   ON d.department_id = c.department_id
        JOIN university  uni ON uni.university_id = d.university_id
        LEFT JOIN review_vote rv ON rv.review_id = r.review_id
        ${where}
        GROUP BY
          r.review_id, u.full_name, u.email,
          c.code, c.title, uni.name, d.name,
          r.semester_taken, r.review_text, r.instructor_name,
          r.overall_rating, r.grading_rating, r.workload_rating,
          r.attendance_rating, r.exam_difficulty_rating, r.created_at
        ORDER BY ${orderBy}
        LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return NextResponse.json({
      success: true,
      reviews: rows,
      pagination: { page, limit, total },
    });
  } catch (error: unknown) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
