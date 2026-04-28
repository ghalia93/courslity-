import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type UserRow = RowDataPacket & {
  user_id: number;
  role: string;
  deleted_at: Date | string | null;
};

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const currentAdmin = await requireAdmin(req);

    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [users] = await pool.query<UserRow[]>(
      "SELECT user_id, role, deleted_at FROM user WHERE user_id = ? LIMIT 1",
      [userId]
    );

    if (!users || users.length === 0) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const targetUser = users[0];

    // Prevent deleting yourself
    if (currentAdmin.userId === userId) {
      return NextResponse.json(
        { message: "You cannot deactivate yourself" },
        { status: 400 }
      );
    }

    if (targetUser.deleted_at) {
      return NextResponse.json(
        { message: "User is already deactivated" },
        { status: 409 }
      );
    }

    if (targetUser.role === "admin") {
      return NextResponse.json(
        { message: "Protected admin accounts cannot be deactivated" },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL",
      [userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "User could not be deactivated" },
        { status: 409 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });

  } catch (error) {
    console.error("DELETE USER ERROR:", error);
    return NextResponse.json(
      { message: "UNAUTHORIZED" },
      { status: 401 }
    );
  }
}
