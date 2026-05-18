// Ensures optional feedback moderation columns exist before admin queries use them.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

let feedbackHiddenColumnEnsured = false;

export async function ensureFeedbackHiddenColumn() {
  if (feedbackHiddenColumnEnsured) return;

  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'feedback'
        AND COLUMN_NAME = 'hidden_at'
      LIMIT 1`,
  );

  if (!rows.length) {
    await pool.query(
      "ALTER TABLE feedback ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL AFTER created_at",
    );
  }

  feedbackHiddenColumnEnsured = true;
}
