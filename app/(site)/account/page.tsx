"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import { useToast } from "@/components/toast/Toastprovider";

interface Profile {
  full_name: string;
  email: string;
  university_name: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const reportRef = useRef<HTMLDivElement | null>(null);
  const [reportRating, setReportRating] = useState(0);
  const [reportMessage, setReportMessage] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  const scrollToReport = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#report") return;
    window.setTimeout(() => {
      reportRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, []);

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/profile");
        const data = await res.json();

        if (!res.ok) throw new Error("Unauthorized");

        setProfile(data.data);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  useEffect(() => {
    window.addEventListener("hashchange", scrollToReport);
    return () => window.removeEventListener("hashchange", scrollToReport);
  }, [scrollToReport]);

  useEffect(() => {
    if (!loading && profile) scrollToReport();
  }, [loading, profile, scrollToReport]);

  const handleDeleteAccount = async () => {
    const confirmed = confirm(
      "Are you sure you want to deactivate your account? Your reviews will stay visible, but you will no longer be able to sign in."
    );

    if (!confirmed) return;

    try {
      const res = await fetch("/api/profile/delete", {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Delete failed");

      alert("Account deactivated successfully.");

      // 🔥 Full reload to reset auth state everywhere
      window.location.href = "/";
    } catch {
      alert("Something went wrong. Please try again.");
    }
  };

  const handleReportSubmit = async () => {
    if (!reportMessage.trim()) {
      toast("Please describe the problem before submitting.", "error");
      return;
    }
    if (reportRating === 0) {
      toast("Please select a rating.", "error");
      return;
    }

    try {
      setReportLoading(true);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "problem",
          rating: reportRating,
          message: reportMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit report");
      }

      toast("Thanks! Your report was submitted.", "success");
      setReportRating(0);
      setReportMessage("");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast(message, "error");
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-12 px-4">
      <h1 className="text-3xl font-semibold mb-8 text-gray-800 text-center">
        Account Info
      </h1>

      <section className="w-full max-w-md rounded-xl bg-white border border-gray-200 p-6 shadow-lg">
        <h2 className="text-xl font-medium mb-6 text-gray-700">Profile</h2>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col text-gray-600">
            Full Name
            <input
              type="text"
              value={profile.full_name}
              disabled
              className="mt-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
            />
          </label>

          <label className="flex flex-col text-gray-600">
            University
            <input
              type="text"
              value={profile.university_name ?? "No university"}
              disabled
              className="mt-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
            />
          </label>

          <label className="flex flex-col text-gray-600">
            Email
            <input
              type="email"
              value={profile.email}
              disabled
              className="mt-2 border border-gray-300 rounded-lg px-3 py-2 bg-gray-100"
            />
          </label>

          <div className="flex gap-3 mt-4">
            <Button
              variant="primary"
              className="flex-1"
              onClick={() => router.push("/forgot-password")}
            >
              Change Password
            </Button>

            <Button
              variant="plain"
              className="flex-1 text-red-600 border border-red-600 hover:bg-red-50 hover:ring-0 focus:ring-0"
              onClick={handleDeleteAccount}
            >
              Deactivate Account
            </Button>
          </div>
        </div>
      </section>

      <section
        className="w-full max-w-md mt-10 rounded-xl bg-white border border-gray-200 p-6 shadow-lg"
      >
        <div id="report" ref={reportRef} className="scroll-mt-24" />
        <h2 className="text-xl font-medium text-gray-700">Report a Problem</h2>
        <p className="mt-2 text-sm text-gray-500">
          Tell us what looks wrong and how it affected you.
        </p>

        <div className="mt-5">
          <p className="text-sm font-medium text-gray-700">Rating</p>
          <p className="text-xs text-gray-500 mt-1">
            1 = bad experience, 5 = great experience
          </p>
          <div className="mt-2">
            <StarRating value={reportRating} onChange={setReportRating} />
          </div>
        </div>

        <textarea
          value={reportMessage}
          onChange={(e) => setReportMessage(e.target.value)}
          placeholder="Describe the problem..."
          className="mt-5 h-32 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
          disabled={reportLoading}
        />

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            onClick={handleReportSubmit}
            disabled={
              reportLoading || !reportMessage.trim() || reportRating === 0
            }
            className="disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {reportLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </section>
    </div>
  );
}
