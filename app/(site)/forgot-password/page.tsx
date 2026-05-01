"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, Clipboard, ExternalLink } from "lucide-react";

type ForgotPasswordResponse = {
  success: boolean;
  emailSent?: boolean;
  resetUrl?: string;
  message?: string;
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [resetUrl, setResetUrl] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setResetUrl("");
      setCopied(false);
      setLoading(true);

      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = (await res.json().catch(() => null)) as
        | ForgotPasswordResponse
        | null;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Request failed");
      }

      setMessage(data.message || "");
      setResetUrl(data.resetUrl || "");
      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  async function copyResetLink() {
    if (!resetUrl) return;

    try {
      await navigator.clipboard.writeText(resetUrl);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the link and copy it manually.");
    }
  }

  return (
    <div className="flex min-h-screen items-start justify-center px-6 pt-32">
      <div className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white px-6 py-6 shadow-lg">
        {success ? (
          <>
            <h1 className="text-center text-2xl font-semibold text-[#111827]">
              Check Your Email
            </h1>

            <p className="mt-2 text-center text-sm text-gray-500">
              If an account exists for
            </p>

            <p className="mt-1 text-center text-sm font-medium text-[#111827]">
              {email}
            </p>

            <p className="mt-2 text-center text-sm text-gray-500">
              {message || "You will receive a password reset link shortly."}
            </p>

            {resetUrl && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-left">
                <p className="text-xs font-medium text-amber-800">
                  Local reset link
                </p>
                <input
                  readOnly
                  value={resetUrl}
                  className="mt-2 h-10 w-full rounded-md border border-amber-200 bg-white px-3 text-xs text-gray-700 outline-none"
                />
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={copyResetLink}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md border border-amber-300 bg-white px-3 text-sm font-medium text-amber-800 transition hover:bg-amber-100"
                  >
                    <Clipboard size={15} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                  <a
                    href={resetUrl}
                    className="inline-flex h-9 flex-1 items-center justify-center gap-2 rounded-md bg-[#6155F5] px-3 text-sm font-medium text-white transition hover:bg-[#503fdc]"
                  >
                    <ExternalLink size={15} />
                    Open
                  </a>
                </div>
              </div>
            )}

            <div className="mt-5">
              <Link
                href="/login"
                className="block text-center text-sm text-[#6155F5] hover:underline"
              >
                Back to login
              </Link>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold text-[#111827]">
              Forgot your password?
            </h1>

            <p className="mt-1 text-center text-sm text-gray-500">
              Enter your email to receive a password reset link.
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111827]">
                  Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="your.email@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 w-full rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="h-11 w-full rounded-lg bg-[#6155F5] text-sm font-medium text-white shadow-md hover:bg-[#503fdc] active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>

              <p className="text-center text-sm">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-gray-500 transition hover:text-[#6155F5]"
                >
                  <span>
                    <ArrowLeft className="h-4 w-4" />
                  </span>
                  Back to login
                </Link>
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
