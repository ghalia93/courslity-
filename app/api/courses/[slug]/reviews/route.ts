import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { type AuthUser, requireAuth } from "@/lib/auth";
import { calculateOverallRating } from "@/lib/reviewRatings";

type CourseLookupRow = RowDataPacket & {
  course_id: number;
  code: string;
};

type ReviewRow = RowDataPacket & {
  review_id: number;
  user_id: number;
  semester_taken: string;
  instructor_name: string;
  overall_rating: number | string;
  review_text: string;
  exam_difficulty_rating: number | string;
  workload_rating: number | string;
  attendance_rating: number | string;
  grading_rating: number | string;
  created_at: Date | string;
  upvotes: number | string;
  downvotes: number | string;
  net_votes: number | string;
  user_vote: number | string | null;
};

const VALID_SEMESTERS = ["Fall", "Spring", "Summer"];

function anonymousName(userId: number): string {
  const hash = createHash("sha256")
    .update(String(userId))
    .digest("hex")
    .slice(0, 6);

  return `Student${hash}`;
}

async function courseIdFromSlug(slug: string): Promise<number | null> {
  const normalizedSlug = slug.toUpperCase().replace(/-/g, " ");

  const [rows] = await pool.query<CourseLookupRow[]>(
    `
    SELECT course_id, code
    FROM course
    WHERE REPLACE(UPPER(code), '-', ' ') = ?
    LIMIT 1
    `,
    [normalizedSlug],
  );

  if (!rows || rows.length === 0) return null;
  return rows[0].course_id;
}

function normalizeSemester(value: unknown) {
  if (typeof value !== "string") return "";

  const normalized = value.trim().toLowerCase();
  return (
    VALID_SEMESTERS.find((semester) => semester.toLowerCase() === normalized) ??
    ""
  );
}

function isDuplicateEntry(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ER_DUP_ENTRY"
  );
}

async function getOptionalUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const courseId = await courseIdFromSlug(slug);

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get("sort") || "popular").trim();
    const currentUser = await getOptionalUser(req);

    const sortClause: Record<string, string> = {
      popular: "net_votes DESC, r.created_at DESC",
      newest: "r.created_at DESC",
      rating_high: "r.overall_rating DESC",
      rating_low: "r.overall_rating ASC",
    };

    const orderBy = sortClause[sort] ?? "r.created_at DESC";

    const [rows] = await pool.query<ReviewRow[]>(
      `
      SELECT
        r.review_id,
        r.user_id,
        r.semester_taken,
        r.instructor_name,
        r.overall_rating,
        r.review_text,
        r.exam_difficulty_rating,
        r.workload_rating,
        r.attendance_rating,
        r.grading_rating,
        r.created_at,
        COALESCE(SUM(CASE WHEN rv.vote_value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN rv.vote_value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
        COALESCE(SUM(CASE WHEN rv.vote_value = 1 THEN 1 WHEN rv.vote_value = -1 THEN -1 ELSE 0 END), 0) AS net_votes,
        (
          SELECT my_vote.vote_value
          FROM review_vote my_vote
          WHERE my_vote.review_id = r.review_id AND my_vote.user_id = ?
          LIMIT 1
        ) AS user_vote
      FROM review r
      LEFT JOIN review_vote rv ON rv.review_id = r.review_id
      WHERE r.course_id = ? AND r.deleted_at IS NULL
      GROUP BY
        r.review_id,
        r.user_id,
        r.semester_taken,
        r.instructor_name,
        r.overall_rating,
        r.review_text,
        r.exam_difficulty_rating,
        r.workload_rating,
        r.attendance_rating,
        r.grading_rating,
        r.created_at
      ORDER BY ${orderBy}
      `,
      [currentUser?.userId ?? 0, courseId],
    );

    const reviews = (rows ?? []).map((row) => ({
      review_id: row.review_id,
      anonymous_name: anonymousName(Number(row.user_id)),
      semester_taken: row.semester_taken,
      instructor_name: row.instructor_name,
      overall_rating: Number(row.overall_rating),
      review_text: row.review_text,
      exam_difficulty_rating: Number(row.exam_difficulty_rating),
      workload_rating: Number(row.workload_rating),
      attendance_rating: Number(row.attendance_rating),
      grading_rating: Number(row.grading_rating),
      upvotes: Number(row.upvotes),
      downvotes: Number(row.downvotes),
      net_votes: Number(row.net_votes),
      user_vote: row.user_vote == null ? null : Number(row.user_vote),
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error: unknown) {
    console.error("GET REVIEWS ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to load reviews" },
      { status: 500 },
    );
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const user = await requireAuth(req);

    const { slug } = await params;
    const courseId = await courseIdFromSlug(slug);

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const body = await req.json();

    const {
      instructor,
      semester,
      examDifficulty,
      attendanceStrictness,
      workload,
      gradingFairness,
      review,
    } = body;

    if (!instructor || typeof instructor !== "string" || !instructor.trim()) {
      return NextResponse.json(
        { success: false, message: "instructor name is required" },
        { status: 400 },
      );
    }

    const semesterTaken = normalizeSemester(semester);
    if (!semesterTaken) {
      return NextResponse.json(
        { success: false, message: "semester must be Fall, Spring, or Summer" },
        { status: 400 },
      );
    }

    if (!review || typeof review !== "string" || !review.trim()) {
      return NextResponse.json(
        { success: false, message: "review text is required" },
        { status: 400 },
      );
    }

    const sliderFields = {
      examDifficulty,
      attendanceStrictness,
      workload,
      gradingFairness,
    };

    for (const [field, val] of Object.entries(sliderFields)) {
      const n = Number(val);
      if (isNaN(n) || n < 1 || n > 5) {
        return NextResponse.json(
          { success: false, message: `${field} must be between 1 and 5` },
          { status: 400 },
        );
      }
    }

    const overallRating = calculateOverallRating({
      examDifficulty: Number(examDifficulty),
      attendanceStrictness: Number(attendanceStrictness),
      workload: Number(workload),
      gradingFairness: Number(gradingFairness),
    });

    try {
      await pool.query(
        `
        INSERT INTO review
          (
            user_id,
            course_id,
            semester_taken,
            review_text,
            instructor_name,
            overall_rating,
            exam_difficulty_rating,
            attendance_rating,
            workload_rating,
            grading_rating
          )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        [
          user.userId,
          courseId,
          semesterTaken,
          review.trim(),
          instructor.trim(),
          overallRating,
          Number(examDifficulty),
          Number(attendanceStrictness),
          Number(workload),
          Number(gradingFairness),
        ],
      );
    } catch (dbErr: unknown) {
      if (isDuplicateEntry(dbErr)) {
        return NextResponse.json(
          { success: false, message: "You have already reviewed this course" },
          { status: 409 },
        );
      }

      throw dbErr;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
        overallRating,
      },
      { status: 201 },
    );
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "You must be logged in to leave a review" },
        { status: 401 },
      );
    }

    console.error("POST REVIEW ERROR:", error);

    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 },
    );
  }
}
