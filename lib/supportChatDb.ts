// Support chat table helpers shared by student and admin chat routes.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";

let supportChatTablesEnsured = false;

type ThreadRow = RowDataPacket & {
  thread_id: number;
};

export async function ensureSupportChatTables() {
  if (supportChatTablesEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_thread (
      thread_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NOT NULL,
      status ENUM('open','closed') NOT NULL DEFAULT 'open',
      last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (thread_id),
      UNIQUE KEY uniq_support_thread_user (user_id),
      KEY idx_support_thread_last_message (last_message_at),
      CONSTRAINT fk_support_thread_user
        FOREIGN KEY (user_id) REFERENCES \`user\`(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_message (
      message_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      thread_id INT UNSIGNED NOT NULL,
      sender_id INT UNSIGNED NULL,
      sender_role ENUM('student','admin') NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id),
      KEY idx_support_message_thread (thread_id, created_at),
      KEY idx_support_message_sender (sender_id),
      CONSTRAINT fk_support_message_thread
        FOREIGN KEY (thread_id) REFERENCES support_thread(thread_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,
      CONSTRAINT fk_support_message_sender
        FOREIGN KEY (sender_id) REFERENCES \`user\`(user_id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  supportChatTablesEnsured = true;
}

export async function getOrCreateSupportThread(userId: number) {
  await ensureSupportChatTables();

  const [existingRows] = await pool.query<ThreadRow[]>(
    "SELECT thread_id FROM support_thread WHERE user_id = ? LIMIT 1",
    [userId],
  );

  if (existingRows.length > 0) {
    return existingRows[0].thread_id;
  }

  const [result] = await pool.query<ResultSetHeader>(
    "INSERT INTO support_thread (user_id) VALUES (?)",
    [userId],
  );

  return result.insertId;
}
