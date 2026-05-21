// Shared server-side course detail query used by the course page and API.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { getYearFromCourseCode } from "@/lib/courseCode";
import { normalizeCourseDescription } from "@/lib/courseDescriptionText";
import { formatCourseLevel } from "@/lib/courseLevels";
import { ensureCourseVideoColumns } from "@/lib/courseVideosDb";
import { ensureReviewHiddenColumn } from "@/lib/reviewDb";

type CourseDetailRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  description: string;
  video_url: string | null;
  video_title: string | null;
  credits: number;
  level: string;
  language: string;
  department: string;
  department_id: number;
  university: string;
  university_id: number;
  reviewCount: number | string;
  avgOverall: number | string | null;
  avgExam: number | string | null;
  avgWorkload: number | string | null;
  avgAttendance: number | string | null;
  avgGrading: number | string | null;
};

type PrerequisiteRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
};

export type CourseDetail = {
  courseId: number;
  slug: string;
  code: string;
  title: string;
  description: string;
  videoUrl: string | null;
  videoTitle: string | null;
  credits: string;
  level: string;
  language: string;
  department: string;
  departmentId: number;
  university: string;
  universityId: number;
  year: number | null;
  reviewCount: number;
  averageRating: number | null;
  ratings: {
    exam: number | null;
    workload: number | null;
    attendance: number | null;
    grading: number | null;
  };
  prerequisites: PrerequisiteRow[];
};

function normalizeCourseSlug(slug: string) {
  return slug.trim().toUpperCase().replace(/-/g, " ");
}

function roundedRating(value: number | string | null) {
  return value == null ? null : Number(Number(value).toFixed(2));
}

async function getCourseDetail(
  whereClause: string,
  params: Array<number | string>,
  slug: string,
): Promise<CourseDetail | null> {
  await ensureReviewHiddenColumn();
  await ensureCourseVideoColumns();

  const [rows] = await pool.query<CourseDetailRow[]>(
    `
    SELECT
      c.course_id,
      c.code,
      c.title,
      c.description,
      c.video_url,
      c.video_title,
      c.credits,
      c.level,
      c.language,
      d.name           AS department,
      d.department_id,
      u.name           AS university,
      u.university_id,

      COUNT(r.review_id)            AS reviewCount,
      AVG(r.overall_rating)         AS avgOverall,
      AVG(r.exam_difficulty_rating) AS avgExam,
      AVG(r.workload_rating)        AS avgWorkload,
      AVG(r.attendance_rating)      AS avgAttendance,
      AVG(r.grading_rating)         AS avgGrading

    FROM course c
    INNER JOIN department d ON d.department_id = c.department_id
    INNER JOIN university u ON u.university_id = d.university_id
    LEFT JOIN review r
      ON r.course_id = c.course_id
      AND r.deleted_at IS NULL
      AND r.hidden_at IS NULL

    WHERE ${whereClause}
      AND c.deleted_at IS NULL

    GROUP BY
      c.course_id, c.code, c.title, c.description,
      c.video_url, c.video_title, c.credits, c.level, c.language,
      d.name, d.department_id, u.name, u.university_id
    `,
    params,
  );

  if (!rows || rows.length === 0) {
    return null;
  }

  const row = rows[0];
  const [prerequisites] = await pool.query<PrerequisiteRow[]>(
    `
    SELECT c.course_id, c.code, c.title
    FROM course_prerequisite cp
    JOIN course c ON c.course_id = cp.prereq_course_id
    WHERE cp.course_id = ?
      AND c.deleted_at IS NULL
    ORDER BY c.code ASC
    `,
    [row.course_id],
  );

  return {
    courseId: row.course_id,
    slug,
    code: row.code,
    title: row.title,
    description: normalizeCourseDescription(row),
    videoUrl: row.video_url ?? null,
    videoTitle: row.video_title ?? null,
    credits: `${row.credits} cr.`,
    level: formatCourseLevel(row.level),
    language: row.language,
    department: row.department,
    departmentId: row.department_id,
    university: row.university,
    universityId: row.university_id,
    year: getYearFromCourseCode(row.code),
    reviewCount: Number(row.reviewCount) || 0,
    averageRating: roundedRating(row.avgOverall),
    ratings: {
      exam: roundedRating(row.avgExam),
      workload: roundedRating(row.avgWorkload),
      attendance: roundedRating(row.avgAttendance),
      grading: roundedRating(row.avgGrading),
    },
    prerequisites,
  };
}

export async function getCourseDetailBySlug(
  slug: string,
): Promise<CourseDetail | null> {
  return getCourseDetail(
    "REPLACE(UPPER(c.code), '-', ' ') = ?",
    [normalizeCourseSlug(slug)],
    slug,
  );
}

export async function getCourseDetailById(
  courseId: number,
  slug: string,
): Promise<CourseDetail | null> {
  if (!Number.isInteger(courseId) || courseId <= 0) {
    return null;
  }

  return getCourseDetail("c.course_id = ?", [courseId], slug);
}
