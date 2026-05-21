"use client";

// Renders the admin support chat inbox.
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, MessageSquare, Pencil, RefreshCw, Send, Trash2, X } from "lucide-react";

type ChatThread = {
  thread_id: number;
  user_id: number;
  full_name: string;
  email: string;
  status: string;
  latest_message_id: number | null;
  latest_message: string | null;
  latest_sender_role: "student" | "visitor" | "admin" | null;
  last_message_at: string;
  is_visitor?: 0 | 1;
  unread?: 0 | 1;
};

type ChatMessage = {
  message_id: number;
  sender_role: "student" | "visitor" | "admin";
  body: string;
  created_at: string;
  edited?: 0 | 1;
};

export default function AdminChatPage() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState("");
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [savingEdit, setSavingEdit] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | null>(
    null,
  );
  const [error, setError] = useState("");

  const selectedThread = useMemo(
    () => threads.find((thread) => thread.thread_id === selectedThreadId),
    [selectedThreadId, threads],
  );

  const loadThreads = useCallback(async () => {
    try {
      setLoadingThreads(true);
      setError("");

      const res = await fetch("/api/admin/support-chat", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load chats");
      }

      const nextThreads = (data.threads ?? []) as ChatThread[];
      setThreads(nextThreads);
      setSelectedThreadId((current) =>
        current && nextThreads.some((thread) => thread.thread_id === current)
          ? current
          : null,
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chats");
      setThreads([]);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  const loadMessages = useCallback(async (threadId: number) => {
    try {
      setLoadingMessages(true);
      setError("");

      const params = new URLSearchParams({ thread_id: String(threadId) });
      const res = await fetch(`/api/admin/support-chat?${params.toString()}`, {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load messages");
      }

      setMessages(data.messages ?? []);
      window.dispatchEvent(new Event("admin-chat-updated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load messages");
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  useEffect(() => {
    if (!selectedThreadId) {
      setMessages([]);
      setDraft("");
      setEditingMessageId(null);
      setEditingDraft("");
      return;
    }

    setEditingMessageId(null);
    setEditingDraft("");
    loadMessages(selectedThreadId).then(() => loadThreads());
    const intervalId = window.setInterval(() => {
      loadMessages(selectedThreadId);
      loadThreads();
    }, 10000);

    return () => window.clearInterval(intervalId);
  }, [loadMessages, loadThreads, selectedThreadId]);

  async function sendReply() {
    const message = draft.trim();
    if (!selectedThreadId || !message || sending) return;

    try {
      setSending(true);
      setError("");

      const res = await fetch("/api/admin/support-chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ threadId: selectedThreadId, message }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to send reply");
      }

      setDraft("");
      setMessages(data.messages ?? []);
      loadThreads();
      window.dispatchEvent(new Event("admin-chat-updated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send reply");
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
    if (!selectedThreadId || !editingMessageId || !message || savingEdit) {
      return;
    }

    try {
      setSavingEdit(true);
      setError("");

      const res = await fetch("/api/admin/support-chat", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: selectedThreadId,
          messageId: editingMessageId,
          message,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to edit message");
      }

      setMessages(data.messages ?? []);
      cancelEditing();
      loadThreads();
      window.dispatchEvent(new Event("admin-chat-updated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to edit message");
    } finally {
      setSavingEdit(false);
    }
  }

  async function deleteMessage(messageId: number) {
    if (!selectedThreadId || deletingMessageId) return;
    if (!window.confirm("Delete this message?")) return;

    try {
      setDeletingMessageId(messageId);
      setError("");

      const params = new URLSearchParams({
        threadId: String(selectedThreadId),
        messageId: String(messageId),
      });
      const res = await fetch(`/api/admin/support-chat?${params.toString()}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete message");
      }

      setMessages(data.messages ?? []);
      if (editingMessageId === messageId) cancelEditing();
      loadThreads();
      window.dispatchEvent(new Event("admin-chat-updated"));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete message");
    } finally {
      setDeletingMessageId(null);
    }
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Student and Visitor Chat
          </h1>
          <p className="text-sm text-gray-500">
            Reply to registered students and anonymous visitors from the website chat.
          </p>
        </div>

        <button
          type="button"
          onClick={loadThreads}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-gray-300 px-3 text-sm text-gray-700 hover:bg-gray-50"
        >
          <RefreshCw size={15} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5 grid min-h-[620px] grid-cols-1 overflow-hidden rounded-xl border border-gray-200 bg-white lg:grid-cols-[340px_1fr]">
        <aside className="border-b border-gray-200 lg:border-b-0 lg:border-r">
          <div className="border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">Conversations</p>
            <p className="text-xs text-gray-400">
              {threads.length} active thread{threads.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="max-h-[260px] overflow-y-auto lg:max-h-[560px]">
            {loadingThreads ? (
              <p className="p-4 text-sm text-gray-400">Loading chats...</p>
            ) : threads.length === 0 ? (
              <p className="p-4 text-sm text-gray-400">
                No student chats yet.
              </p>
            ) : (
              threads.map((thread) => (
                <button
                  key={thread.thread_id}
                  type="button"
                  onClick={() => setSelectedThreadId(thread.thread_id)}
                  className={`block w-full border-b border-gray-100 px-4 py-3 text-left transition ${
                    selectedThreadId === thread.thread_id
                      ? "bg-[#F4F3FF]"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-gray-900">
                      {thread.full_name}
                    </p>
                    <span className="shrink-0 text-[11px] text-gray-400">
                      {thread.last_message_at}
                    </span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-gray-400">
                    {thread.email}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                    {thread.latest_message || "No messages yet"}
                  </p>
                  {thread.latest_sender_role &&
                    thread.latest_sender_role !== "admin" && (
                      <span
                        className={`mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-semibold ${
                          thread.unread
                            ? "bg-red-50 text-red-600"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {thread.unread
                          ? "New message"
                          : "Waiting for your answer"}
                      </span>
                    )}
                </button>
              ))
            )}
          </div>
        </aside>

        <section className="flex min-h-[520px] flex-col">
          {selectedThread ? (
            <>
              <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900">
                    {selectedThread.full_name}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {selectedThread.email}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedThreadId(null)}
                  className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 px-2.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  <X size={13} />
                  Close chat
                </button>
              </div>

              <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {loadingMessages ? (
                  <p className="text-sm text-gray-400">Loading messages...</p>
                ) : messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-center text-sm text-gray-400">
                    <div>
                      <MessageSquare className="mx-auto mb-2 h-8 w-8" />
                      No messages in this chat yet.
                    </div>
                  </div>
                ) : (
                  messages.map((message) => {
                    const mine = message.sender_role === "admin";
                    const editing = editingMessageId === message.message_id;
                    return (
                      <div
                        key={message.message_id}
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                            mine
                              ? "bg-[#6155F5] text-white"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {editing ? (
                            <div className="space-y-2">
                              <textarea
                                value={editingDraft}
                                onChange={(e) =>
                                  setEditingDraft(e.target.value)
                                }
                                className="min-h-[78px] w-full resize-none rounded-lg border border-white/40 bg-white px-2 py-1 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-white/70"
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
                                  mine ? "text-white/70" : "text-gray-400"
                                }`}
                              >
                                <span>
                                  {message.created_at}
                                  {message.edited ? " (Edited)" : ""}
                                </span>
                                <span className="flex shrink-0 items-center gap-1">
                                  {mine && (
                                    <button
                                      type="button"
                                      onClick={() => startEditing(message)}
                                      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/20"
                                      title="Edit message"
                                      aria-label="Edit message"
                                    >
                                      <Pencil size={11} />
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() =>
                                      deleteMessage(message.message_id)
                                    }
                                    disabled={
                                      deletingMessageId === message.message_id
                                    }
                                    className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/20 disabled:opacity-50"
                                    title="Delete message"
                                    aria-label="Delete message"
                                  >
                                    <Trash2 size={11} />
                                  </button>
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex gap-2 border-t border-gray-100 p-4">
                <input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendReply();
                  }}
                  placeholder="Reply to student..."
                  className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]"
                />
                <button
                  type="button"
                  onClick={sendReply}
                  disabled={sending || !draft.trim()}
                  className="inline-flex h-10 items-center gap-2 rounded-lg bg-[#6155F5] px-4 text-sm font-medium text-white disabled:opacity-50"
                >
                  <Send size={15} />
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center text-sm text-gray-400">
              Select a conversation.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
