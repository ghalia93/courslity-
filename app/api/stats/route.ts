//About page statistics
import { NextResponse } from "next/server";
import pool from "@/db";

type AboutStatsResponse = {
  totalReviews: number;
  totalStudents: number;
  totalUniversities: number;
  wouldRecommendPercentage: number;
};

export async function GET() {
  try {
    const [[stats]]: any = await pool.query(`
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

    const response: AboutStatsResponse = {
      totalReviews: Number(stats?.totalReviews || 0),
      totalStudents: Number(stats?.totalStudents || 0),
      totalUniversities: Number(stats?.totalUniversities || 0),
      wouldRecommendPercentage: Number(stats?.wouldRecommendPercentage || 0),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}
