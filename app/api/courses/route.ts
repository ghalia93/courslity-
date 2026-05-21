// Handles API courses requests.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import {
  getSemesterFromCourseCode,
  getYearFromCourseCode,
} from "@/lib/courseCode";
import { normalizeCourseDescription } from "@/lib/courseDescriptionText";
import { ensureCourseVideoColumns } from "@/lib/courseVideosDb";
import { ensureReviewHiddenColumn } from "@/lib/reviewDb";

type CourseRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  description: string;
  video_url: string | null;
  video_title: string | null;
  credits: number;
  level: string;
  language: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
  majorIds: string | null;
  majors: string | null;
  roadmapYears: string | null;
  roadmapSemesters: string | null;
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
  videoUrl: string | null;
  videoTitle: string | null;
  credits: number;
  level: string;
  language: string;
  university: string;
  department: string;
  majorIds: number[];
  majors: string[];
  year: number | null;
  years: number[];
  semester: string | null;
  semesters: string[];
  reviewCount: number;
  averageRating: number | null;
  ratings: {
    exam: number | null;
    workload: number | null;
    attendance: number | null;
    grading: number | null;
  };
};

function getPositiveIntParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function getRequestedLimit(value: string | null) {
  const parsed = Number(value || 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 10;
}

function getRequestedPage(value: string | null) {
  const parsed = Number(value || 1);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
}

// get courses
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    await ensureReviewHiddenColumn();
    await ensureCourseVideoColumns();

    const limit = Math.min(
      getRequestedLimit(url.searchParams.get("limit")),
      5000,
    );
    const page = getRequestedPage(url.searchParams.get("page"));
    const offset = (page - 1) * limit;

    const universityId = getPositiveIntParam(
      url.searchParams.get("university_id"),
    );
    const departmentId = getPositiveIntParam(
      url.searchParams.get("department_id"),
    );
    const majorId = getPositiveIntParam(url.searchParams.get("major_id"));
    const selectedUniversity = (url.searchParams.get("university") || "")
      .trim()
      .toLowerCase();
    const selectedDepartment = (url.searchParams.get("department") || "")
      .trim()
      .toLowerCase();
    const selectedMajor = (url.searchParams.get("major") || "")
      .trim()
      .toLowerCase();
    const selectedLanguage = (url.searchParams.get("language") || "")
      .trim()
      .toLowerCase();
    const selectedLevel = (url.searchParams.get("level") || "")
      .trim()
      .toLowerCase();
    const selectedYear = Number(url.searchParams.get("year") || 0);
    const selectedSemester = (url.searchParams.get("semester") || "")
      .trim()
      .toLowerCase();

    const conditions = [
      "c.deleted_at IS NULL",
      "d.is_active = 1",
      "u.is_active = 1",
    ];
    const params: Array<number | string> = [];

    if (universityId) {
      conditions.push("u.university_id = ?");
      params.push(universityId);
    } else if (selectedUniversity) {
      conditions.push("LOWER(u.name) = ?");
      params.push(selectedUniversity);
    }

    if (departmentId) {
      conditions.push("d.department_id = ?");
      params.push(departmentId);
    } else if (selectedDepartment) {
      conditions.push("LOWER(d.name) = ?");
      params.push(selectedDepartment);
    }

    if (selectedLanguage) {
      conditions.push("LOWER(c.language) = ?");
      params.push(selectedLanguage);
    }

    if (selectedLevel) {
      conditions.push("LOWER(c.level) = ?");
      params.push(selectedLevel);
    }

    if (majorId || selectedMajor) {
      const majorConditions = [
        "rc_filter.course_id = c.course_id",
        "r_filter.is_published = 1",
        "m_filter.is_active = 1",
        "d_filter.is_active = 1",
        "u_filter.is_active = 1",
        "d_filter.department_id = d.department_id",
        "u_filter.university_id = u.university_id",
      ];

      if (majorId) {
        majorConditions.push("m_filter.major_id = ?");
        params.push(majorId);
      } else {
        majorConditions.push("LOWER(m_filter.name) = ?");
        params.push(selectedMajor);
      }

      conditions.push(`EXISTS (
        SELECT 1
        FROM roadmap_course rc_filter
        INNER JOIN roadmap r_filter
          ON r_filter.roadmap_id = rc_filter.roadmap_id
        INNER JOIN major m_filter
          ON m_filter.major_id = r_filter.major_id
        INNER JOIN department d_filter
          ON d_filter.department_id = m_filter.department_id
        INNER JOIN university u_filter
          ON u_filter.university_id = d_filter.university_id
        WHERE ${majorConditions.join(" AND ")}
      )`);
    }

    const [rows] = await pool.query<CourseRow[]>(
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
        d.department_id,
        d.name AS department,
        u.university_id,
        u.name AS university,
        GROUP_CONCAT(DISTINCT m.major_id ORDER BY m.name ASC) AS majorIds,
        GROUP_CONCAT(DISTINCT m.name ORDER BY m.name ASC SEPARATOR '||') AS majors,
        GROUP_CONCAT(
          DISTINCT CASE WHEN m.major_id IS NULL THEN NULL ELSE rc_major.year_number END
          ORDER BY rc_major.year_number ASC
        ) AS roadmapYears,
        GROUP_CONCAT(
          DISTINCT CASE WHEN m.major_id IS NULL THEN NULL ELSE rc_major.semester END
          ORDER BY FIELD(rc_major.semester, 'fall', 'spring', 'summer') ASC
          SEPARATOR '||'
        ) AS roadmapSemesters,

        COUNT(DISTINCT rev.review_id) AS reviewCount,
        AVG(rev.overall_rating) AS avgOverall,
        AVG(rev.exam_difficulty_rating) AS avgExam,
        AVG(rev.workload_rating) AS avgWorkload,
        AVG(rev.attendance_rating) AS avgAttendance,
        AVG(rev.grading_rating) AS avgGrading

      FROM course c
      INNER JOIN department d ON d.department_id = c.department_id
      INNER JOIN university u ON u.university_id = d.university_id
      LEFT JOIN review rev
        ON rev.course_id = c.course_id
        AND rev.deleted_at IS NULL
        AND rev.hidden_at IS NULL
      LEFT JOIN roadmap_course rc_major ON rc_major.course_id = c.course_id
      LEFT JOIN roadmap roadmap_major
        ON roadmap_major.roadmap_id = rc_major.roadmap_id
        AND roadmap_major.is_published = 1
      LEFT JOIN major m
        ON m.major_id = roadmap_major.major_id
        AND m.department_id = d.department_id
        AND m.is_active = 1

      WHERE ${conditions.join(" AND ")}

      GROUP BY
        c.course_id,
        c.code,
        c.title,
        c.description,
        c.video_url,
        c.video_title,
        c.credits,
        c.level,
        c.language,
        d.department_id,
        d.name,
        u.university_id,
        u.name
      ORDER BY reviewCount DESC, c.course_id DESC
      `,
      params,
    );

    const mapped: PublicCourse[] = rows.map((row) => {
      const majorIds = row.majorIds
        ? String(row.majorIds)
            .split(",")
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0)
        : [];
      const majors = row.majors ? String(row.majors).split("||") : [];
      const years = row.roadmapYears
        ? String(row.roadmapYears)
            .split(",")
            .map((year) => Number(year))
            .filter((year) => Number.isInteger(year) && year > 0)
        : [];
      const semesters = row.roadmapSemesters
        ? String(row.roadmapSemesters)
            .split("||")
            .map((semester) => semester.trim())
            .filter(Boolean)
        : [];
      const fallbackYear = getYearFromCourseCode(row.code);
      const fallbackSemester = getSemesterFromCourseCode(row.code);

      return {
        courseId: row.course_id,
        code: row.code,
        title: row.title,
        description: normalizeCourseDescription(row),
        videoUrl: row.video_url ?? null,
        videoTitle: row.video_title ?? null,
        credits: row.credits,
        level: row.level,
        language: row.language,
        university: row.university,
        department: row.department,
        majorIds,
        majors,
        year: years[0] ?? fallbackYear,
        years: years.length > 0 ? years : fallbackYear ? [fallbackYear] : [],
        semester: semesters[0] ?? fallbackSemester,
        semesters:
          semesters.length > 0
            ? semesters
            : fallbackSemester
              ? [fallbackSemester]
              : [],
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
      };
    });

    const filtered = mapped.filter((course) => {
      const courseLevel = String(course.level || "").trim().toLowerCase();
      const courseSemesters = course.semesters.map((semester) =>
        String(semester || "").trim().toLowerCase(),
      );

      const matchesLevel = !selectedLevel || courseLevel === selectedLevel;
      const matchesYear =
        !selectedYear || course.years.includes(selectedYear);
      const matchesSemester =
        !selectedSemester || courseSemesters.includes(selectedSemester);

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
