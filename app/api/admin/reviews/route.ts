// Handles API admin reviews requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureReviewHiddenColumn } from "@/lib/reviewDb";
import { ensureUniversityReviewTables } from "@/lib/universityReviewDb";

type ReviewQueryParam = string | number;
type ReviewKind = "all" | "course" | "university";

type CourseAdminReviewRow = RowDataPacket & {
  review_type: "course";
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
  created_at_raw: Date | string;
};

type UniversityAdminReviewRow = RowDataPacket & {
  review_type: "university";
  review_id: number;
  reviewer_name: string;
  reviewer_email: string;
  university: string;
  review_text: string;
  overall_rating: number | string;
  academic_quality_rating: number | string;
  professors_rating: number | string;
  facilities_rating: number | string;
  tuition_value_rating: number | string;
  student_life_rating: number | string;
  upvotes: number | string;
  downvotes: number | string;
  created_at: string;
  created_at_raw: Date | string;
};

type AdminReview = {
  review_type: "course" | "university";
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
  overall_rating: number;
  grading_rating: number;
  workload_rating: number;
  attendance_rating: number;
  exam_difficulty_rating: number;
  academic_quality_rating?: number;
  professors_rating?: number;
  facilities_rating?: number;
  tuition_value_rating?: number;
  student_life_rating?: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
  created_at_raw: string;
};

function normalizeKind(value: string): ReviewKind {
  if (value === "course" || value === "courses") return "course";
  if (value === "university" || value === "universities") return "university";
  return "all";
}

function toTimestamp(value: string) {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function mapCourseReview(row: CourseAdminReviewRow): AdminReview {
  return {
    review_type: "course",
    review_id: Number(row.review_id),
    reviewer_name: row.reviewer_name,
    reviewer_email: row.reviewer_email,
    course_code: row.course_code,
    course_title: row.course_title,
    university: row.university,
    department: row.department,
    semester_taken: row.semester_taken,
    review_text: row.review_text,
    instructor_name: row.instructor_name,
    overall_rating: Number(row.overall_rating),
    grading_rating: Number(row.grading_rating),
    workload_rating: Number(row.workload_rating),
    attendance_rating: Number(row.attendance_rating),
    exam_difficulty_rating: Number(row.exam_difficulty_rating),
    upvotes: Number(row.upvotes),
    downvotes: Number(row.downvotes),
    created_at: row.created_at,
    created_at_raw: new Date(row.created_at_raw).toISOString(),
  };
}

function mapUniversityReview(row: UniversityAdminReviewRow): AdminReview {
  const academicQuality = Number(row.academic_quality_rating);
  const professors = Number(row.professors_rating);
  const facilities = Number(row.facilities_rating);
  const tuitionValue = Number(row.tuition_value_rating);
  const studentLife = Number(row.student_life_rating);

  return {
    review_type: "university",
    review_id: Number(row.review_id),
    reviewer_name: row.reviewer_name,
    reviewer_email: row.reviewer_email,
    course_code: "University Review",
    course_title: row.university,
    university: row.university,
    department: "University",
    semester_taken: "N/A",
    review_text: row.review_text,
    instructor_name: "N/A",
    overall_rating: Number(row.overall_rating),
    grading_rating: tuitionValue,
    workload_rating: professors,
    attendance_rating: facilities,
    exam_difficulty_rating: academicQuality,
    academic_quality_rating: academicQuality,
    professors_rating: professors,
    facilities_rating: facilities,
    tuition_value_rating: tuitionValue,
    student_life_rating: studentLife,
    upvotes: Number(row.upvotes),
    downvotes: Number(row.downvotes),
    created_at: row.created_at,
    created_at_raw: new Date(row.created_at_raw).toISOString(),
  };
}

function sortReviews(reviews: AdminReview[], sort: string) {
  return [...reviews].sort((a, b) => {
    const aVotes = a.upvotes + a.downvotes;
    const bVotes = b.upvotes + b.downvotes;
    const aNet = a.upvotes - a.downvotes;
    const bNet = b.upvotes - b.downvotes;

    if (sort === "oldest") {
      return toTimestamp(a.created_at_raw) - toTimestamp(b.created_at_raw);
    }

    if (sort === "rating_high") {
      return (
        b.overall_rating - a.overall_rating ||
        toTimestamp(b.created_at_raw) - toTimestamp(a.created_at_raw)
      );
    }

    if (sort === "rating_low") {
      return (
        a.overall_rating - b.overall_rating ||
        toTimestamp(b.created_at_raw) - toTimestamp(a.created_at_raw)
      );
    }

    if (sort === "most_votes") {
      return (
        bVotes - aVotes ||
        bNet - aNet ||
        toTimestamp(b.created_at_raw) - toTimestamp(a.created_at_raw)
      );
    }

    return toTimestamp(b.created_at_raw) - toTimestamp(a.created_at_raw);
  });
}

function toPublicReview(review: AdminReview) {
  return {
    review_type: review.review_type,
    review_id: review.review_id,
    reviewer_name: review.reviewer_name,
    reviewer_email: review.reviewer_email,
    course_code: review.course_code,
    course_title: review.course_title,
    university: review.university,
    department: review.department,
    semester_taken: review.semester_taken,
    review_text: review.review_text,
    instructor_name: review.instructor_name,
    overall_rating: review.overall_rating,
    grading_rating: review.grading_rating,
    workload_rating: review.workload_rating,
    attendance_rating: review.attendance_rating,
    exam_difficulty_rating: review.exam_difficulty_rating,
    academic_quality_rating: review.academic_quality_rating,
    professors_rating: review.professors_rating,
    facilities_rating: review.facilities_rating,
    tuition_value_rating: review.tuition_value_rating,
    student_life_rating: review.student_life_rating,
    upvotes: review.upvotes,
    downvotes: review.downvotes,
    created_at: review.created_at,
  };
}

async function getCourseReviews({
  q,
  university,
  department,
  semester,
  rating,
}: {
  q: string;
  university: string;
  department: string;
  semester: string;
  rating: string;
}) {
  const conditions: string[] = [
    "r.deleted_at IS NULL",
    "r.hidden_at IS NULL",
  ];
  const params: ReviewQueryParam[] = [];

  if (q) {
    conditions.push(`(
      c.code            LIKE ? OR
      c.title           LIKE ? OR
      uni.name          LIKE ? OR
      d.name            LIKE ? OR
      u.full_name       LIKE ? OR
      u.email           LIKE ? OR
      r.instructor_name LIKE ? OR
      r.review_text     LIKE ?
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like, like, like, like, like);
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

  const [rows] = await pool.query<CourseAdminReviewRow[]>(
    `SELECT
      'course'                                          AS review_type,
      r.review_id,
      u.full_name                                      AS reviewer_name,
      u.email                                          AS reviewer_email,
      c.code                                           AS course_code,
      c.title                                          AS course_title,
      uni.name                                         AS university,
      d.name                                           AS department,
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
      DATE_FORMAT(r.created_at, '%Y-%m-%d')            AS created_at,
      r.created_at                                     AS created_at_raw
     FROM review r
     JOIN \`user\` u ON u.user_id = r.user_id
     JOIN course c ON c.course_id = r.course_id
     JOIN department d ON d.department_id = c.department_id
     JOIN university uni ON uni.university_id = d.university_id
     LEFT JOIN review_vote rv ON rv.review_id = r.review_id
     WHERE ${conditions.join(" AND ")}
     GROUP BY
       r.review_id, u.full_name, u.email,
       c.code, c.title, uni.name, d.name,
       r.semester_taken, r.review_text, r.instructor_name,
       r.overall_rating, r.grading_rating, r.workload_rating,
       r.attendance_rating, r.exam_difficulty_rating, r.created_at`,
    params,
  );

  return rows.map(mapCourseReview);
}

async function getUniversityReviews({
  q,
  university,
  department,
  semester,
  rating,
}: {
  q: string;
  university: string;
  department: string;
  semester: string;
  rating: string;
}) {
  if (department || semester) return [];

  const conditions: string[] = [
    "ur.deleted_at IS NULL",
    "ur.hidden_at IS NULL",
  ];
  const params: ReviewQueryParam[] = [];

  if (q) {
    conditions.push(`(
      uni.name       LIKE ? OR
      u.full_name    LIKE ? OR
      u.email        LIKE ? OR
      ur.review_text LIKE ?
    )`);
    const like = `%${q}%`;
    params.push(like, like, like, like);
  }

  if (university) {
    conditions.push("uni.name = ?");
    params.push(university);
  }

  if (rating && ["1", "2", "3", "4", "5"].includes(rating)) {
    conditions.push("FLOOR(ur.overall_rating) = ?");
    params.push(Number(rating));
  }

  const [rows] = await pool.query<UniversityAdminReviewRow[]>(
    `SELECT
      'university'                                      AS review_type,
      ur.university_review_id                          AS review_id,
      u.full_name                                      AS reviewer_name,
      u.email                                          AS reviewer_email,
      uni.name                                         AS university,
      ur.review_text,
      ur.overall_rating,
      ur.academic_quality_rating,
      ur.professors_rating,
      ur.facilities_rating,
      ur.tuition_value_rating,
      ur.student_life_rating,
      COALESCE(SUM(CASE WHEN urv.vote_value =  1 THEN 1 ELSE 0 END), 0) AS upvotes,
      COALESCE(SUM(CASE WHEN urv.vote_value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
      DATE_FORMAT(ur.created_at, '%Y-%m-%d')           AS created_at,
      ur.created_at                                    AS created_at_raw
     FROM university_review ur
     JOIN \`user\` u ON u.user_id = ur.user_id
     JOIN university uni ON uni.university_id = ur.university_id
     LEFT JOIN university_review_vote urv
       ON urv.university_review_id = ur.university_review_id
     WHERE ${conditions.join(" AND ")}
     GROUP BY
       ur.university_review_id, u.full_name, u.email,
       uni.name, ur.review_text, ur.overall_rating,
       ur.academic_quality_rating, ur.professors_rating,
       ur.facilities_rating, ur.tuition_value_rating,
       ur.student_life_rating, ur.created_at`,
    params,
  );

  return rows.map(mapUniversityReview);
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureReviewHiddenColumn();
    await ensureUniversityReviewTables();

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
    const kind = normalizeKind(searchParams.get("kind") || "all");

    const [courseReviews, universityReviews] = await Promise.all([
      kind !== "university"
        ? getCourseReviews({ q, university, department, semester, rating })
        : Promise.resolve([]),
      kind !== "course"
        ? getUniversityReviews({ q, university, department, semester, rating })
        : Promise.resolve([]),
    ]);

    const sorted = sortReviews([...courseReviews, ...universityReviews], sort);
    const paginated = sorted.slice(offset, offset + limit).map(toPublicReview);

    return NextResponse.json({
      success: true,
      reviews: paginated,
      pagination: { page, limit, total: sorted.length },
    });
  } catch (error: unknown) {
    console.error("GET REVIEWS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
