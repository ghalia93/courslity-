"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  Clipboard,
  ExternalLink,
  KeyRound,
  Mail,
  ShieldCheck,
} from "lucide-react";

type ResetResponse = {
  success: boolean;
  emailSent?: boolean;
  resetUrl?: string;
  message?: string;
};

type StatusState = {
  type: "success" | "warning" | "error";
  message: string;
} | null;

export default function AdminSettingsPage() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [status, setStatus] = useState<StatusState>(null);
  const [sending, setSending] = useState(false);
  const [copied, setCopied] = useState(false);

  async function sendResetLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setStatus({ type: "error", message: "Enter the user email first." });
      setResetUrl("");
      return;
    }

    setSending(true);
    setCopied(false);
    setStatus(null);
    setResetUrl("");

    try {
      const res = await fetch("/api/admin/settings/password-reset", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      const data = (await res.json().catch(() => null)) as ResetResponse | null;

      if (data?.resetUrl) {
        setResetUrl(data.resetUrl);
      }

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to create reset link.");
      }

      setStatus({
        type: data.emailSent ? "success" : "warning",
        message:
          data.message ||
          (data.emailSent
            ? "Password reset email sent successfully."
            : "Reset link created. Copy it and send it manually."),
      });
    } catch (error: unknown) {
      setStatus({
        type: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create reset link.",
      });
    } finally {
      setSending(false);
    }
  }

  async function copyResetLink() {
    if (!resetUrl) return;

    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
    } catch {
      setStatus({
        type: "error",
        message: "Copy failed. Select the link and copy it manually.",
      });
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="text-sm text-gray-500">
          Manage admin security and account access.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Send Password Reset Link
            </h2>
          </div>

          <form onSubmit={sendResetLink} className="mt-5 space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-500">
                User email
              </label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="student@university.edu"
                  className="h-11 w-full rounded-lg border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
                />
              </div>
            </div>

            {status && (
              <div
                className={`rounded-lg border px-4 py-3 text-sm ${
                  status.type === "success"
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : status.type === "warning"
                      ? "border-amber-200 bg-amber-50 text-amber-800"
                      : "border-red-200 bg-red-50 text-red-700"
                }`}
              >
                {status.message}
              </div>
            )}

            {resetUrl && (
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                <label className="text-xs font-medium text-gray-500">
                  Reset link
                </label>
                <div className="mt-2 flex flex-col gap-2 sm:flex-row">
                  <input
                    readOnly
                    value={resetUrl}
                    className="h-10 min-w-0 flex-1 rounded-md border border-gray-300 bg-white px-3 text-xs text-gray-700 outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyResetLink}
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <Clipboard size={15} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={resetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-700 transition hover:bg-gray-50"
                  >
                    <ExternalLink size={15} />
                    Open
                  </a>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={sending}
              className="inline-flex h-10 items-center justify-center rounded-lg bg-[#6155F5] px-4 text-sm font-medium text-white transition hover:bg-[#4f45d4] disabled:opacity-60"
            >
              {sending ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-emerald-600" />
            <h2 className="text-base font-semibold text-gray-900">
              Account Verification
            </h2>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            User verification, activation, and deactivation are managed from the
            Users page.
          </p>
          <Link
            href="/admin/users"
            className="mt-4 inline-flex h-10 items-center justify-center rounded-lg border border-gray-300 px-4 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Manage Users
          </Link>
        </section>
      </div>
    </div>
  );
}
