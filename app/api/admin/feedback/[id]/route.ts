// Handles API admin feedback id requests.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureFeedbackHiddenColumn } from "@/lib/feedbackDb";

function parseFeedbackId(id: string) {
  const feedbackId = parseInt(id, 10);
  return Number.isInteger(feedbackId) && feedbackId > 0 ? feedbackId : null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);
    await ensureFeedbackHiddenColumn();

    const { id } = await params;
    const feedbackId = parseFeedbackId(id);

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback ID" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT feedback_id FROM feedback WHERE feedback_id = ? AND hidden_at IS NULL LIMIT 1",
      [feedbackId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404 },
      );
    }

    await pool.query("UPDATE feedback SET hidden_at = NOW() WHERE feedback_id = ?", [
      feedbackId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Feedback hidden successfully",
    });
  } catch (error: unknown) {
    console.error("HIDE FEEDBACK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

/**
 * DELETE /api/admin/feedback/[id]
 *
 * Hard-deletes a feedback entry. Unlike reviews and courses, feedback has no
 * soft-delete column in the schema and no downstream references, so a hard
 * delete is appropriate here.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAdmin(req);

    const { id } = await params;
    const feedbackId = parseFeedbackId(id);

    if (!feedbackId) {
      return NextResponse.json(
        { success: false, message: "Invalid feedback ID" },
        { status: 400 },
      );
    }

    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT feedback_id FROM feedback WHERE feedback_id = ? LIMIT 1",
      [feedbackId],
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Feedback not found" },
        { status: 404 },
      );
    }

    await pool.query("DELETE FROM feedback WHERE feedback_id = ?", [
      feedbackId,
    ]);

    return NextResponse.json({
      success: true,
      message: "Feedback deleted successfully",
    });
  } catch (error: unknown) {
    console.error("DELETE FEEDBACK ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
