// Ensures course video metadata columns exist and normalizes admin input.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

type ColumnRow = RowDataPacket & {
  COLUMN_NAME: string;
};

let ensurePromise: Promise<void> | null = null;

function isDuplicateColumnError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === "ER_DUP_FIELDNAME"
  );
}

async function addColumnIfMissing(
  existingColumns: Set<string>,
  columnName: string,
  ddl: string,
) {
  if (existingColumns.has(columnName)) return;

  try {
    await pool.query(ddl);
  } catch (error) {
    if (!isDuplicateColumnError(error)) throw error;
  }
}

async function createCourseVideoColumns() {
  const [rows] = await pool.query<ColumnRow[]>(
    `SELECT COLUMN_NAME
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'course'
      AND COLUMN_NAME IN ('video_url', 'video_title')`,
  );
  const existingColumns = new Set(rows.map((row) => row.COLUMN_NAME));

  await addColumnIfMissing(
    existingColumns,
    "video_url",
    "ALTER TABLE course ADD COLUMN video_url VARCHAR(2048) NULL AFTER description",
  );
  await addColumnIfMissing(
    existingColumns,
    "video_title",
    "ALTER TABLE course ADD COLUMN video_title VARCHAR(255) NULL AFTER video_url",
  );
}

export async function ensureCourseVideoColumns() {
  if (!ensurePromise) {
    ensurePromise = createCourseVideoColumns().catch((error) => {
      ensurePromise = null;
      throw error;
    });
  }

  return ensurePromise;
}

export function normalizeOptionalVideoTitle(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new Error("video_title must be a string");
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 255) {
    throw new Error("video_title must be 255 characters or fewer");
  }

  return trimmed;
}

export function normalizeOptionalVideoUrl(value: unknown) {
  if (value == null) return null;
  if (typeof value !== "string") {
    throw new Error("video_url must be a string");
  }

  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.length > 2048) {
    throw new Error("video_url must be 2048 characters or fewer");
  }

  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) {
    return trimmed;
  }

  let parsed: URL;
  try {
    parsed = new URL(trimmed);
  } catch {
    throw new Error("video_url must be a valid URL or a site path");
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error("video_url must start with http://, https://, or /");
  }

  return parsed.toString();
}
