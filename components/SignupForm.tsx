"use client";

// Renders the reusable SignupForm UI component.
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  buildEmailWithDomain,
  getEmailLocalPart,
  getExpectedUniversityDomain,
} from "@/lib/universityEmail";

type University = {
  university_id: number;
  name: string;
  email_domain?: string; // may or may not come from the API
};

export default function SignupForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [emailLocalPart, setEmailLocalPart] = useState("");
  const [password, setPassword] = useState("");
  const [universityId, setUniversityId] = useState<number | "">("");

  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [universitiesError, setUniversitiesError] = useState<string | null>(
    null,
  );

  // Fetch universities on mount
  useEffect(() => {
    async function fetchUniversities() {
      try {
        setLoadingUniversities(true);
        setUniversitiesError(null);
        const res = await fetch("/api/universities");
        if (!res.ok) throw new Error("Failed to load universities");
        const data: University[] = await res.json();
        setUniversities(data);
      } catch (error) {
        console.error("Could not load universities:", error);
        setUniversitiesError("Could not load universities. Please refresh.");
      } finally {
        setLoadingUniversities(false);
      }
    }
    fetchUniversities();
  }, []);

  // -- Submit ---
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMsg(null);

    if (!expectedDomainHint) {
      setErrorMsg("Please select a university with an email domain.");
      return;
    }

    if (!normalizedEmail) {
      setErrorMsg("Please enter your university email name or ID.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: fullName.trim(),
          email: normalizedEmail,
          password,
          universityId: universityId || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.message || "Signup failed");
        return;
      }

      router.push("/login");
    } catch {
      setErrorMsg("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  // -- Derived display values ---
  const selectedUni =
    universityId !== ""
      ? universities.find((u) => u.university_id === universityId)
      : null;

  // Show the hint even before the API responds, using the fallback map
  const expectedDomainHint: string | null = selectedUni
    ? getExpectedUniversityDomain(selectedUni)
    : universityId !== ""
      ? null // university selected but list hasn't loaded yet
      : null;
  const normalizedEmail = expectedDomainHint
    ? buildEmailWithDomain(emailLocalPart, expectedDomainHint)
    : emailLocalPart.trim().toLowerCase();

  // -- Render ---
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-gray-200 bg-white px-4 py-6 shadow-lg sm:px-6">
      <h1 className="text-center text-2xl font-semibold text-[#111827]">
        Sign up
      </h1>
      <p className="mt-1 text-center text-sm text-gray-500">
        Create an account to continue
      </p>

      <form onSubmit={handleSubmit} className="mt-5 space-y-4">
        {/* Server-side error */}
        {errorMsg && (
          <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2 text-center">
            {errorMsg}
          </div>
        )}

        {/* Full Name */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#111827]">
            Full name
          </label>
          <input
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your name"
            autoComplete="name"
            className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
          />
        </div>

        {/* University - placed before email so the domain hint is visible before typing */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#111827]">
            University
          </label>
          <select
            required
            value={universityId}
            onChange={(e) => {
              const id = e.target.value === "" ? "" : Number(e.target.value);
              setUniversityId(id);
            }}
            disabled={loadingUniversities}
            className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
          >
            <option value="" disabled>
              {loadingUniversities ? "Loading universities..." : "Select your university"}
            </option>
            {universities.map((uni) => (
              <option key={uni.university_id} value={uni.university_id}>
                {uni.name}
              </option>
            ))}
          </select>

          {universitiesError && (
            <p className="text-xs text-red-500 pl-1">{universitiesError}</p>
          )}

          {/* Domain hint - shows as soon as a university is selected */}
          {universityId !== "" && expectedDomainHint && (
            <p className="text-xs text-gray-400 pl-1">
              Email will end with{" "}
              <span className="font-medium text-[#6155F5]">
                @{expectedDomainHint}
              </span>
            </p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#111827]">
            Email
          </label>
          <div className="flex h-11 w-full items-center overflow-hidden rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 transition-colors focus-within:bg-white focus-within:ring-2 focus-within:ring-[#6155F5]/40">
            <input
              required
              type="text"
              value={emailLocalPart}
              onChange={(e) => setEmailLocalPart(getEmailLocalPart(e.target.value))}
              placeholder="student ID or email name"
              autoComplete="username"
              className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-gray-400"
            />
            {expectedDomainHint && (
              <span className="shrink-0 pl-2 text-xs font-medium text-[#6155F5] sm:text-sm">
                @{expectedDomainHint}
              </span>
            )}
          </div>
          {normalizedEmail && (
            <p className="text-xs text-gray-400 pl-1">
              Signup email:{" "}
              <span className="font-medium text-gray-600">
                {normalizedEmail}
              </span>
            </p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-[#111827]">
            Password
          </label>
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            autoComplete="new-password"
            className="w-full h-11 rounded-full border border-gray-200 bg-[#EEF4FF] px-4 text-sm text-gray-900 outline-none focus:bg-white focus:ring-2 focus:ring-[#6155F5]/40"
          />
          <p className="text-xs text-gray-400 pl-1">
            Min. 8 characters, one number, one special character
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-lg bg-[#6155F5] text-white text-sm font-medium shadow-md hover:bg-[#503fdc] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Creating account..." : "Sign up"}
        </button>

        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="text-[#6155F5] hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </div>
  );
}
