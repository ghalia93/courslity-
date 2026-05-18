// Handles the student support chat thread.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAuth } from "@/lib/auth";
import pool from "@/db";
import {
  ensureSupportChatTables,
  getOrCreateSupportThread,
} from "@/lib/supportChatDb";
import { isAdminRole } from "@/lib/roles";

type SupportMessageRow = RowDataPacket & {
  message_id: number;
  sender_role: "student" | "admin";
  body: string;
  created_at: string;
};

async function getMessages(threadId: number) {
  const [messages] = await pool.query<SupportMessageRow[]>(
    `SELECT
      message_id,
      sender_role,
      body,
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at
    FROM support_message
    WHERE thread_id = ?
    ORDER BY created_at ASC, message_id ASC`,
    [threadId],
  );

  return messages;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await ensureSupportChatTables();

    const threadId = await getOrCreateSupportThread(user.userId);
    const messages = await getMessages(threadId);

    return NextResponse.json({
      success: true,
      thread: { thread_id: threadId },
      messages,
    });
  } catch (error: unknown) {
    console.error("GET SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await ensureSupportChatTables();

    const body = await req.json();
    const message = String(body?.message || "").trim();

    if (!message) {
      return NextResponse.json(
        { success: false, message: "Message is required" },
        { status: 400 },
      );
    }

    if (message.length > 1000) {
      return NextResponse.json(
        { success: false, message: "Message is too long" },
        { status: 400 },
      );
    }

    const threadId = await getOrCreateSupportThread(user.userId);
    const senderRole = isAdminRole(user.role) ? "admin" : "student";

    await pool.query(
      `INSERT INTO support_message (thread_id, sender_id, sender_role, body)
      VALUES (?, ?, ?, ?)`,
      [threadId, user.userId, senderRole, message],
    );

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW(), status = 'open' WHERE thread_id = ?",
      [threadId],
    );

    const messages = await getMessages(threadId);

    return NextResponse.json({
      success: true,
      thread: { thread_id: threadId },
      messages,
    });
  } catch (error: unknown) {
    console.error("POST SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
