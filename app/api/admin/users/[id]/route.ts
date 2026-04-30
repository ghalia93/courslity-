import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";

type UserRow = RowDataPacket & {
  user_id: number;
  role: string;
  deleted_at: Date | string | null;
  email_verified_at: Date | string | null;
};

type UserAction = "verify" | "activate" | "deactivate";

function isUserAction(value: unknown): value is UserAction {
  return value === "verify" || value === "activate" || value === "deactivate";
}

async function getTargetUser(userId: number) {
  const [users] = await pool.query<UserRow[]>(
    "SELECT user_id, role, deleted_at, email_verified_at FROM user WHERE user_id = ? LIMIT 1",
    [userId],
  );

  return users[0] ?? null;
}

function isProtectedDeactivation(
  currentAdminId: number,
  targetUser: UserRow,
) {
  return currentAdminId === targetUser.user_id || targetUser.role === "admin";
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const currentAdmin = await requireAdmin(req);
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id, 10);

    if (isNaN(userId) || userId <= 0) {
      return NextResponse.json(
        { message: "Invalid user ID" },
        { status: 400 },
      );
    }

    const body = await req.json().catch(() => null);
    const action = body?.action;

    if (!isUserAction(action)) {
      return NextResponse.json(
        { message: "action must be verify, activate, or deactivate" },
        { status: 400 },
      );
    }

    const targetUser = await getTargetUser(userId);
    if (!targetUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    if (action === "verify") {
      await pool.query(
        `UPDATE user
        SET email_verified_at = COALESCE(email_verified_at, NOW()),
            email_verification_token = NULL
        WHERE user_id = ?`,
        [userId],
      );

      return NextResponse.json({
        success: true,
        message: "User verified successfully",
      });
    }

    if (action === "activate") {
      const [result] = await pool.query<ResultSetHeader>(
        "UPDATE user SET deleted_at = NULL WHERE user_id = ?",
        [userId],
      );

      if (result.affectedRows === 0) {
        return NextResponse.json(
          { message: "User could not be activated" },
          { status: 409 },
        );
      }

      return NextResponse.json({
        success: true,
        message: "User activated successfully",
      });
    }

    if (isProtectedDeactivation(currentAdmin.userId, targetUser)) {
      return NextResponse.json(
        { message: "Protected admin accounts cannot be deactivated" },
        { status: 400 },
      );
    }

    if (targetUser.deleted_at) {
      return NextResponse.json(
        { message: "User is already deactivated" },
        { status: 409 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      "UPDATE user SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL",
      [userId],
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { message: "User could not be deactivated" },
        { status: 409 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("PATCH USER ERROR:", error);
    return NextResponse.json({ message: "UNAUTHORIZED" }, { status: 401 });
  }
}

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
    const targetUser = await getTargetUser(userId);

    if (!targetUser) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deleting yourself
    if (isProtectedDeactivation(currentAdmin.userId, targetUser)) {
      return NextResponse.json(
        { message: "Protected admin accounts cannot be deactivated" },
        { status: 400 }
      );
    }

    if (targetUser.deleted_at) {
      return NextResponse.json(
        { message: "User is already deactivated" },
        { status: 409 }
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
