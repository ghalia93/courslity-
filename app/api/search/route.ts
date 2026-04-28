import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type SearchRow = RowDataPacket & {
  course_id: number;
  code: string;
  title: string;
  department: string;
  university: string;
};

const UNIVERSITY_ALIAS_PATTERNS = [
  {
    aliases: ["bau"],
    patterns: ["%Beirut Arab University%"],
  },
  {
    aliases: ["aub"],
    patterns: ["%American University of Beirut%"],
  },
  {
    aliases: ["lau"],
    patterns: ["%Lebanese American University%"],
  },
  {
    aliases: ["liu"],
    patterns: ["%Lebanese International University%"],
  },
  {
    aliases: ["usj", "usjb"],
    patterns: ["%Saint-Joseph%"],
  },
  {
    aliases: ["uob"],
    patterns: ["%Balamand%"],
  },
];

function normalizeAlias(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function getUniversityAliasPatterns(query: string) {
  const normalizedQuery = normalizeAlias(query);

  if (normalizedQuery.length < 2) {
    return [];
  }

  return UNIVERSITY_ALIAS_PATTERNS.flatMap(({ aliases, patterns }) =>
    aliases.some(
      (alias) => alias === normalizedQuery || alias.startsWith(normalizedQuery),
    )
      ? patterns
      : [],
  );
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const query = (url.searchParams.get("query") || "").trim();
    const limit = Math.min(Number(url.searchParams.get("limit") || 10), 50);

    if (!query) {
      return NextResponse.json(
        { success: false, message: "query is required (ex: /api/search?query=cs)" },
        { status: 400 }
      );
    }

    const like = `%${query}%`;
    const universityAliasPatterns = getUniversityAliasPatterns(query);
    const universityAliasWhere = universityAliasPatterns.length
      ? `OR (${universityAliasPatterns.map(() => "u.name LIKE ?").join(" OR ")})`
      : "";
    const universityAliasOrder = universityAliasPatterns.length
      ? `(${universityAliasPatterns.map(() => "u.name LIKE ?").join(" OR ")}) DESC,`
      : "";

    const [rows] = await pool.query<SearchRow[]>(
      `
      SELECT
        c.course_id,
        c.code,
        c.title,
        d.name AS department,
        u.name AS university
      FROM course c
      INNER JOIN department d ON d.department_id = c.department_id
      INNER JOIN university u ON u.university_id = d.university_id
      WHERE
        c.code LIKE ?
        OR c.title LIKE ?
        OR d.name LIKE ?
        OR u.name LIKE ?
        ${universityAliasWhere}
      ORDER BY
        ${universityAliasOrder}
        -- Put "code match" first, then title match
        (c.code LIKE ?) DESC,
        (c.title LIKE ?) DESC,
        c.course_id DESC
      LIMIT ?
      `,
      [
        like,
        like,
        like,
        like,
        ...universityAliasPatterns,
        ...universityAliasPatterns,
        like,
        like,
        limit,
      ],
    );

    const results = rows.map((r) => ({
      courseId: r.course_id,
      code: r.code,
      title: r.title,
      university: r.university,
      department: r.department,
    }));

    return NextResponse.json({
      success: true,
      query,
      count: results.length,
      results,
    });
  } catch (error: unknown) {
    console.error("SEARCH ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to search" },
      { status: 500 }
    );
  }
}
