import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type ChartPoint = {
  date: string;
  count: number;
};

type RatingDistribution = {
  rating: number;
  count: number;
};

type MetricsResponse = {
  totalUsers: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
  userGrowth: ChartPoint[];
  reviewsTrend: ChartPoint[];
  ratingDistribution: RatingDistribution[];
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const daysParam = searchParams.get("days");

    let days = 30;
    if (daysParam) {
      const parsed = Number(daysParam);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 365) {
        days = parsed;
      }
    }

    const [
      [metricsRows],
      [userGrowthRows],
      [reviewsTrendRows],
      [ratingRows],
    ]: any = await Promise.all([
      pool.query(`
        SELECT
          (SELECT COUNT(*) FROM user) AS totalUsers,
          (SELECT COUNT(*) FROM course) AS totalCourses,
          (SELECT COUNT(*) FROM review) AS totalReviews,
          COALESCE(ROUND(AVG(r.overall_rating), 1), 0) AS averageRating
        FROM review r;
      `),

      pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m-%d') as date,
          COUNT(*) as count
        FROM user
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at);
      `),

      pool.query(`
        SELECT 
          DATE_FORMAT(created_at, '%Y-%m-%d') as date,
          COUNT(*) as count
        FROM review
        WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY DATE(created_at)
        ORDER BY DATE(created_at);
      `),

      pool.query(`
        SELECT 
          overall_rating as rating,
          COUNT(*) as count
        FROM review
        GROUP BY overall_rating
        ORDER BY overall_rating DESC;
      `),
    ]);

    const metrics = metricsRows?.[0] || {};

    const payload: MetricsResponse = {
      totalUsers: Number(metrics.totalUsers || 0),
      totalCourses: Number(metrics.totalCourses || 0),
      totalReviews: Number(metrics.totalReviews || 0),
      averageRating: Number(metrics.averageRating || 0),

      userGrowth: (userGrowthRows || []).map((row: any) => ({
        date: row.date,
        count: Number(row.count),
      })),

      reviewsTrend: (reviewsTrendRows || []).map((row: any) => ({
        date: row.date,
        count: Number(row.count),
      })),

      ratingDistribution: (ratingRows || []).map((row: any) => ({
        rating: Number(row.rating),
        count: Number(row.count),
      })),
    };

    return NextResponse.json(payload);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    if (error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    console.error("ADMIN METRICS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to load admin metrics" },
      { status: 500 }
    );
  }
}