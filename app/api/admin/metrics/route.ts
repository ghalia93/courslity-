// Handles API admin metrics requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type ChartPoint = {
  date: string;
  count: number;
};

type CourseRatingPoint = {
  courseId: number;
  code: string;
  title: string;
  averageRating: number;
  reviewCount: number;
};

type PendingVerificationUser = {
  id: number;
  name: string;
  email: string;
  university: string | null;
  role: string;
  joined: string | Date;
};

type MetricsResponse = {
  totalUsers: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
  pendingVerificationCount: number;
  pendingVerification: PendingVerificationUser[];
  userGrowth: ChartPoint[];
  reviewsTrend: ChartPoint[];
  ratingDistribution: CourseRatingPoint[];
};

type MetricsRow = RowDataPacket & {
  totalUsers: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
};

type CountRow = RowDataPacket & {
  date: string;
  count: number;
};

type TotalRow = RowDataPacket & {
  count: number;
};

type CourseRatingRow = RowDataPacket & {
  courseId: number;
  code: string;
  title: string;
  averageRating: number;
  reviewCount: number;
};

type PendingVerificationRow = RowDataPacket & PendingVerificationUser;

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
      [pendingCountRows],
      [pendingRows],
    ] =
      await Promise.all([
        pool.query<MetricsRow[]>(`
          SELECT
            (SELECT COUNT(*) FROM user WHERE deleted_at IS NULL) AS totalUsers,
            (SELECT COUNT(*) FROM course) AS totalCourses,
            (SELECT COUNT(*) FROM review) AS totalReviews,
            COALESCE(ROUND(AVG(r.overall_rating), 1), 0) AS averageRating
          FROM review r;
        `),

        pool.query<CountRow[]>(`
          SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') as date,
            COUNT(*) as count
          FROM user
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at);
        `),

        pool.query<CountRow[]>(`
          SELECT
            DATE_FORMAT(created_at, '%Y-%m-%d') as date,
            COUNT(*) as count
          FROM review
          WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
          GROUP BY DATE(created_at)
          ORDER BY DATE(created_at);
        `),

        pool.query<CourseRatingRow[]>(`
          SELECT
            c.course_id AS courseId,
            c.code,
            c.title,
            ROUND(AVG(r.overall_rating), 2) AS averageRating,
            COUNT(r.review_id) AS reviewCount
          FROM course c
          JOIN review r
            ON r.course_id = c.course_id
           AND r.deleted_at IS NULL
          GROUP BY c.course_id, c.code, c.title
          HAVING COUNT(r.review_id) > 0
          ORDER BY averageRating DESC, reviewCount DESC, c.code ASC;
        `),

        pool.query<TotalRow[]>(`
          SELECT COUNT(*) AS count
          FROM user
          WHERE deleted_at IS NULL
            AND email_verified_at IS NULL;
        `),

        pool.query<PendingVerificationRow[]>(`
          SELECT
            u.user_id AS id,
            u.full_name AS name,
            u.email,
            uni.name AS university,
            u.role,
            u.created_at AS joined
          FROM user u
          LEFT JOIN university uni
            ON uni.university_id = u.university_id
          WHERE u.deleted_at IS NULL
            AND u.email_verified_at IS NULL
          ORDER BY u.created_at DESC
          LIMIT 6;
        `),
      ]);

    const metrics = metricsRows?.[0] || {};

    const payload: MetricsResponse = {
      totalUsers: Number(metrics.totalUsers || 0),
      totalCourses: Number(metrics.totalCourses || 0),
      totalReviews: Number(metrics.totalReviews || 0),
      averageRating: Number(metrics.averageRating || 0),
      pendingVerificationCount: Number(pendingCountRows?.[0]?.count || 0),
      pendingVerification: (pendingRows || []).map((row) => ({
        id: Number(row.id),
        name: row.name,
        email: row.email,
        university: row.university,
        role: row.role,
        joined: row.joined,
      })),

      userGrowth: (userGrowthRows || []).map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),

      reviewsTrend: (reviewsTrendRows || []).map((row) => ({
        date: row.date,
        count: Number(row.count),
      })),

      ratingDistribution: (ratingRows || []).map((row) => ({
        courseId: Number(row.courseId),
        code: row.code,
        title: row.title,
        averageRating: Number(row.averageRating),
        reviewCount: Number(row.reviewCount),
      })),
    };

    return NextResponse.json(payload);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
    }

    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ message: "FORBIDDEN" }, { status: 403 });
    }

    console.error("ADMIN METRICS ERROR:", error);
    return NextResponse.json(
      { message: "Failed to load admin metrics" },
      { status: 500 }
    );
  }
}
