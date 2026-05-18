// Handles current-user notifications.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAuth } from "@/lib/auth";
import pool from "@/db";
import { ensureNotificationTables } from "@/lib/notificationsDb";

type NotificationRow = RowDataPacket & {
  notification_id: number;
  title: string;
  message: string;
  link: string | null;
  created_at: string;
};

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await ensureNotificationTables();

    const [rows] = await pool.query<NotificationRow[]>(
      `SELECT notification_id, title, message, link,
        DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
      FROM notification
      WHERE user_id = ? AND read_at IS NULL
      ORDER BY created_at DESC
      LIMIT 10`,
      [user.userId],
    );

    return NextResponse.json({ success: true, notifications: rows });
  } catch (error: unknown) {
    console.error("GET NOTIFICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await ensureNotificationTables();

    const body = await req.json();
    const ids = Array.isArray(body?.notificationIds)
      ? body.notificationIds
          .map((id: unknown) => Number(id))
          .filter((id: number) => Number.isInteger(id) && id > 0)
      : [];

    if (ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    await pool.query(
      `UPDATE notification
        SET read_at = NOW()
      WHERE user_id = ?
        AND notification_id IN (${ids.map(() => "?").join(",")})`,
      [user.userId, ...ids],
    );

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("POST NOTIFICATIONS ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
