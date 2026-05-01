"use client";

import Link from "next/link";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type ResetPasswordResponse = {
  success: boolean;
  message?: string;
};

export default function ResetPasswordPage() {
  const { token } = useParams();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      const resetToken = Array.isArray(token) ? token[0] : token;

      if (!resetToken) {
        throw new Error("Invalid reset link.");
      }

      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: resetToken,
          password,
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | ResetPasswordResponse
        | null;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Reset failed");
      }

      setSuccess(true);
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Invalid or expired reset link.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-start justify-center min-h-screen px-6 pt-24">
      <div className="w-full max-w-[420px] rounded-xl bg-white border border-gray-200 shadow-lg px-6 py-6">
        {success ? (
          <>
            <h1 className="text-center text-2xl font-semibold text-[#111827]">
              Password Reset
            </h1>

            <p className="mt-2 text-center text-sm text-gray-500">
              Your password has been successfully updated.
            </p>

            <div className="mt-5 text-center">
              <button
                onClick={() => router.push("/login")}
                className="text-sm text-[#6155F5] hover:underline"
              >
                Go to login
              </button>
            </div>
          </>
        ) : (
          <>
            <h1 className="text-center text-2xl font-semibold text-[#111827]">
              Reset Password
            </h1>

            <p className="mt-1 text-center text-sm text-gray-500">
              Enter your new password
            </p>

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111827]">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#111827]">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-lg bg-[#6155F5] text-white text-sm font-medium shadow-md hover:bg-[#503fdc] active:scale-[0.99] disabled:opacity-70"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>

              <p className="text-center text-sm text-gray-500">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-gray-500 hover:text-[#6155F5] transition"
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
