// Handles API stats requests.
//About page statistics
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type AboutStatsResponse = {
  totalReviews: number;
  totalStudents: number;
  totalUniversities: number;
  wouldRecommendPercentage: number;
};

type AboutStatsRow = RowDataPacket & {
  totalReviews: number | string;
  totalStudents: number | string;
  totalUniversities: number | string;
  wouldRecommendPercentage: number | string;
};

export async function GET() {
  try {
    const [rows] = await pool.query<AboutStatsRow[]>(`
      SELECT
        (SELECT COUNT(*) FROM review) AS totalReviews,

        (SELECT COUNT(*) 
         FROM user 
         WHERE role = 'student' AND deleted_at IS NULL) AS totalStudents,

        (SELECT COUNT(*) 
         FROM university) AS totalUniversities,

        COALESCE(
          ROUND(
            (
              SUM(CASE WHEN overall_rating >= 4 THEN 1 ELSE 0 END)
              /
              NULLIF(COUNT(*), 0)
            ) * 100
          , 0)
        , 0) AS wouldRecommendPercentage

      FROM review;
    `);
    const stats = rows[0];

    const response: AboutStatsResponse = {
      totalReviews: Number(stats?.totalReviews || 0),
      totalStudents: Number(stats?.totalStudents || 0),
      totalUniversities: Number(stats?.totalUniversities || 0),
      wouldRecommendPercentage: Number(stats?.wouldRecommendPercentage || 0),
    };

    return NextResponse.json(response);
  } catch (error: unknown) {
    console.error(error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Failed to load stats" },
      { status: 500 }
    );
  }
}
