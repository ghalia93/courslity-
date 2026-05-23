// Handles API feedback requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/db";
import { isAdminRole, requireAuth, type AuthUser } from "@/lib/auth";

type FeedbackKind = "feedback" | "problem";

function isValidKind(value: unknown): value is FeedbackKind {
  return value === "feedback" || value === "problem";
}

async function getOptionalUser(req: NextRequest): Promise<AuthUser | null> {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rating = Number(body?.rating);
    const message = body?.message;
    const rawKind = body?.kind;
    const kind: FeedbackKind = isValidKind(rawKind) ? rawKind : "feedback";
    const currentUser = await getOptionalUser(req);

    if (currentUser && isAdminRole(currentUser.role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Admins cannot submit student feedback or problem reports",
        },
        { status: 403 },
      );
    }

    const userId =
      kind === "problem"
        ? (currentUser ?? (await requireAuth(req))).userId
        : null;

    if (!message || typeof message !== "string" || message.trim().length < 3) {
      return NextResponse.json(
        { success: false, message: "message must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, message: "rating must be an integer between 1 and 5" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "INSERT INTO feedback (user_id, kind, rating, message) VALUES (?, ?, ?, ?)",
      [userId, kind, rating, message.trim()]
    );

    return NextResponse.json(
      {
        success: true,
        message: kind === "problem" ? "Problem reported" : "Feedback submitted",
        feedbackId: result.insertId,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("FEEDBACK POST ERROR:", error);
    const message =
      error instanceof Error ? error.message : "Failed to submit feedback";
    return NextResponse.json(
      { success: false, message },
      { status: message === "UNAUTHORIZED" ? 401 : 500 }
    );
  }
}
