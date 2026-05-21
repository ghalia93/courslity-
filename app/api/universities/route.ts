// Handles API universities requests.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";
import { ensureUniversityDescriptionColumn } from "@/lib/universityDb";

type UniversityRow = RowDataPacket & {
  university_id: number;
  name: string;
  email_domain: string;
  description: string | null;
};

export async function GET() {
  try {
    await ensureUniversityDescriptionColumn();

    const [rows] = await pool.query<UniversityRow[]>(
      `SELECT university_id, name, email_domain, description
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
