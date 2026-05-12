"use client";

// Renders the reusable LoginForm UI component.
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

export default function LoginForm() {
  const router = useRouter();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          remember,
        }),
         credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Login failed");
        return;
      }

      await refresh();
      router.replace(isAdminRole(data.user?.role) ? "/admin" : "/");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white px-4 py-6 shadow-lg sm:px-6">
      <h1 className="text-center text-2xl font-semibold text-[#111827]">
        Login
      </h1>

      <p className="mt-1 text-center text-sm text-gray-500">
        Log in to continue
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {errorMsg && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 text-center">
            {errorMsg}
          </div>
        )}

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
            required
            className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#111827]">
            Password
          </label>
          <input
            type="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
          />
        </div>

        <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 accent-[#6155F5]"
            />
            Remember me
          </label>

          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#6155F5] text-white text-sm font-medium shadow-md hover:bg-[#503fdc] disabled:opacity-60"
        >
          {loading ? "Logging in..." : "Log in"}
        </button>

        <p className="text-center text-sm text-gray-500">
          No account?{" "}
          <Link href="/signup" className="text-[#6155F5] hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
}
