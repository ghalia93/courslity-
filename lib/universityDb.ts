// Ensures optional university metadata columns exist before queries use them.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

let universityDescriptionColumnEnsured = false;

type SchemaRow = RowDataPacket & {
  name: string;
};

export async function ensureUniversityDescriptionColumn() {
  if (universityDescriptionColumnEnsured) return;

  const [rows] = await pool.query<SchemaRow[]>(
    `SELECT COLUMN_NAME AS name
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'university'
       AND COLUMN_NAME = 'description'
     LIMIT 1`,
  );

  if (rows.length === 0) {
    await pool.query(
      "ALTER TABLE university ADD COLUMN description TEXT NULL AFTER email_domain",
    );
  }

  universityDescriptionColumnEnsured = true;
}
