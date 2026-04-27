import { NextRequest, NextResponse } from "next/server";
import pool from "@/db";

function getYearFromCourseCode(code: string): number | null {
  const match = code.match(/\d+/);
  if (!match) return null;

  const courseNumber = parseInt(match[0], 10);

  if (courseNumber >= 200 && courseNumber < 300) return 1;
  if (courseNumber >= 300 && courseNumber < 400) return 2;
  if (courseNumber >= 400 && courseNumber < 500) return 3;
  if (courseNumber >= 500 && courseNumber < 600) return 4;

  return null;
}

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

    const [rows]: any = await pool.query(
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
    const [prereqs]: any = await pool.query(
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
        level: row.level.charAt(0).toUpperCase() + row.level.slice(1),
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
  } catch (error: any) {
    console.error("GET COURSE BY SLUG ERROR:", error.message, error.stack);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 },
    );
  }
}