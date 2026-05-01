import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { requireAuth } from "@/lib/auth"; 

type ProfileRow = RowDataPacket & {
  user_id: number;
  full_name: string;
  email: string;
  university_name: string | null;
};

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);

    // Fetch full profile from DB
    const [rows] = await pool.query<ProfileRow[]>(
      `
      SELECT 
        u.user_id,
        u.full_name,
        u.email,
        un.name AS university_name
      FROM user u
      LEFT JOIN university un 
        ON u.university_id = un.university_id
      WHERE u.user_id = ?
      LIMIT 1
      `,
      [user.userId],
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: rows[0],
    });
  } catch (error: unknown) {
    console.error("PROFILE GET ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 },
    );
  }
}
