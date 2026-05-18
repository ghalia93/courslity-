// Handles admin support chat inbox and replies.
import { NextRequest, NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureSupportChatTables } from "@/lib/supportChatDb";

type SupportThreadRow = RowDataPacket & {
  thread_id: number;
  user_id: number;
  full_name: string;
  email: string;
  status: string;
  latest_message: string | null;
  last_message_at: string;
};

type SupportMessageRow = RowDataPacket & {
  message_id: number;
  sender_role: "student" | "admin";
  body: string;
  created_at: string;
};

type ThreadExistsRow = RowDataPacket & {
  thread_id: number;
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
    await requireAdmin(req);
    await ensureSupportChatTables();

    const { searchParams } = new URL(req.url);
    const threadId = Number(searchParams.get("thread_id") || 0);

    if (Number.isInteger(threadId) && threadId > 0) {
      const messages = await getMessages(threadId);
      return NextResponse.json({ success: true, messages });
    }

    const [threads] = await pool.query<SupportThreadRow[]>(
      `SELECT
        st.thread_id,
        st.user_id,
        COALESCE(u.full_name, 'Student') AS full_name,
        COALESCE(u.email, '') AS email,
        st.status,
        DATE_FORMAT(st.last_message_at, '%Y-%m-%d %H:%i') AS last_message_at,
        (
          SELECT sm.body
          FROM support_message sm
          WHERE sm.thread_id = st.thread_id
          ORDER BY sm.created_at DESC, sm.message_id DESC
          LIMIT 1
        ) AS latest_message
      FROM support_thread st
      JOIN \`user\` u ON u.user_id = st.user_id
      ORDER BY st.last_message_at DESC, st.thread_id DESC`,
    );

    return NextResponse.json({ success: true, threads });
  } catch (error: unknown) {
    console.error("GET ADMIN SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    await ensureSupportChatTables();

    const body = await req.json();
    const threadId = Number(body?.threadId);
    const message = String(body?.message || "").trim();

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid threadId is required" },
        { status: 400 },
      );
    }

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

    const [threadRows] = await pool.query<ThreadExistsRow[]>(
      "SELECT thread_id FROM support_thread WHERE thread_id = ? LIMIT 1",
      [threadId],
    );

    if (!threadRows.length) {
      return NextResponse.json(
        { success: false, message: "Chat thread not found" },
        { status: 404 },
      );
    }

    await pool.query(
      `INSERT INTO support_message (thread_id, sender_id, sender_role, body)
      VALUES (?, ?, 'admin', ?)`,
      [threadId, user.userId, message],
    );

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW(), status = 'open' WHERE thread_id = ?",
      [threadId],
    );

    const messages = await getMessages(threadId);

    return NextResponse.json({ success: true, messages });
  } catch (error: unknown) {
    console.error("POST ADMIN SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
