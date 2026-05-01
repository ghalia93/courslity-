import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

export interface HeroStatsResponse {
  universities: number;
  courses: number;
}

type CountRow = RowDataPacket & {
  count: number;
};

export async function GET() {
  try {
    const [[uniRows], [courseRows]] = await Promise.all([
      pool.query<CountRow[]>(
        "SELECT COUNT(*) AS count FROM `university` WHERE is_active = 1",
      ),
      pool.query<CountRow[]>(
        "SELECT COUNT(*) AS count FROM `course` WHERE deleted_at IS NULL",
      ),
    ]);

    const data: HeroStatsResponse = {
      universities: uniRows[0].count,
      courses: courseRows[0].count,
    };

    return NextResponse.json(data, {
      status: 200,
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[hero-stats] Failed to fetch stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 },
    );
  }
}
