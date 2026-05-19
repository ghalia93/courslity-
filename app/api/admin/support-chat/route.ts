// Handles admin support chat inbox and replies.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { requireAdmin } from "@/lib/auth";
import pool from "@/db";
import { ensureSupportChatTables } from "@/lib/supportChatDb";

type SupportThreadRow = RowDataPacket & {
  thread_id: number;
  user_id: number | null;
  full_name: string;
  email: string;
  status: string;
  latest_message: string | null;
  last_message_at: string;
  is_visitor: 0 | 1;
};

type SupportMessageRow = RowDataPacket & {
  message_id: number;
  sender_role: "student" | "visitor" | "admin";
  body: string;
  created_at: string;
  edited: 0 | 1;
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
      DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') AS created_at,
      CASE WHEN updated_at > created_at THEN 1 ELSE 0 END AS edited
    FROM support_message
    WHERE thread_id = ?
      AND deleted_at IS NULL
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
        CASE
          WHEN st.user_id IS NULL THEN COALESCE(st.visitor_name, 'Anonymous visitor')
          ELSE COALESCE(u.full_name, 'Student')
        END AS full_name,
        CASE
          WHEN st.user_id IS NULL THEN 'Anonymous visitor'
          ELSE COALESCE(u.email, '')
        END AS email,
        CASE WHEN st.user_id IS NULL THEN 1 ELSE 0 END AS is_visitor,
        st.status,
        DATE_FORMAT(st.last_message_at, '%Y-%m-%d %H:%i') AS last_message_at,
        (
          SELECT sm.body
          FROM support_message sm
          WHERE sm.thread_id = st.thread_id
            AND sm.deleted_at IS NULL
          ORDER BY sm.created_at DESC, sm.message_id DESC
          LIMIT 1
        ) AS latest_message
      FROM support_thread st
      LEFT JOIN \`user\` u ON u.user_id = st.user_id
      WHERE EXISTS (
        SELECT 1
        FROM support_message sm_exists
        WHERE sm_exists.thread_id = st.thread_id
          AND sm_exists.deleted_at IS NULL
      )
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

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAdmin(req);
    await ensureSupportChatTables();

    const body = await req.json();
    const threadId = Number(body?.threadId);
    const messageId = Number(body?.messageId);
    const message = String(body?.message || "").trim();

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid threadId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid messageId is required" },
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

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE support_message
       SET body = ?, updated_at = NOW()
       WHERE message_id = ?
         AND thread_id = ?
         AND sender_id = ?
         AND sender_role = 'admin'
         AND deleted_at IS NULL`,
      [message, messageId, threadId, user.userId],
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW() WHERE thread_id = ?",
      [threadId],
    );

    const messages = await getMessages(threadId);

    return NextResponse.json({ success: true, messages });
  } catch (error: unknown) {
    console.error("PATCH ADMIN SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureSupportChatTables();

    const { searchParams } = new URL(req.url);
    const threadId = Number(searchParams.get("threadId") || 0);
    const messageId = Number(searchParams.get("messageId") || 0);

    if (!Number.isInteger(threadId) || threadId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid threadId is required" },
        { status: 400 },
      );
    }

    if (!Number.isInteger(messageId) || messageId <= 0) {
      return NextResponse.json(
        { success: false, message: "Valid messageId is required" },
        { status: 400 },
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE support_message
       SET deleted_at = NOW()
       WHERE message_id = ?
         AND thread_id = ?
         AND deleted_at IS NULL`,
      [messageId, threadId],
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW() WHERE thread_id = ?",
      [threadId],
    );

    const messages = await getMessages(threadId);

    return NextResponse.json({ success: true, messages });
  } catch (error: unknown) {
    console.error("DELETE ADMIN SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
