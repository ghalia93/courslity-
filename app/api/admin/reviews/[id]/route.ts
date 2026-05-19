// Handles API admin reviews id requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureReviewHiddenColumn } from "@/lib/reviewDb";

type ReviewIdRow = RowDataPacket & {
  review_id: number;
};

function parseReviewId(id: string) {
  const reviewId = parseInt(id, 10);
  return Number.isInteger(reviewId) && reviewId > 0 ? reviewId : null;
}

/**
 * PATCH /api/admin/reviews/[id]
 *
 * Hides a review from public pages and active admin lists without deleting it.
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    await ensureReviewHiddenColumn();

    const { id } = await params;
    const reviewId = parseReviewId(id);

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<ReviewIdRow[]>(
      `SELECT review_id
        FROM review
        WHERE review_id = ?
          AND deleted_at IS NULL
          AND hidden_at IS NULL
        LIMIT 1`,
      [reviewId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE review SET hidden_at = NOW() WHERE review_id = ?",
      [reviewId],
    );

    return NextResponse.json({
      success: true,
      message: "Review hidden successfully",
    });
  } catch (error: unknown) {
    console.error("HIDE REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * DELETE /api/admin/reviews/[id]
 *
 * Soft-deletes a review by setting deleted_at.
 * Votes are preserved so historical aggregates remain consistent.
 * Hard-delete is intentionally avoided - reviews are user-generated content
 * and may be needed for auditing.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    await ensureReviewHiddenColumn();

    const { id } = await params;
    const reviewId = parseReviewId(id);

    if (!reviewId) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    // Check the review exists and isn't already deleted
    const [rows] = await pool.query<ReviewIdRow[]>(
      "SELECT review_id FROM review WHERE review_id = ? AND deleted_at IS NULL",
      [reviewId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Review not found" },
        { status: 404 },
      );
    }

    // Soft delete
    await pool.query(
      "UPDATE review SET deleted_at = NOW() WHERE review_id = ?",
      [reviewId],
    );

    return NextResponse.json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
