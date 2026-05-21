// Handles the student support chat thread.
import { NextRequest, NextResponse } from "next/server";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import { randomUUID } from "crypto";
import { requireAuth } from "@/lib/auth";
import pool from "@/db";
import {
  ensureSupportChatTables,
  getOrCreateSupportThread,
  getOrCreateVisitorSupportThread,
} from "@/lib/supportChatDb";
import { isAdminRole } from "@/lib/roles";

type SupportMessageRow = RowDataPacket & {
  message_id: number;
  sender_role: "student" | "visitor" | "admin";
  body: string;
  created_at: string;
  edited: 0 | 1;
};

type ThreadRow = RowDataPacket & {
  thread_id: number;
};

type UnreadReplyCountRow = RowDataPacket & {
  unread_count: number | string;
};

type ChatIdentity = {
  threadId: number;
  senderId: number | null;
  senderRole: "student" | "visitor";
  visitorKey?: string;
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

async function getOptionalUser(req: NextRequest) {
  try {
    return await requireAuth(req);
  } catch {
    return null;
  }
}

function getVisitorKey(req: NextRequest) {
  const existing = req.cookies.get("support_visitor_key")?.value;
  if (existing && /^[a-zA-Z0-9-]{20,80}$/.test(existing)) {
    return existing;
  }

  return randomUUID();
}

function attachVisitorCookie(response: NextResponse, visitorKey?: string) {
  if (!visitorKey) return response;

  response.cookies.set("support_visitor_key", visitorKey, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}

async function getChatIdentity(
  req: NextRequest,
  options: { createVisitor: boolean },
): Promise<ChatIdentity> {
  const user = await getOptionalUser(req);

  if (user) {
    if (isAdminRole(user.role)) {
      throw new Error("FORBIDDEN");
    }

    const threadId = await getOrCreateSupportThread(user.userId);
    return {
      threadId,
      senderId: user.userId,
      senderRole: "student",
    };
  }

  const existingVisitorKey = req.cookies.get("support_visitor_key")?.value;
  if (!existingVisitorKey && !options.createVisitor) {
    throw new Error("UNAUTHORIZED");
  }

  const visitorKey = getVisitorKey(req);
  const threadId = await getOrCreateVisitorSupportThread(visitorKey);

  return {
    threadId,
    senderId: null,
    senderRole: "visitor",
    visitorKey,
  };
}

async function getExistingChatIdentity(
  req: NextRequest,
): Promise<ChatIdentity | null> {
  const user = await getOptionalUser(req);

  if (user) {
    if (isAdminRole(user.role)) {
      throw new Error("FORBIDDEN");
    }

    const [rows] = await pool.query<ThreadRow[]>(
      "SELECT thread_id FROM support_thread WHERE user_id = ? LIMIT 1",
      [user.userId],
    );

    if (!rows.length) return null;

    return {
      threadId: rows[0].thread_id,
      senderId: user.userId,
      senderRole: "student",
    };
  }

  const visitorKey = req.cookies.get("support_visitor_key")?.value;
  if (!visitorKey || !/^[a-zA-Z0-9-]{20,80}$/.test(visitorKey)) {
    return null;
  }

  const [rows] = await pool.query<ThreadRow[]>(
    "SELECT thread_id FROM support_thread WHERE visitor_key = ? LIMIT 1",
    [visitorKey],
  );

  if (!rows.length) return null;

  return {
    threadId: rows[0].thread_id,
    senderId: null,
    senderRole: "visitor",
    visitorKey,
  };
}

async function getUnreadAdminReplyCount(threadId: number) {
  const [rows] = await pool.query<UnreadReplyCountRow[]>(
    `SELECT COUNT(*) AS unread_count
     FROM support_message sm
     JOIN support_thread st ON st.thread_id = sm.thread_id
     WHERE sm.thread_id = ?
       AND sm.sender_role = 'admin'
       AND sm.deleted_at IS NULL
       AND (
         st.participant_last_opened_at IS NULL
         OR sm.created_at > st.participant_last_opened_at
       )`,
    [threadId],
  );

  return Number(rows[0]?.unread_count ?? 0);
}

async function markParticipantOpened(threadId: number) {
  await pool.query(
    "UPDATE support_thread SET participant_last_opened_at = NOW() WHERE thread_id = ?",
    [threadId],
  );
}

export async function GET(req: NextRequest) {
  try {
    await ensureSupportChatTables();

    const { searchParams } = new URL(req.url);
    const summaryOnly = searchParams.get("summary") === "1";

    if (summaryOnly) {
      const identity = await getExistingChatIdentity(req);
      const unreadCount = identity
        ? await getUnreadAdminReplyCount(identity.threadId)
        : 0;

      return attachVisitorCookie(
        NextResponse.json({ success: true, unreadCount }),
        identity?.visitorKey,
      );
    }

    const identity = await getChatIdentity(req, { createVisitor: true });
    await markParticipantOpened(identity.threadId);
    const messages = await getMessages(identity.threadId);

    return attachVisitorCookie(NextResponse.json({
      success: true,
      thread: { thread_id: identity.threadId },
      messages,
    }), identity.visitorKey);
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

    const identity = await getChatIdentity(req, { createVisitor: true });

    await pool.query(
      `INSERT INTO support_message (thread_id, sender_id, sender_role, body)
      VALUES (?, ?, ?, ?)`,
      [identity.threadId, identity.senderId, identity.senderRole, message],
    );

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW(), status = 'open' WHERE thread_id = ?",
      [identity.threadId],
    );

    await markParticipantOpened(identity.threadId);
    const messages = await getMessages(identity.threadId);

    return attachVisitorCookie(NextResponse.json({
      success: true,
      thread: { thread_id: identity.threadId },
      messages,
    }), identity.visitorKey);
  } catch (error: unknown) {
    console.error("POST SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    await ensureSupportChatTables();

    const identity = await getChatIdentity(req, { createVisitor: false });
    const body = await req.json();
    const messageId = Number(body?.messageId);
    const message = String(body?.message || "").trim();

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
         AND sender_role = ?
         AND deleted_at IS NULL`,
      [message, messageId, identity.threadId, identity.senderRole],
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW() WHERE thread_id = ?",
      [identity.threadId],
    );

    await markParticipantOpened(identity.threadId);
    const messages = await getMessages(identity.threadId);

    return attachVisitorCookie(NextResponse.json({
      success: true,
      thread: { thread_id: identity.threadId },
      messages,
    }), identity.visitorKey);
  } catch (error: unknown) {
    console.error("PATCH SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    await ensureSupportChatTables();

    const identity = await getChatIdentity(req, { createVisitor: false });
    const { searchParams } = new URL(req.url);
    const messageId = Number(searchParams.get("messageId") || 0);

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
         AND sender_role = ?
         AND deleted_at IS NULL`,
      [messageId, identity.threadId, identity.senderRole],
    );

    if (!result.affectedRows) {
      return NextResponse.json(
        { success: false, message: "Message not found" },
        { status: 404 },
      );
    }

    await pool.query(
      "UPDATE support_thread SET last_message_at = NOW() WHERE thread_id = ?",
      [identity.threadId],
    );

    await markParticipantOpened(identity.threadId);
    const messages = await getMessages(identity.threadId);

    return attachVisitorCookie(NextResponse.json({
      success: true,
      thread: { thread_id: identity.threadId },
      messages,
    }), identity.visitorKey);
  } catch (error: unknown) {
    console.error("DELETE SUPPORT CHAT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "UNAUTHORIZED" },
      { status: 401 },
    );
  }
}
