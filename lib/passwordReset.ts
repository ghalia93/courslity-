import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import pool from "@/db";

const RESET_TOKEN_EXPIRES_IN = "1h";
const RESET_TOKEN_EXPIRES_MS = 60 * 60 * 1000;
let passwordResetTableReady: Promise<void> | null = null;

type PasswordResetUserRow = RowDataPacket & {
  user_id: number;
  email: string;
};

export type PasswordResetLinkResult =
  | {
      found: false;
    }
  | {
      found: true;
      user: {
        userId: number;
        email: string;
      };
      resetUrl: string;
      expiresAt: string;
    };

export function normalizeEmail(value: unknown) {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function getAppBaseUrl(requestUrl: string) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  return new URL(requestUrl).origin;
}

export async function ensurePasswordResetTable() {
  if (!passwordResetTableReady) {
    passwordResetTableReady = pool
      .query(
        `CREATE TABLE IF NOT EXISTS password_reset_token (
          user_id INT UNSIGNED NOT NULL,
          token TEXT NOT NULL,
          expires_at DATETIME NOT NULL,
          used_at DATETIME DEFAULT NULL,
          created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id),
          CONSTRAINT fk_prt_user
            FOREIGN KEY (user_id) REFERENCES \`user\` (user_id)
            ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,
      )
      .then(() => undefined)
      .catch((error) => {
        passwordResetTableReady = null;
        throw error;
      });
  }

  return passwordResetTableReady;
}

export async function createPasswordResetLink(
  email: string,
  appBaseUrl: string,
): Promise<PasswordResetLinkResult> {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET_MISSING");
  }

  const [rows] = await pool.query<PasswordResetUserRow[]>(
    "SELECT user_id, email FROM `user` WHERE email = ? AND deleted_at IS NULL LIMIT 1",
    [normalizeEmail(email)],
  );

  if (rows.length === 0) {
    return { found: false };
  }

  await ensurePasswordResetTable();

  const user = rows[0];
  const resetToken = jwt.sign(
    {
      userId: user.user_id,
      email: user.email,
      purpose: "password-reset",
    },
    secret,
    { expiresIn: RESET_TOKEN_EXPIRES_IN },
  );

  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRES_MS).toISOString();

  await pool.query(
    `INSERT INTO password_reset_token (user_id, token, expires_at, used_at)
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 1 HOUR), NULL)
     ON DUPLICATE KEY UPDATE
       token = VALUES(token),
       expires_at = VALUES(expires_at),
       used_at = NULL`,
    [user.user_id, resetToken],
  );

  return {
    found: true,
    user: {
      userId: user.user_id,
      email: user.email,
    },
    resetUrl: `${appBaseUrl}/reset-password/${encodeURIComponent(resetToken)}`,
    expiresAt,
  };
}
