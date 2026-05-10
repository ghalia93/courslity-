// Handles API roadmaps requests.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";
import { getRoadmaps } from "@/lib/roadmapQueries";
import type { RoadmapSummary } from "@/types/roadmap";

type UniversityFilterRow = RowDataPacket & {
  university_id: number;
  name: string;
};

type DepartmentFilterRow = RowDataPacket & {
  name: string;
  department_id: number;
  university_id: number;
  university: string;
};

type YearFilterRow = RowDataPacket & {
  year_number: number;
};

function getPositiveIntParam(value: string | null) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
}

function filterRoadmapsByYear(
  roadmaps: RoadmapSummary[],
  yearNumber: number | undefined,
) {
  if (!yearNumber) return roadmaps;

  return roadmaps
    .map((roadmap) => {
      const terms = roadmap.terms.filter(
        (term) => term.year_number === yearNumber,
      );
      const plannedCredits = terms.reduce(
        (sum, term) =>
          sum +
          term.courses.reduce((termSum, course) => termSum + course.credits, 0),
        0,
      );
      const courseCount = terms.reduce(
        (sum, term) => sum + term.courses.length,
        0,
      );

      return {
        ...roadmap,
        planned_credits: plannedCredits,
        course_count: courseCount,
        terms,
      };
    })
    .filter((roadmap) => roadmap.terms.length > 0);
}

export async function GET(req: Request) {
  try {
    await ensureRoadmapTables();

    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const universityId = getPositiveIntParam(
      url.searchParams.get("university_id"),
    );
    const departmentId = getPositiveIntParam(
      url.searchParams.get("department_id"),
    );
    const yearNumber = getPositiveIntParam(url.searchParams.get("year"));

    const [roadmaps, universities, departments, years] = await Promise.all([
      getRoadmaps({
        q,
        universityId,
        departmentId,
        publishedOnly: true,
      }),
      pool.query<UniversityFilterRow[]>(
        `SELECT u.university_id, u.name
        FROM university u
        WHERE u.is_active = 1
        ORDER BY u.name ASC`,
      ),
      pool.query<DepartmentFilterRow[]>(
        `SELECT DISTINCT
          d.department_id,
          d.name,
          u.university_id,
          u.name AS university
        FROM department d
        JOIN university u ON u.university_id = d.university_id
        WHERE d.is_active = 1
          AND u.is_active = 1
        ORDER BY u.name ASC, d.name ASC`,
      ),
      pool.query<YearFilterRow[]>(
        `SELECT DISTINCT rc.year_number
        FROM roadmap_course rc
        JOIN roadmap r ON r.roadmap_id = rc.roadmap_id
        JOIN major m ON m.major_id = r.major_id
        JOIN department d ON d.department_id = m.department_id
        JOIN university u ON u.university_id = d.university_id
        WHERE r.is_published = 1
          AND m.is_active = 1
          AND d.is_active = 1
          AND u.is_active = 1
        ORDER BY rc.year_number ASC`,
      ),
    ]);

    return NextResponse.json({
      success: true,
      roadmaps: filterRoadmapsByYear(roadmaps, yearNumber),
      filters: {
        universities: universities[0],
        departments: departments[0],
        years: years[0].map((row) => row.year_number),
      },
    });
  } catch (error: unknown) {
    console.error("ROADMAPS GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load roadmaps" },
      { status: 500 },
    );
  }
}
