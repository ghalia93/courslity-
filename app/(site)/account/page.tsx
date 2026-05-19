"use client";

// Renders the site account page.
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import { useToast } from "@/components/toast/Toastprovider";
import { useAuth } from "@/context/AuthContext";
import {
  buildEmailWithDomain,
  getEmailLocalPart,
  getExpectedUniversityDomain,
} from "@/lib/universityEmail";

interface Profile {
  user_id: number;
  full_name: string;
  email: string;
  university_id: number | null;
  university_name: string | null;
  email_domain: string | null;
}

interface University {
  university_id: number;
  name: string;
  email_domain?: string | null;
}

export default function AccountPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [universityId, setUniversityId] = useState<number | "">("");
  const [emailLocalPart, setEmailLocalPart] = useState("");

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
        const [profileRes, universitiesRes] = await Promise.all([
          fetch("/api/profile"),
          fetch("/api/universities"),
        ]);
        const data = await profileRes.json();

        if (!profileRes.ok) throw new Error("Unauthorized");

        const loadedProfile = data.data as Profile;
        setProfile(loadedProfile);
        setFullName(loadedProfile.full_name);
        setUniversityId(loadedProfile.university_id ?? "");
        setEmailLocalPart(getEmailLocalPart(loadedProfile.email));

        if (universitiesRes.ok) {
          const universitiesData = (await universitiesRes.json()) as University[];
          setUniversities(universitiesData);
        }
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

  const selectedUniversity =
    universityId !== ""
      ? universities.find((uni) => uni.university_id === universityId) ??
        (profile?.university_id === universityId
          ? {
              university_id: profile.university_id,
              name: profile.university_name ?? "",
              email_domain: profile.email_domain,
            }
          : null)
      : null;
  const expectedDomain = getExpectedUniversityDomain(selectedUniversity);
  const profileEmail = expectedDomain
    ? buildEmailWithDomain(emailLocalPart, expectedDomain)
    : emailLocalPart.trim().toLowerCase();
  const hasProfileChanges = Boolean(
    profile &&
      (fullName.trim() !== profile.full_name ||
        profileEmail !== profile.email ||
        universityId !== (profile.university_id ?? "")),
  );

  const handleProfileSave = async () => {
    if (!fullName.trim()) {
      toast("Please enter your name.", "error");
      return;
    }

    if (universityId === "") {
      toast("Please select your university.", "error");
      return;
    }

    if (!profileEmail) {
      toast("Please enter your university email name or ID.", "error");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: profileEmail,
          universityId,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Could not update profile");
      }

      const updatedProfile = data.data as Profile;
      setProfile(updatedProfile);
      setFullName(updatedProfile.full_name);
      setUniversityId(updatedProfile.university_id ?? "");
      setEmailLocalPart(getEmailLocalPart(updatedProfile.email));
      await refresh();
      toast("Profile updated.", "success");
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.";
      toast(message, "error");
    } finally {
      setSavingProfile(false);
    }
  };

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

      // Full reload Full reload to reset auth state everywhere
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
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-10 sm:py-12">
      <h1 className="mb-8 text-center text-2xl font-semibold text-gray-800 sm:text-3xl">
        Account Info
      </h1>

      <section className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6">
        <h2 className="text-xl font-medium mb-6 text-gray-700">Profile</h2>

        <div className="flex flex-col gap-5">
          <label className="flex flex-col text-gray-600">
            Full Name
            <input
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              disabled={savingProfile}
              className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30 disabled:bg-gray-100"
            />
          </label>

          <label className="flex flex-col text-gray-600">
            University
            <select
              value={universityId}
              onChange={(event) =>
                setUniversityId(
                  event.target.value === "" ? "" : Number(event.target.value),
                )
              }
              disabled={savingProfile || universities.length === 0}
              className="mt-2 rounded-lg border border-gray-300 px-3 py-2 text-gray-900 outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30 disabled:bg-gray-100"
            >
              <option value="" disabled>
                Select your university
              </option>
              {universities.map((uni) => (
                <option key={uni.university_id} value={uni.university_id}>
                  {uni.name}
                </option>
              ))}
            </select>
          </label>

          <label className="flex flex-col text-gray-600">
            Email
            <div className="mt-2 flex min-h-10 w-full items-center overflow-hidden rounded-lg border border-gray-300 px-3 py-2 text-gray-900 focus-within:border-[#6155F5] focus-within:ring-2 focus-within:ring-[#6155F5]/30">
              <input
                type="text"
                value={emailLocalPart}
                onChange={(event) =>
                  setEmailLocalPart(getEmailLocalPart(event.target.value))
                }
                disabled={savingProfile}
                placeholder="student ID or email name"
                className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400 disabled:bg-transparent"
              />
              {expectedDomain && (
                <span className="shrink-0 pl-2 text-xs font-medium text-[#6155F5] sm:text-sm">
                  @{expectedDomain}
                </span>
              )}
            </div>
            {profileEmail && (
              <span className="mt-1 text-xs text-gray-400">
                Current email after save:{" "}
                <span className="font-medium text-gray-600">
                  {profileEmail}
                </span>
              </span>
            )}
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Button
              variant="primary"
              className="flex-1 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={handleProfileSave}
              disabled={savingProfile || !hasProfileChanges}
            >
              {savingProfile ? "Saving..." : "Save"}
            </Button>

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
        className="mt-10 w-full max-w-md rounded-xl border border-gray-200 bg-white p-4 shadow-lg sm:p-6"
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
            className="w-full disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {reportLoading ? "Submitting..." : "Submit"}
          </Button>
        </div>
      </section>
    </div>
  );
}
