import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
};

export async function GET() {
  try {
    const [rows] = await pool.query<UniversityRow[]>(
      `SELECT university_id, name, email_domain
        FROM university
        WHERE is_active = 1
        ORDER BY name ASC`,
    );
    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error("UNIVERSITIES ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load universities" },
      { status: 500 },
    );
  }
}
