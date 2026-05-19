// Handles API hero-stats requests for homepage counters.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

export interface HeroStatsResponse {
  universities: number;
  courses: number;
}

const DEFAULT_HERO_STATS: HeroStatsResponse = {
  universities: 0,
  courses: 0,
};

type CountRow = RowDataPacket & {
  count: number | string;
};

export async function GET() {
  try {
    const [[uniRows], [courseRows]] = await Promise.all([
      pool.query<CountRow[]>(
        "SELECT COUNT(*) AS count FROM `university` WHERE is_active = 1",
      ),
      pool.query<CountRow[]>(
        `SELECT COUNT(*) AS count
          FROM course c
          INNER JOIN department d ON d.department_id = c.department_id
          INNER JOIN university u ON u.university_id = d.university_id
          WHERE c.deleted_at IS NULL
            AND d.is_active = 1
            AND u.is_active = 1`,
      ),
    ]);

    const data: HeroStatsResponse = {
      universities: Number(uniRows[0]?.count ?? 0),
      courses: Number(courseRows[0]?.count ?? 0),
    };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.warn("[hero-stats] Using fallback stats:", error);
    return NextResponse.json(DEFAULT_HERO_STATS, {
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    });
  }
}
