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
  latest_message_id: number | null;
  latest_message: string | null;
  latest_sender_role: "student" | "visitor" | "admin" | null;
  last_message_at: string;
  is_visitor: 0 | 1;
  unread: 0 | 1;
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

type UnreadCountRow = RowDataPacket & {
  unread_count: number | string;
};

type LatestUnreadThreadRow = RowDataPacket & {
  latest_message_id: number;
  full_name: string;
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

async function getUnreadChatCount() {
  const [rows] = await pool.query<UnreadCountRow[]>(
    `SELECT COUNT(*) AS unread_count
     FROM support_thread st
     JOIN (
       SELECT
         sm.thread_id,
         sm.sender_role,
         sm.created_at
       FROM support_message sm
       JOIN (
         SELECT thread_id, MAX(message_id) AS latest_message_id
         FROM support_message
         WHERE deleted_at IS NULL
         GROUP BY thread_id
       ) latest
         ON latest.latest_message_id = sm.message_id
       WHERE sm.deleted_at IS NULL
     ) latest_message
       ON latest_message.thread_id = st.thread_id
     WHERE latest_message.sender_role IN ('student', 'visitor')
       AND (
         st.admin_last_opened_at IS NULL
         OR latest_message.created_at > st.admin_last_opened_at
       )`,
  );

  return Number(rows[0]?.unread_count ?? 0);
}

async function getLatestUnreadThread() {
  const [rows] = await pool.query<LatestUnreadThreadRow[]>(
    `SELECT
       latest_message.message_id AS latest_message_id,
       CASE
         WHEN st.user_id IS NULL THEN COALESCE(st.visitor_name, 'Anonymous visitor')
         ELSE COALESCE(u.full_name, 'Student')
       END AS full_name
     FROM support_thread st
     JOIN (
       SELECT
         sm.thread_id,
         sm.message_id,
         sm.sender_role,
         sm.created_at
       FROM support_message sm
       JOIN (
         SELECT thread_id, MAX(message_id) AS latest_message_id
         FROM support_message
         WHERE deleted_at IS NULL
         GROUP BY thread_id
       ) latest
         ON latest.latest_message_id = sm.message_id
       WHERE sm.deleted_at IS NULL
     ) latest_message
       ON latest_message.thread_id = st.thread_id
     LEFT JOIN \`user\` u ON u.user_id = st.user_id
     WHERE latest_message.sender_role IN ('student', 'visitor')
       AND (
         st.admin_last_opened_at IS NULL
         OR latest_message.created_at > st.admin_last_opened_at
       )
     ORDER BY latest_message.created_at DESC, latest_message.message_id DESC
     LIMIT 1`,
  );

  return rows[0] ?? null;
}

export async function GET(req: NextRequest) {
  try {
    await requireAdmin(req);
    await ensureSupportChatTables();

    const { searchParams } = new URL(req.url);
    const summaryOnly = searchParams.get("summary") === "1";
    const threadId = Number(searchParams.get("thread_id") || 0);

    if (summaryOnly) {
      const unreadCount = await getUnreadChatCount();
      const latestUnreadThread = await getLatestUnreadThread();
      return NextResponse.json({
        success: true,
        unreadCount,
        latestUnreadMessageId: latestUnreadThread?.latest_message_id ?? null,
        latestUnreadName: latestUnreadThread?.full_name ?? null,
      });
    }

    if (Number.isInteger(threadId) && threadId > 0) {
      await pool.query(
        "UPDATE support_thread SET admin_last_opened_at = NOW() WHERE thread_id = ?",
        [threadId],
      );
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
        latest_message.message_id AS latest_message_id,
        latest_message.body AS latest_message,
        latest_message.sender_role AS latest_sender_role,
        CASE
          WHEN latest_message.sender_role IN ('student', 'visitor')
            AND (
              st.admin_last_opened_at IS NULL
              OR latest_message.created_at > st.admin_last_opened_at
            )
          THEN 1
          ELSE 0
        END AS unread
      FROM support_thread st
      JOIN (
        SELECT
          sm.thread_id,
          sm.message_id,
          sm.body,
          sm.sender_role,
          sm.created_at
        FROM support_message sm
        JOIN (
          SELECT thread_id, MAX(message_id) AS latest_message_id
          FROM support_message
          WHERE deleted_at IS NULL
          GROUP BY thread_id
        ) latest
          ON latest.latest_message_id = sm.message_id
        WHERE sm.deleted_at IS NULL
      ) latest_message
        ON latest_message.thread_id = st.thread_id
      LEFT JOIN \`user\` u ON u.user_id = st.user_id
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
