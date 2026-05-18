"use client";

// Floating student support chat connected to the admin dashboard inbox.
import { useCallback, useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

type ChatMessage = {
  message_id: number;
  sender_role: "student" | "admin";
  body: string;
  created_at: string;
};

export default function SupportChatWidget() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  const loadMessages = useCallback(async () => {
    if (!user || isAdminRole(user.role)) return;

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load chat");
    }
  }, [user]);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to send message");
    } finally {
      setSending(false);
    }
  }

  if (loading || !user || isAdminRole(user.role)) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 flex h-[460px] w-[min(360px,calc(100vw-2rem))] flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Chat with admin
              </p>
              <p className="text-xs text-gray-400">We will reply here.</p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
              aria-label="Close chat"
            >
              <X size={17} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-3">
            <div className="max-w-[85%] rounded-xl bg-gray-100 px-3 py-2 text-sm text-gray-700">
              Hi! Send your question and an admin will help you from the
              dashboard.
            </div>

            {messages.map((message) => {
              const mine = message.sender_role === "student";
              return (
                <div
                  key={message.message_id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                      mine
                        ? "bg-[#6155F5] text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{message.body}</p>
                    <p
                      className={`mt-1 text-[10px] ${
                        mine ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {message.created_at}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>

          {error && (
            <p className="border-t border-red-100 bg-red-50 px-4 py-2 text-xs text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-2 border-t border-gray-100 p-3">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              placeholder="Type your message..."
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]"
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
        className="inline-flex h-12 items-center gap-2 rounded-full bg-[#6155F5] px-4 text-sm font-semibold text-white shadow-lg hover:bg-[#503fdc]"
      >
        <MessageCircle size={18} />
        Chat
      </button>
    </div>
  );
}
