"use client";

// Renders the reusable Stats UI component.
import { useEffect, useState } from "react";
import type { HeroStatsResponse } from "@/app/api/hero-stats/route";

const DEFAULTS: HeroStatsResponse = { universities: 0, courses: 0 };

export default function HeroStats() {
  const [stats, setStats] = useState<HeroStatsResponse>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/hero-stats");
        if (!res.ok) return;

        const data = (await res.json()) as Partial<HeroStatsResponse>;
        setStats({
          universities: Number(data.universities ?? DEFAULTS.universities),
          courses: Number(data.courses ?? DEFAULTS.courses),
        });
      } catch (err) {
        console.warn("[HeroStats] Could not load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="mt-12 flex flex-wrap justify-center gap-4 text-sm text-gray-600 sm:mt-16 sm:gap-6">
      <Stat
        loading={loading}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
            className="h-5 w-5 sm:h-6 sm:w-6 text-[#6155F5] shrink-0"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0 0 12 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75Z"
            />
          </svg>
        }
        text={`${stats.universities}+ Universities`}
      />

      <Stat
        loading={false} // static - no API needed
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 sm:h-6 sm:w-6 text-[#6155F5] shrink-0"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12.516 2.17a.75.75 0 0 0-1.032 0 11.209 11.209 0 0 1-7.877 3.08.75.75 0 0 0-.722.515A12.74 12.74 0 0 0 2.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 0 0 .374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 0 0-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08Zm3.094 8.016a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
            />
          </svg>
        }
        text="100% Anonymous"
      />

      <Stat
        loading={loading}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-5 w-5 sm:h-6 sm:w-6 text-[#6155F5] shrink-0"
          >
            <path d="M11.25 4.533A9.707 9.707 0 0 0 6 3a9.735 9.735 0 0 0-3.25.555.75.75 0 0 0-.5.707v14.25a.75.75 0 0 0 1 .707A8.237 8.237 0 0 1 6 18.75c1.995 0 3.823.707 5.25 1.886V4.533ZM12.75 20.636A8.214 8.214 0 0 1 18 18.75c.966 0 1.89.166 2.75.47a.75.75 0 0 0 1-.708V4.262a.75.75 0 0 0-.5-.707A9.735 9.735 0 0 0 18 3a9.707 9.707 0 0 0-5.25 1.533v16.103Z" />
          </svg>
        }
        text={`${Math.floor(stats.courses / 10) * 10}+ Courses`}
      />
    </div>
  );
}

function Stat({
  icon,
  text,
  loading,
}: {
  icon: React.ReactNode;
  text: string;
  loading: boolean;
}) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      {loading ? (
        <span className="h-5 w-28 animate-pulse rounded bg-gray-200" />
      ) : (
        <span className="text-sm sm:text-lg">{text}</span>
      )}
    </div>
  );
}
