import { NextRequest } from "next/server";
import type { RowDataPacket } from "mysql2";
import jwt from "jsonwebtoken";
import pool from "@/db";
import {
  isAdminRole,
  isUniversityAdminRole,
  normalizeRole,
} from "@/lib/roles";

export { isAdminRole, isUniversityAdminRole, normalizeRole };

export type AuthUser = {
  userId: number;
  email: string;
  role: string;
};

type AuthRow = RowDataPacket & {
  user_id: number;
  email: string;
  role: string;
};

export async function requireAuth(req: NextRequest): Promise<AuthUser> {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET_MISSING");
  }

  try {
    const decoded = jwt.verify(token, secret) as Partial<AuthUser>;
    const userId = Number(decoded.userId);

    if (!Number.isInteger(userId) || userId <= 0) {
      throw new Error("UNAUTHORIZED");
    }

    const [rows] = await pool.query<AuthRow[]>(
      "SELECT user_id, email, role FROM `user` WHERE user_id = ? AND deleted_at IS NULL LIMIT 1",
      [userId],
    );

    if (!rows.length) {
      throw new Error("UNAUTHORIZED");
    }

    const user = rows[0];

    return {
      userId: user.user_id,
      email: user.email,
      role: normalizeRole(user.role),
    };
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

export async function requireAdmin(req: NextRequest): Promise<AuthUser> {
  const user = await requireAuth(req);

  if (!isAdminRole(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}

export async function requireUniversityAdmin(
  req: NextRequest,
): Promise<AuthUser> {
  const user = await requireAuth(req);

  if (!isUniversityAdminRole(user.role)) {
    throw new Error("FORBIDDEN");
  }

  return user;
}
