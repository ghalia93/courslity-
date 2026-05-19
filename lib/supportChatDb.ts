// Support chat table helpers shared by student and admin chat routes.
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import pool from "@/db";

let supportChatTablesEnsured = false;

type ThreadRow = RowDataPacket & {
  thread_id: number;
};

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

async function indexExists(tableName: string, indexName: string) {
  const [rows] = await pool.query<SchemaRow[]>(
    `SELECT INDEX_NAME AS name
     FROM INFORMATION_SCHEMA.STATISTICS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND INDEX_NAME = ?
     LIMIT 1`,
    [tableName, indexName],
  );

  return rows.length > 0;
}

export async function ensureSupportChatTables() {
  if (supportChatTablesEnsured) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS support_thread (
      thread_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
      user_id INT UNSIGNED NULL,
      visitor_key VARCHAR(64) NULL,
      visitor_name VARCHAR(120) NULL,
      status ENUM('open','closed') NOT NULL DEFAULT 'open',
      last_message_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (thread_id),
      UNIQUE KEY uniq_support_thread_user (user_id),
      UNIQUE KEY uniq_support_thread_visitor (visitor_key),
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
      sender_role ENUM('student','visitor','admin') NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted_at TIMESTAMP NULL DEFAULT NULL,
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

  await pool.query(
    "ALTER TABLE support_thread MODIFY user_id INT UNSIGNED NULL",
  );

  if (!(await columnExists("support_thread", "visitor_key"))) {
    await pool.query(
      "ALTER TABLE support_thread ADD COLUMN visitor_key VARCHAR(64) NULL AFTER user_id",
    );
  }

  if (!(await columnExists("support_thread", "visitor_name"))) {
    await pool.query(
      "ALTER TABLE support_thread ADD COLUMN visitor_name VARCHAR(120) NULL AFTER visitor_key",
    );
  }

  if (!(await indexExists("support_thread", "uniq_support_thread_visitor"))) {
    await pool.query(
      "ALTER TABLE support_thread ADD UNIQUE KEY uniq_support_thread_visitor (visitor_key)",
    );
  }

  await pool.query(
    "ALTER TABLE support_message MODIFY sender_role ENUM('student','visitor','admin') NOT NULL",
  );

  if (!(await columnExists("support_message", "updated_at"))) {
    await pool.query(
      "ALTER TABLE support_message ADD COLUMN updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP AFTER created_at",
    );
  }

  if (!(await columnExists("support_message", "deleted_at"))) {
    await pool.query(
      "ALTER TABLE support_message ADD COLUMN deleted_at TIMESTAMP NULL DEFAULT NULL AFTER updated_at",
    );
  }

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

export async function getOrCreateVisitorSupportThread(visitorKey: string) {
  await ensureSupportChatTables();

  const [existingRows] = await pool.query<ThreadRow[]>(
    "SELECT thread_id FROM support_thread WHERE visitor_key = ? LIMIT 1",
    [visitorKey],
  );

  if (existingRows.length > 0) {
    return existingRows[0].thread_id;
  }

  const [result] = await pool.query<ResultSetHeader>(
    `INSERT INTO support_thread (user_id, visitor_key, visitor_name)
     VALUES (NULL, ?, 'Anonymous visitor')`,
    [visitorKey],
  );

  return result.insertId;
}
