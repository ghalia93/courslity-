// Ensures optional review moderation columns exist before queries use them.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

let reviewHiddenColumnEnsured = false;
let reviewHiddenColumnPromise: Promise<void> | null = null;

export async function ensureReviewHiddenColumn() {
  if (reviewHiddenColumnEnsured) return;
  if (reviewHiddenColumnPromise) return reviewHiddenColumnPromise;

  reviewHiddenColumnPromise = ensureReviewHiddenColumnInner().finally(() => {
    reviewHiddenColumnPromise = null;
  });
  return reviewHiddenColumnPromise;
}

async function ensureReviewHiddenColumnInner() {
  const [rows] = await pool.query<RowDataPacket[]>(
    `SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = 'review'
        AND COLUMN_NAME = 'hidden_at'
      LIMIT 1`,
  );

  if (!rows.length) {
    await pool.query(
      "ALTER TABLE review ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL AFTER deleted_at",
    );
  }

  reviewHiddenColumnEnsured = true;
}
