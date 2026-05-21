// Ensures university review tables exist before public university review APIs use them.
import type { RowDataPacket } from "mysql2";
import pool from "@/db";

let universityReviewTablesEnsured = false;

type SchemaRow = RowDataPacket & {
  name: string;
};

async function columnExists(tableName: string, columnName: string) {
  const [rows] = await pool.query<SchemaRow[]>(
    `SELECT COLUMN_NAME AS name
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?
     LIMIT 1`,
    [tableName, columnName],
  );

  return rows.length > 0;
}

export async function ensureUniversityReviewTables() {
  if (universityReviewTablesEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS university_review (
      university_review_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      university_id INT UNSIGNED NOT NULL,
      overall_rating DECIMAL(3,2) NOT NULL CHECK (overall_rating BETWEEN 0 AND 5),
      academic_quality_rating DECIMAL(3,2) NOT NULL CHECK (academic_quality_rating BETWEEN 1 AND 5),
      professors_rating DECIMAL(3,2) NOT NULL CHECK (professors_rating BETWEEN 1 AND 5),
      facilities_rating DECIMAL(3,2) NOT NULL CHECK (facilities_rating BETWEEN 1 AND 5),
      tuition_value_rating DECIMAL(3,2) NOT NULL CHECK (tuition_value_rating BETWEEN 1 AND 5),
      student_life_rating DECIMAL(3,2) NOT NULL CHECK (student_life_rating BETWEEN 1 AND 5),
      review_text TEXT NOT NULL,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
      hidden_at TIMESTAMP NULL DEFAULT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (university_review_id),
      UNIQUE KEY uniq_university_review_user_university (user_id, university_id),
      KEY idx_university_review_university (university_id, created_at),
      CONSTRAINT fk_university_review_user
        FOREIGN KEY (user_id) REFERENCES \`user\`(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_university_review_university
        FOREIGN KEY (university_id) REFERENCES university(university_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS university_review_vote (
      university_review_id INT UNSIGNED NOT NULL,
      user_id INT UNSIGNED NOT NULL,
      vote_value TINYINT NOT NULL CHECK (vote_value IN (-1, 1)),
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (university_review_id, user_id),
      KEY idx_university_review_vote_user (user_id),
      CONSTRAINT fk_university_review_vote_review
        FOREIGN KEY (university_review_id)
        REFERENCES university_review(university_review_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_university_review_vote_user
        FOREIGN KEY (user_id) REFERENCES \`user\`(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  if (!(await columnExists("university_review", "hidden_at"))) {
    await pool.query(
      "ALTER TABLE university_review ADD COLUMN hidden_at TIMESTAMP NULL DEFAULT NULL AFTER deleted_at",
    );
  }

  universityReviewTablesEnsured = true;
}
