// Handles API profile delete requests.
import { NextRequest, NextResponse } from "next/server";
import pool from "@/db";
import { requireAuth } from "@/lib/auth";

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    await pool.query(
      "UPDATE `user` SET deleted_at = NOW() WHERE user_id = ? AND deleted_at IS NULL",
      [user.userId],
    );

    const response = NextResponse.json({
      success: true,
      message: "Account deactivated successfully",
    });

    response.cookies.set("auth_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("DELETE ACCOUNT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
