import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { getYearFromCourseCode } from "@/lib/courseCode";
import { formatCourseLevel } from "@/lib/courseLevels";

type CourseDetailRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  description: string;
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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;

    // Normalize slug: "csc-326" -> "CSC 326"
    const normalizedSlug = slug.toUpperCase().replace(/-/g, " ");

    console.log("[slug route] raw slug:", slug);
    console.log("[slug route] normalizedSlug:", normalizedSlug);

    const [rows] = await pool.query<CourseDetailRow[]>(
      `
      SELECT
        c.course_id,
        c.code,
        c.title,
        c.description,
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
      LEFT JOIN review r ON r.course_id = c.course_id

      WHERE REPLACE(UPPER(c.code), '-', ' ') = ?

      GROUP BY
        c.course_id, c.code, c.title, c.description,
        c.credits, c.level, c.language,
        d.name, d.department_id, u.name, u.university_id
      `,
      [normalizedSlug],
    );

    console.log("[slug route] rows returned:", rows?.length ?? 0);
    if (rows?.length > 0) {
      console.log("[slug route] matched code:", rows[0].code);
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    const row = rows[0];

    // Fetch prerequisites
    const [prereqs] = await pool.query<PrerequisiteRow[]>(
      `
      SELECT c.course_id, c.code, c.title
      FROM course_prerequisite cp
      JOIN course c ON c.course_id = cp.prereq_course_id
      WHERE cp.course_id = ?
      `,
      [row.course_id],
    );

    const year = getYearFromCourseCode(row.code);

    return NextResponse.json({
      success: true,
      course: {
        courseId: row.course_id,
        slug,
        code: row.code,
        title: row.title,
        description: row.description,
        credits: `${row.credits} cr.`,
        level: formatCourseLevel(row.level),
        language: row.language,
        department: row.department,
        departmentId: row.department_id,
        university: row.university,
        universityId: row.university_id,
        year,
        reviewCount: Number(row.reviewCount) || 0,
        averageRating:
          row.avgOverall == null
            ? null
            : Number(Number(row.avgOverall).toFixed(2)),
        ratings: {
          exam:
            row.avgExam == null ? null : Number(Number(row.avgExam).toFixed(2)),
          workload:
            row.avgWorkload == null
              ? null
              : Number(Number(row.avgWorkload).toFixed(2)),
          attendance:
            row.avgAttendance == null
              ? null
              : Number(Number(row.avgAttendance).toFixed(2)),
          grading:
            row.avgGrading == null
              ? null
              : Number(Number(row.avgGrading).toFixed(2)),
        },
        prerequisites: prereqs ?? [],
      },
    });
  } catch (error: unknown) {
    console.error("GET COURSE BY SLUG ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
