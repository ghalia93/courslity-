import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type PingUserRow = RowDataPacket & {
  user_id: number;
  email: string;
};

export async function GET() {
  try {
    const [rows] = await pool.query<PingUserRow[]>(
      "SELECT user_id, email FROM `user` LIMIT 1"
    );

    return NextResponse.json({
      success: true,
      message: "Auth DB connection successful",
      sampleUser: rows.length > 0 ? rows[0] : null,
    });
  } catch (error: unknown) {
    console.error("AUTH DB ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Auth DB connection failed",
        error: error instanceof Error ? error.message : String(error),
        code:
          typeof error === "object" && error !== null && "code" in error
            ? String(error.code)
            : undefined,
      },
      { status: 500 }
    );
  }
}
