// Handles API reviews id vote requests.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";
import { requireAuth } from "@/lib/auth";
import { ensureReviewHiddenColumn } from "@/lib/reviewDb";

type ReviewRow = RowDataPacket & {
  review_id: number;
};

type ExistingVoteRow = RowDataPacket & {
  vote_value: number;
};

type VoteSummaryRow = RowDataPacket & {
  upvotes: number | string;
  downvotes: number | string;
  net_votes: number | string;
  user_vote: number | string | null;
};

function parseVote(value: unknown): 1 | -1 | null {
  if (value === 1 || value === "1" || value === "up") return 1;
  if (value === -1 || value === "-1" || value === "down") return -1;
  return null;
}

async function getVoteSummary(reviewId: number, userId: number) {
  const [rows] = await pool.query<VoteSummaryRow[]>(
    `SELECT
      COALESCE(SUM(CASE WHEN vote_value = 1 THEN 1 ELSE 0 END), 0) AS upvotes,
      COALESCE(SUM(CASE WHEN vote_value = -1 THEN 1 ELSE 0 END), 0) AS downvotes,
      COALESCE(SUM(CASE WHEN vote_value = 1 THEN 1 WHEN vote_value = -1 THEN -1 ELSE 0 END), 0) AS net_votes,
      (
        SELECT my_vote.vote_value
        FROM review_vote my_vote
        WHERE my_vote.review_id = ? AND my_vote.user_id = ?
        LIMIT 1
      ) AS user_vote
    FROM review_vote
    WHERE review_id = ?`,
    [reviewId, userId, reviewId],
  );

  const summary = rows[0];

  return {
    upvotes: Number(summary?.upvotes ?? 0),
    downvotes: Number(summary?.downvotes ?? 0),
    net_votes: Number(summary?.net_votes ?? 0),
    user_vote: summary?.user_vote == null ? null : Number(summary.user_vote),
  };
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth(req);
    await ensureReviewHiddenColumn();
    const { id } = await params;
    const reviewId = Number.parseInt(id, 10);

    if (!Number.isInteger(reviewId) || reviewId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => null);
    const nextVote = parseVote(body?.vote);

    if (nextVote == null) {
      return NextResponse.json(
        { success: false, message: "vote must be up or down" },
        { status: 400 },
      );
    }

    const [reviews] = await pool.query<ReviewRow[]>(
      `SELECT review_id
        FROM review
        WHERE review_id = ?
          AND deleted_at IS NULL
          AND hidden_at IS NULL
        LIMIT 1`,
      [reviewId],
    );

    if (reviews.length === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    const [existingRows] = await pool.query<ExistingVoteRow[]>(
      "SELECT vote_value FROM review_vote WHERE review_id = ? AND user_id = ? LIMIT 1",
      [reviewId, user.userId],
    );
    const existingVote = existingRows[0]?.vote_value;

    if (existingVote === nextVote) {
      await pool.query<ResultSetHeader>(
        "DELETE FROM review_vote WHERE review_id = ? AND user_id = ?",
        [reviewId, user.userId],
      );
    } else if (existingRows.length > 0) {
      await pool.query<ResultSetHeader>(
        "UPDATE review_vote SET vote_value = ? WHERE review_id = ? AND user_id = ?",
        [nextVote, reviewId, user.userId],
      );
    } else {
      await pool.query<ResultSetHeader>(
        "INSERT INTO review_vote (review_id, user_id, vote_value) VALUES (?, ?, ?)",
        [reviewId, user.userId, nextVote],
      );
    }

    const summary = await getVoteSummary(reviewId, user.userId);

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json(
        { success: false, message: "You must be logged in to vote" },
        { status: 401 },
      );
    }

    console.error("REVIEW VOTE ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to save vote" },
      { status: 500 },
    );
  }
}
