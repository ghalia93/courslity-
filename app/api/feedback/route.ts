// Handles API feedback requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader } from "mysql2";
import pool from "@/db";
import { requireAuth } from "@/lib/auth";

type FeedbackKind = "feedback" | "problem";

function isValidKind(value: unknown): value is FeedbackKind {
  return value === "feedback" || value === "problem";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const rating = Number(body?.rating);
    const message = body?.message;
    const rawKind = body?.kind;
    const kind: FeedbackKind = isValidKind(rawKind) ? rawKind : "feedback";
    const userId = kind === "problem" ? (await requireAuth(req)).userId : null;

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
