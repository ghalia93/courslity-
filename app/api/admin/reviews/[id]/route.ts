import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

/**
 * DELETE /api/admin/reviews/[id]
 *
 * Soft-deletes a review by setting deleted_at.
 * Votes are preserved so historical aggregates remain consistent.
 * Hard-delete is intentionally avoided — reviews are user-generated content
 * and may be needed for auditing.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const reviewId = parseInt(id, 10);

    if (isNaN(reviewId) || reviewId <= 0) {
      return NextResponse.json(
        { success: false, message: "Invalid review ID" },
        { status: 400 },
      );
    }

    // Check the review exists and isn't already deleted
    const [rows]: any = await pool.query(
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
  } catch (error: any) {
    console.error("DELETE REVIEW ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
