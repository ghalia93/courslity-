// Queries roadmap data and shapes it for roadmap pages and APIs.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { ensureRoadmapTables } from "@/lib/roadmapsDb";
import type { RoadmapSemester, RoadmapSummary } from "@/types/roadmap";

const SEMESTER_ORDER: Record<RoadmapSemester, number> = {
  fall: 1,
  spring: 2,
  summer: 3,
};

type RoadmapRow = RowDataPacket & {
  roadmap_id: number;
  title: string;
  total_credits: number;
  university_id: number;
  university: string;
  department_id: number;
  department: string;
  major_id: number;
  major: string;
  level: string;
};

type RoadmapCourseRow = RowDataPacket & {
  roadmap_course_id: number;
  roadmap_id: number;
  course_id: number;
  code: string;
  title: string;
  credits: number;
  level: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
  year_number: number;
  semester: RoadmapSemester;
  sequence_order: number;
};

type RoadmapFilters = {
  q?: string;
  universityId?: number;
  departmentId?: number;
  majorId?: number;
  major?: string;
  level?: string;
  roadmapId?: number;
  publishedOnly?: boolean;
};

function toPositiveInt(value: number | undefined) {
  return typeof value === "number" && Number.isInteger(value) && value > 0
    ? value
    : undefined;
}

function groupRoadmaps(
  roadmaps: RoadmapRow[],
  courses: RoadmapCourseRow[],
): RoadmapSummary[] {
  const byRoadmapId = new Map<number, RoadmapSummary>();
  const termMaps = new Map<
    number,
    Map<string, RoadmapSummary["terms"][number]>
  >();

  for (const roadmap of roadmaps) {
    byRoadmapId.set(roadmap.roadmap_id, {
      roadmap_id: roadmap.roadmap_id,
      title: roadmap.title,
      university_id: roadmap.university_id,
      university: roadmap.university,
      department_id: roadmap.department_id,
      department: roadmap.department,
      major_id: roadmap.major_id,
      major: roadmap.major,
      level: roadmap.level,
      total_credits: Number(roadmap.total_credits) || 0,
      planned_credits: 0,
      course_count: 0,
      terms: [],
    });
    termMaps.set(roadmap.roadmap_id, new Map());
  }

  for (const course of courses) {
    const roadmap = byRoadmapId.get(course.roadmap_id);
    const terms = termMaps.get(course.roadmap_id);
    if (!roadmap || !terms) continue;

    const termKey = `${course.year_number}-${course.semester}`;
    let term = terms.get(termKey);
    if (!term) {
      term = {
        year_number: Number(course.year_number),
        semester: course.semester,
        courses: [],
      };
      terms.set(termKey, term);
      roadmap.terms.push(term);
    }

    term.courses.push({
      roadmap_course_id: course.roadmap_course_id,
      course_id: course.course_id,
      code: course.code,
      title: course.title,
      credits: Number(course.credits) || 0,
      level: course.level,
      department_id: course.department_id,
      department: course.department,
      university_id: course.university_id,
      university: course.university,
      year_number: Number(course.year_number),
      semester: course.semester,
      sequence_order: Number(course.sequence_order) || 0,
    });
  }

  for (const roadmap of byRoadmapId.values()) {
    roadmap.terms.sort((a, b) => {
      if (a.year_number !== b.year_number) return a.year_number - b.year_number;
      return SEMESTER_ORDER[a.semester] - SEMESTER_ORDER[b.semester];
    });

    for (const term of roadmap.terms) {
      term.courses.sort((a, b) => {
        if (a.sequence_order !== b.sequence_order) {
          return a.sequence_order - b.sequence_order;
        }
        return a.code.localeCompare(b.code);
      });

      roadmap.course_count += term.courses.length;
      roadmap.planned_credits += term.courses.reduce(
        (sum, course) => sum + course.credits,
        0,
      );
    }
  }

  return [...byRoadmapId.values()];
}

export async function getRoadmaps(filters: RoadmapFilters = {}) {
  await ensureRoadmapTables();

  const conditions = [
    "m.is_active = 1",
    "d.is_active = 1",
    "u.is_active = 1",
  ];
  const params: Array<number | string> = [];

  if (filters.publishedOnly) {
    conditions.push("r.is_published = 1");
  }

  const roadmapId = toPositiveInt(filters.roadmapId);
  if (roadmapId) {
    conditions.push("r.roadmap_id = ?");
    params.push(roadmapId);
  }

  const universityId = toPositiveInt(filters.universityId);
  if (universityId) {
    conditions.push("u.university_id = ?");
    params.push(universityId);
  }

  const departmentId = toPositiveInt(filters.departmentId);
  if (departmentId) {
    conditions.push("d.department_id = ?");
    params.push(departmentId);
  }

  const majorId = toPositiveInt(filters.majorId);
  if (majorId) {
    conditions.push("m.major_id = ?");
    params.push(majorId);
  }

  if (filters.major) {
    conditions.push("LOWER(m.name) = LOWER(?)");
    params.push(filters.major.trim());
  }

  if (filters.level) {
    conditions.push("r.level = ?");
    params.push(filters.level);
  }

  if (filters.q) {
    const like = `%${filters.q.trim()}%`;
    conditions.push(`(
      r.title LIKE ?
      OR m.name LIKE ?
      OR d.name LIKE ?
      OR u.name LIKE ?
      OR EXISTS (
        SELECT 1
        FROM roadmap_course rc_search
        JOIN course c_search ON c_search.course_id = rc_search.course_id
        WHERE rc_search.roadmap_id = r.roadmap_id
          AND c_search.deleted_at IS NULL
          AND (c_search.code LIKE ? OR c_search.title LIKE ?)
      )
    )`);
    params.push(like, like, like, like, like, like);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [roadmapRows] = await pool.query<RoadmapRow[]>(
    `SELECT
      r.roadmap_id,
      r.title,
      r.total_credits,
      u.university_id,
      u.name AS university,
      d.department_id,
      d.name AS department,
      m.major_id,
      m.name AS major,
      r.level
    FROM roadmap r
    JOIN major m ON m.major_id = r.major_id
    JOIN department d ON d.department_id = m.department_id
    JOIN university u ON u.university_id = d.university_id
    ${where}
    ORDER BY u.name ASC, d.name ASC, m.name ASC, r.level ASC`,
    params,
  );

  if (!roadmapRows.length) return [];

  const roadmapIds = roadmapRows.map((roadmap) => roadmap.roadmap_id);
  const placeholders = roadmapIds.map(() => "?").join(", ");

  const [courseRows] = await pool.query<RoadmapCourseRow[]>(
    `SELECT
      rc.roadmap_course_id,
      rc.roadmap_id,
      c.course_id,
      c.code,
      c.title,
      c.credits,
      c.level,
      d.department_id,
      d.name AS department,
      u.university_id,
      u.name AS university,
      rc.year_number,
      rc.semester,
      rc.sequence_order
    FROM roadmap_course rc
    JOIN course c ON c.course_id = rc.course_id
    JOIN department d ON d.department_id = c.department_id
    JOIN university u ON u.university_id = d.university_id
    WHERE rc.roadmap_id IN (${placeholders})
      AND c.deleted_at IS NULL
      AND d.is_active = 1
      AND u.is_active = 1
    ORDER BY
      rc.roadmap_id ASC,
      rc.year_number ASC,
      FIELD(rc.semester, 'fall', 'spring', 'summer') ASC,
      rc.sequence_order ASC,
      c.code ASC`,
    roadmapIds,
  );

  return groupRoadmaps(roadmapRows, courseRows);
}
