// Handles API admin feedback requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type FeedbackKind = "feedback" | "problem";

type FeedbackRow = RowDataPacket & {
  feedback_id: number;
  user_id: number | null;
  full_name: string;
  email: string;
  kind: FeedbackKind;
  rating: number;
  message: string;
  created_at: string;
};

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const sort = (searchParams.get("sort") || "newest").trim();
    const kind = (searchParams.get("kind") || "all").trim();

    const conditions: string[] = [];
    const params: string[] = [];

    if (kind === "feedback" || kind === "problem") {
      conditions.push("f.kind = ?");
      params.push(kind);
    }

    if (q) {
      conditions.push("(u.full_name LIKE ? OR u.email LIKE ? OR f.message LIKE ?)");
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const sortClause: Record<string, string> = {
      newest: "f.created_at DESC",
      oldest: "f.created_at ASC",
      rating_high: "f.rating DESC",
      rating_low: "f.rating ASC",
    };
    const orderBy = sortClause[sort] ?? "f.created_at DESC";

    const [rows] = await pool.query<FeedbackRow[]>(
      `SELECT
        f.feedback_id,
        u.user_id,
        COALESCE(u.full_name, 'anonymous') AS full_name,
        COALESCE(u.email, '') AS email,
        f.kind,
        f.rating,
        f.message,
        DATE_FORMAT(f.created_at, '%Y-%m-%d') AS created_at
      FROM feedback f
      LEFT JOIN \`user\` u ON u.user_id = f.user_id
      ${where}
      ORDER BY ${orderBy}`,
      params
    );

    return NextResponse.json({
      success: true,
      feedback: rows,
    });
  } catch (error: unknown) {
    console.error("GET FEEDBACK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
}
