// Handles API departments requests.
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type DepartmentRow = RowDataPacket & {
  department_id: number;
  name: string;
  university_id: number;
  university: string;
};

export async function GET() {
  try {
    const [rows] = await pool.query<DepartmentRow[]>(
      `SELECT
        d.department_id,
        d.name,
        u.university_id,
        u.name AS university
      FROM department d
      INNER JOIN university u ON u.university_id = d.university_id
      WHERE d.is_active = 1
        AND u.is_active = 1
      ORDER BY u.name ASC, d.name ASC`,
    );

    return NextResponse.json(rows);
  } catch (error: unknown) {
    console.error("DEPARTMENTS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load departments" },
      { status: 500 },
    );
  }
}
