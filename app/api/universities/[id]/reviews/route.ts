// Handles public university reviews.
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { type AuthUser, requireAuth } from "@/lib/auth";
import { ensureUniversityReviewTables } from "@/lib/universityReviewDb";

type UniversityRow = RowDataPacket & {
  university_id: number;
};

type UniversityReviewRow = RowDataPacket & {
  review_id: number;
  user_id: number;
  overall_rating: number | string;
  review_text: string;
  academic_quality_rating: number | string;
  professors_rating: number | string;
  facilities_rating: number | string;
  tuition_value_rating: number | string;
  student_life_rating: number | string;
  created_at: Date | string;
  upvotes: number | string;
  downvotes: number | string;
  net_votes: number | string;
  user_vote: number | string | null;
};

function anonymousName(userId: number): string {
  const hash = createHash("sha256")
    .update(String(userId))
    .digest("hex")
    .slice(0, 6);

  return `Student${hash}`;
}

function parseUniversityId(value: string) {
  const universityId = Number.parseInt(value, 10);
  return Number.isInteger(universityId) && universityId > 0
    ? universityId
    : null;
}

function normalizeRating(value: unknown) {
  const rating = Number(value);
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) return null;
  return rating;
}

function calculateOverallRating(values: number[]) {
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
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

async function universityExists(universityId: number) {
  const [rows] = await pool.query<UniversityRow[]>(
    "SELECT university_id FROM university WHERE university_id = ? AND is_active = 1 LIMIT 1",
    [universityId],
  );

  return rows.length > 0;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await ensureUniversityReviewTables();

    const { id } = await params;
    const universityId = parseUniversityId(id);

    if (!universityId || !(await universityExists(universityId))) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(req.url);
    const sort = (searchParams.get("sort") || "newest").trim();
    const currentUser = await getOptionalUser(req);

    const upvotesExpr =
      "COALESCE(SUM(CASE WHEN urv.vote_value = 1 THEN 1 ELSE 0 END), 0)";
    const downvotesExpr =
      "COALESCE(SUM(CASE WHEN urv.vote_value = -1 THEN 1 ELSE 0 END), 0)";
    const netVotesExpr = `(${upvotesExpr} - ${downvotesExpr})`;
    const totalVotesExpr = `(${upvotesExpr} + ${downvotesExpr})`;

    const sortClause: Record<string, string> = {
      newest: "ur.created_at DESC",
      oldest: "ur.created_at ASC",
      rating_high: "ur.overall_rating DESC, ur.created_at DESC",
      rating_low: "ur.overall_rating ASC, ur.created_at DESC",
      most_votes: `${totalVotesExpr} DESC, ${netVotesExpr} DESC, ur.created_at DESC`,
    };

    const orderBy = sortClause[sort] ?? "ur.created_at DESC";

    const [rows] = await pool.query<UniversityReviewRow[]>(
      `SELECT
        ur.university_review_id AS review_id,
        ur.user_id,
        ur.overall_rating,
        ur.review_text,
        ur.academic_quality_rating,
        ur.professors_rating,
        ur.facilities_rating,
        ur.tuition_value_rating,
        ur.student_life_rating,
        ur.created_at,
        COALESCE(SUM(CASE WHEN urv.vote_value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
        COALESCE(SUM(CASE WHEN urv.vote_value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
        COALESCE(SUM(CASE WHEN urv.vote_value = 1 THEN 1 WHEN urv.vote_value = -1 THEN -1 ELSE 0 END), 0) AS net_votes,
        (
          SELECT my_vote.vote_value
          FROM university_review_vote my_vote
          WHERE my_vote.university_review_id = ur.university_review_id
            AND my_vote.user_id = ?
          LIMIT 1
        ) AS user_vote
      FROM university_review ur
      LEFT JOIN university_review_vote urv
        ON urv.university_review_id = ur.university_review_id
      WHERE ur.university_id = ?
        AND ur.deleted_at IS NULL
        AND ur.hidden_at IS NULL
      GROUP BY
        ur.university_review_id,
        ur.user_id,
        ur.overall_rating,
        ur.review_text,
        ur.academic_quality_rating,
        ur.professors_rating,
        ur.facilities_rating,
        ur.tuition_value_rating,
        ur.student_life_rating,
        ur.created_at
      ORDER BY ${orderBy}`,
      [currentUser?.userId ?? 0, universityId],
    );

    const reviews = rows.map((row) => ({
      review_id: row.review_id,
      anonymous_name: anonymousName(Number(row.user_id)),
      overall_rating: Number(row.overall_rating),
      review_text: row.review_text,
      academic_quality_rating: Number(row.academic_quality_rating),
      professors_rating: Number(row.professors_rating),
      facilities_rating: Number(row.facilities_rating),
      tuition_value_rating: Number(row.tuition_value_rating),
      student_life_rating: Number(row.student_life_rating),
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
    console.error("GET UNIVERSITY REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load university reviews" },
      { status: 500 },
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(req);
    await ensureUniversityReviewTables();

    const { id } = await params;
    const universityId = parseUniversityId(id);

    if (!universityId || !(await universityExists(universityId))) {
      return NextResponse.json(
        { success: false, message: "University not found" },
        { status: 404 },
      );
    }

    const body = await req.json();
    const review = String(body?.review || "").trim();
    const academicQuality = normalizeRating(body?.academicQuality);
    const professors = normalizeRating(body?.professors);
    const facilities = normalizeRating(body?.facilities);
    const tuitionValue = normalizeRating(body?.tuitionValue);
    const studentLife = normalizeRating(body?.studentLife);

    if (!review) {
      return NextResponse.json(
        { success: false, message: "review text is required" },
        { status: 400 },
      );
    }

    if (review.length > 2000) {
      return NextResponse.json(
        { success: false, message: "review text is too long" },
        { status: 400 },
      );
    }

    const ratings = [
      academicQuality,
      professors,
      facilities,
      tuitionValue,
      studentLife,
    ];

    if (ratings.some((rating) => rating === null)) {
      return NextResponse.json(
        { success: false, message: "ratings must be between 1 and 5" },
        { status: 400 },
      );
    }

    const ratingValues = ratings as number[];
    const overallRating = calculateOverallRating(ratingValues);

    try {
      await pool.query(
        `INSERT INTO university_review
          (
            user_id,
            university_id,
            overall_rating,
            academic_quality_rating,
            professors_rating,
            facilities_rating,
            tuition_value_rating,
            student_life_rating,
            review_text
          )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          user.userId,
          universityId,
          overallRating,
          academicQuality,
          professors,
          facilities,
          tuitionValue,
          studentLife,
          review,
        ],
      );
    } catch (dbErr: unknown) {
      if (isDuplicateEntry(dbErr)) {
        return NextResponse.json(
          {
            success: false,
            message: "You have already reviewed this university",
          },
          { status: 409 },
        );
      }

      throw dbErr;
    }

    return NextResponse.json(
      {
        success: true,
        message: "University review submitted successfully",
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

    console.error("POST UNIVERSITY REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit university review" },
      { status: 500 },
    );
  }
}
