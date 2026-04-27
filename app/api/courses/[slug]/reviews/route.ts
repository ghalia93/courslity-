import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import pool from "@/db";
import { requireAuth } from "@/lib/auth";

function anonymousName(userId: number): string {
  const hash = createHash("sha256")
    .update(String(userId))
    .digest("hex")
    .slice(0, 6);

  return `Student${hash}`;
}

async function courseIdFromSlug(slug: string): Promise<number | null> {
  const normalizedSlug = slug.toUpperCase().replace(/-/g, " ");

  const [rows]: any = await pool.query(
    `
    SELECT course_id, code
    FROM course
    WHERE REPLACE(UPPER(code), '-', ' ') = ?
    LIMIT 1
    `,
    [normalizedSlug]
  );

  if (!rows || rows.length === 0) return null;
  return rows[0].course_id;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const courseId = await courseIdFromSlug(slug);

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get("sort") || "popular").trim();

    const sortClause: Record<string, string> = {
      popular: "r.created_at DESC",
      newest: "r.created_at DESC",
      rating_high: "r.overall_rating DESC",
      rating_low: "r.overall_rating ASC",
    };

    const orderBy = sortClause[sort] ?? "r.created_at DESC";

    const [rows]: any = await pool.query(
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
        r.created_at
      FROM review r
      WHERE r.course_id = ?
      ORDER BY ${orderBy}
      `,
      [courseId]
    );

    const reviews = (rows ?? []).map((row: any) => ({
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
      upvotes: 0,
      downvotes: 0,
      net_votes: 0,
      created_at: row.created_at,
    }));

    return NextResponse.json({
      success: true,
      total: reviews.length,
      reviews,
    });
  } catch (error: any) {
    console.error("GET REVIEWS ERROR:", error?.message, error?.stack || error);

    return NextResponse.json(
      { success: false, message: "Failed to load reviews" },
      { status: 500 }
    );
  }
}
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = requireAuth(req);

    const { slug } = await params;
    const courseId = await courseIdFromSlug(slug);

    if (!courseId) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 }
      );
    }

    const body = await req.json();

    const {
      overallRating,
      instructor,
      semester,
      examDifficulty,
      attendanceStrictness,
      workload,
      gradingFairness,
      review,
    } = body;

    if (
      !overallRating ||
      isNaN(Number(overallRating)) ||
      Number(overallRating) < 1 ||
      Number(overallRating) > 5
    ) {
      return NextResponse.json(
        { success: false, message: "overallRating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (!instructor || typeof instructor !== "string" || !instructor.trim()) {
      return NextResponse.json(
        { success: false, message: "instructor name is required" },
        { status: 400 }
      );
    }

    if (!semester || typeof semester !== "string" || !semester.trim()) {
      return NextResponse.json(
        { success: false, message: "semester is required" },
        { status: 400 }
      );
    }

    if (!review || typeof review !== "string" || !review.trim()) {
      return NextResponse.json(
        { success: false, message: "review text is required" },
        { status: 400 }
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
          { status: 400 }
        );
      }
    }

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
          semester.trim(),
          review.trim(),
          instructor.trim(),
          Number(overallRating),
          Number(examDifficulty),
          Number(attendanceStrictness),
          Number(workload),
          Number(gradingFairness),
        ]
      );
    } catch (dbErr: any) {
      if (dbErr?.code === "ER_DUP_ENTRY") {
        return NextResponse.json(
          { success: false, message: "You have already reviewed this course" },
          { status: 409 }
        );
      }

      throw dbErr;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Review submitted successfully",
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "You must be logged in to leave a review" },
        { status: 401 }
      );
    }

    console.error("POST REVIEW ERROR:", error?.message, error?.stack || error);

    return NextResponse.json(
      { success: false, message: "Failed to submit review" },
      { status: 500 }
    );
  }
}