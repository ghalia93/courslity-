import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type CourseRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  language: string;
  department: string;
  university: string;
  reviewCount: number | string;
  avgOverall: number | string | null;
  avgExam: number | string | null;
  avgWorkload: number | string | null;
  avgAttendance: number | string | null;
  avgGrading: number | string | null;
};

type PublicCourse = {
  courseId: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  language: string;
  university: string;
  department: string;
  year: number | null;
  semester: string | null;
  reviewCount: number;
  averageRating: number | null;
  ratings: {
    exam: number | null;
    workload: number | null;
    attendance: number | null;
    grading: number | null;
  };
};

function getCourseNumber(code: string): number | null {
  const match = code.match(/\d+/);
  if (!match) return null;

  return parseInt(match[0], 10);
}

function getYearFromCourseCode(code: string): number | null {
  const courseNumber = getCourseNumber(code);
  if (courseNumber == null) return null;

  if (courseNumber >= 200 && courseNumber < 300) return 1;
  if (courseNumber >= 300 && courseNumber < 400) return 2;
  if (courseNumber >= 400 && courseNumber < 500) return 3;
  if (courseNumber >= 500 && courseNumber < 600) return 4;

  return null;
}

function getSemesterFromCourseCode(code: string): string | null {
  const courseNumber = getCourseNumber(code);
  if (courseNumber == null) return null;

  const lastTwoDigits = courseNumber % 100;

  if (lastTwoDigits < 50) return "fall";
  return "spring";
}

// get courses
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 500);
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const offset = (page - 1) * limit;

    const selectedLevel = (url.searchParams.get("level") || "")
      .trim()
      .toLowerCase();
    const selectedYear = Number(url.searchParams.get("year") || 0);
    const selectedSemester = (url.searchParams.get("semester") || "")
      .trim()
      .toLowerCase();

    const [rows] = await pool.query<CourseRow[]>(
      `
      SELECT
        c.course_id,
        c.code,
        c.title,
        c.description,
        c.credits,
        c.level,
        c.language,
        d.name AS department,
        u.name AS university,

        COUNT(r.review_id) AS reviewCount,
        AVG(r.overall_rating) AS avgOverall,
        AVG(r.exam_difficulty_rating) AS avgExam,
        AVG(r.workload_rating) AS avgWorkload,
        AVG(r.attendance_rating) AS avgAttendance,
        AVG(r.grading_rating) AS avgGrading

      FROM course c
      INNER JOIN department d ON d.department_id = c.department_id
      INNER JOIN university u ON u.university_id = d.university_id
      LEFT JOIN review r ON r.course_id = c.course_id AND r.deleted_at IS NULL

      WHERE c.deleted_at IS NULL
        AND d.is_active = 1
        AND u.is_active = 1

      GROUP BY
        c.course_id,
        c.code,
        c.title,
        c.description,
        c.credits,
        c.level,
        c.language,
        d.name,
        u.name
      ORDER BY reviewCount DESC, c.course_id DESC
      `,
    );

    const mapped: PublicCourse[] = rows.map((row) => ({
      courseId: row.course_id,
      code: row.code,
      title: row.title,
      description: row.description,
      credits: row.credits,
      level: row.level,
      language: row.language,
      university: row.university,
      department: row.department,
      year: getYearFromCourseCode(row.code),
      semester: getSemesterFromCourseCode(row.code),
      reviewCount: Number(row.reviewCount) || 0,
      averageRating:
        row.avgOverall === null
          ? null
          : Number(Number(row.avgOverall).toFixed(1)),
      ratings: {
        exam:
          row.avgExam === null ? null : Number(Number(row.avgExam).toFixed(1)),
        workload:
          row.avgWorkload === null
            ? null
            : Number(Number(row.avgWorkload).toFixed(1)),
        attendance:
          row.avgAttendance === null
            ? null
            : Number(Number(row.avgAttendance).toFixed(1)),
        grading:
          row.avgGrading === null
            ? null
            : Number(Number(row.avgGrading).toFixed(1)),
      },
    }));

    const filtered = mapped.filter((course) => {
      const courseLevel = String(course.level || "").trim().toLowerCase();
      const courseSemester = String(course.semester || "").trim().toLowerCase();

      const matchesLevel = !selectedLevel || courseLevel === selectedLevel;
      const matchesYear = !selectedYear || course.year === selectedYear;
      const matchesSemester =
        !selectedSemester || courseSemester === selectedSemester;

      return matchesLevel && matchesYear && matchesSemester;
    });

    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      page,
      limit,
      count: paginated.length,
      total: filtered.length,
      courses: paginated,
    });
  } catch (error: unknown) {
    console.error("COURSES GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch courses" },
      { status: 500 },
    );
  }
}
