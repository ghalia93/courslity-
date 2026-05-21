"use client";

// Floating student support chat connected to the admin dashboard inbox.
import { useCallback, useEffect, useRef, useState } from "react";
import { Check, MessageCircle, Pencil, Send, Trash2, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

type ChatMessage = {
  message_id: number;
  sender_role: "student" | "visitor" | "admin";
  body: string;
  created_at: string;
  edited?: 0 | 1;
};

export default function SupportChatWidget() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");
  const [unreadReplyCount, setUnreadReplyCount] = useState(0);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const adminUser = Boolean(user && isAdminRole(user.role));

  const loadMessages = useCallback(async () => {
    if (adminUser) return;

    try {
      setError("");
      const res = await fetch("/api/support/chat", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load chat");
      }

      setMessages(data.messages ?? []);
      setUnreadReplyCount(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    }
  }, [adminUser]);

  const loadChatSummary = useCallback(async () => {
    if (loading || adminUser) {
      setUnreadReplyCount(0);
      return;
    }

    try {
      const res = await fetch("/api/support/chat?summary=1", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        setUnreadReplyCount(0);
        return;
      }

      setUnreadReplyCount(Number(data.unreadCount || 0));
    } catch {
      setUnreadReplyCount(0);
    }
  }, [adminUser, loading]);

  useEffect(() => {
    const initialTimeoutId = window.setTimeout(loadChatSummary, 0);

    if (loading || adminUser) {
      return () => window.clearTimeout(initialTimeoutId);
    }

    const intervalId = window.setInterval(loadChatSummary, 10000);
    window.addEventListener("focus", loadChatSummary);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadChatSummary);
    };
  }, [adminUser, loadChatSummary, loading]);

  useEffect(() => {
    if (!open) return;

    loadMessages();
    const intervalId = window.setInterval(loadMessages, 10000);
    return () => window.clearInterval(intervalId);
  }, [loadMessages, open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  async function sendMessage() {
    const message = draft.trim();
    if (!message || sending) return;

    try {
      setSending(true);
      setError("");

      const res = await fetch("/api/support/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send message");
      }

      setDraft("");
      setMessages(data.messages ?? []);
      setUnreadReplyCount(0);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  function startEditing(message: ChatMessage) {
    setEditingMessageId(message.message_id);
    setEditingDraft(message.body);
  }

  function cancelEditing() {
    setEditingMessageId(null);
    setEditingDraft("");
  }

  async function saveEdit() {
    const message = editingDraft.trim();
    if (!editingMessageId || !message || savingEdit) return;

    try {
      setSavingEdit(true);
      setError("");

      const res = await fetch("/api/support/chat", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messageId: editingMessageId, message }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to edit message");
      }

      setMessages(data.messages ?? []);
      setUnreadReplyCount(0);
      cancelEditing();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to edit message");
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteMessage(messageId: number) {
    if (deletingMessageId) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      setDeletingMessageId(messageId);
      setError("");

      const params = new URLSearchParams({ messageId: String(messageId) });
      const res = await fetch(`/api/support/chat?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete message");
      }

      setMessages(data.messages ?? []);
      setUnreadReplyCount(0);
      if (editingMessageId === messageId) cancelEditing();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  }

  if (loading || adminUser) return null;

  const unreadReplyLabel =
    unreadReplyCount > 99 ? "99+" : String(unreadReplyCount);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[460px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl transition-colors dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-neutral-800">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-neutral-100">
                Chat with admin
              </p>
              <p className="text-xs text-gray-400 dark:text-neutral-500">
                We will reply here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 dark:text-neutral-500 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div className="max-w-[85%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:bg-neutral-800 dark:text-neutral-200">
              Hi! Send your question and an admin will help you from the
              dashboard.
            </div>

            {messages.map((message) => {
              const mine = message.sender_role !== "admin";
              const editing = editingMessageId === message.message_id;
              return (
                <div
                  key={message.message_id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      mine
                        ? "bg-[#6155F5] text-white"
                        : "bg-gray-100 text-gray-700 dark:bg-neutral-800 dark:text-neutral-200"
                    }`}
                  >
                    {editing ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingDraft}
                          onChange={(e) => setEditingDraft(e.target.value)}
                          className="min-h-[74px] w-full resize-none rounded-lg border border-white/40 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/70"
                        />
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/15 hover:bg-white/25"
                            title="Cancel edit"
                            aria-label="Cancel edit"
                          >
                            <X size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={saveEdit}
                            disabled={savingEdit || !editingDraft.trim()}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-white/20 hover:bg-white/30 disabled:opacity-50"
                            title="Save edit"
                            aria-label="Save edit"
                          >
                            <Check size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap">{message.body}</p>
                        <div
                          className={`mt-1 flex items-center justify-between gap-2 text-[10px] ${
                            mine ? "text-white/70" : "text-gray-400 dark:text-neutral-500"
                          }`}
                        >
                          <span>
                            {message.created_at}
                            {message.edited ? " (Edited)" : ""}
                          </span>
                          {mine && (
                            <span className="flex shrink-0 items-center gap-1">
                              <button
                                type="button"
                                onClick={() => startEditing(message)}
                                className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/20"
                                title="Edit message"
                                aria-label="Edit message"
                              >
                                <Pencil size={11} />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMessage(message.message_id)}
                                disabled={deletingMessageId === message.message_id}
                                className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/20 disabled:opacity-50"
                                title="Delete message"
                                aria-label="Delete message"
                              >
                                <Trash2 size={11} />
                              </button>
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
              {error}
            </p>
          )}

          <div className="flex gap-2 border-t border-gray-100 p-3 dark:border-neutral-800">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type your message..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-400 focus:ring-2 focus:ring-[#6155F5] dark:border-neutral-700 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500"
            />
            <button
              type="button"
              onClick={sendMessage}
              disabled={sending || !draft.trim()}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#6155F5] text-white disabled:opacity-50"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="relative inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#6155F5] text-sm font-semibold text-white shadow-lg hover:bg-[#503fdc] sm:w-auto sm:gap-2 sm:px-4"
        aria-label="Chat"
      >
        <MessageCircle size={18} />
        <span className="hidden sm:inline">Chat</span>
        {!open && unreadReplyCount > 0 && (
          <span className="absolute -right-1.5 -top-1.5 inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-5 text-white ring-2 ring-white dark:ring-neutral-950">
            {unreadReplyLabel}
          </span>
        )}
      </button>
    </div>
  );
}
