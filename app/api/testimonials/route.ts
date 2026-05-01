import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type FeedbackTestimonialRow = RowDataPacket & {
  feedback_id: number;
  message: string;
  user_id: number | null;
  rating: number | string;
  created_at: string | Date;
};

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const limit = Math.min(Number(url.searchParams.get("limit") || 8), 20);

    const [rows] = await pool.query<FeedbackTestimonialRow[]>(
      `
      SELECT feedback_id, message, user_id, rating, created_at
      FROM feedback
      WHERE message IS NOT NULL AND message <> ''
      ORDER BY created_at DESC
      LIMIT ?
      `,
      [limit]
    );

    const testimonials = rows.map((r) => ({
      feedbackId: r.feedback_id,
      text: r.message,
      username: r.user_id ? `student#${r.user_id}` : "anonymous",
      rating: Number(r.rating) || 0,
      createdAt: r.created_at,
    }));

    return NextResponse.json({
      success: true,
      count: testimonials.length,
      testimonials,
    });
  } catch (error: unknown) {
    console.error("TESTIMONIALS ERROR:", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch testimonials",
      },
      { status: 500 }
    );
  }
}
