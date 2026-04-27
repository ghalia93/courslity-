import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export type AuthUser = {
  userId: number;
  email: string;
  role: string;
};

export function requireAuth(req: NextRequest): AuthUser {
  const token = req.cookies.get("auth_token")?.value;

  if (!token) {
    throw new Error("UNAUTHORIZED");
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET_MISSING");
  }

  try {
    const decoded = jwt.verify(token, secret) as AuthUser;
    return decoded;
  } catch {
    throw new Error("UNAUTHORIZED");
  }
}

export function requireAdmin(req: NextRequest): AuthUser {
  const user = requireAuth(req);

  if (user.role !== "admin" && user.role !== "super_admin") {
    throw new Error("FORBIDDEN");
  }

  return user;
}