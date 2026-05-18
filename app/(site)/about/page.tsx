"use client";

// Renders the site about page.
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import HowItWorks from "@/components/HowItWorks";
import StatsSection from "@/components/StatsSection";
import Link from "next/link";

type StatsApiResponse = {
  totalReviews: number;
  totalStudents: number;
  totalUniversities: number;
  wouldRecommendPercentage: number;
};

export default function AboutPage() {
  const [statsData, setStatsData] = useState<StatsApiResponse>({
    totalReviews: 0,
    totalStudents: 0,
    totalUniversities: 0,
    wouldRecommendPercentage: 0,
  });

  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      try {
        setLoadingStats(true);
        setStatsError(null);

        const res = await fetch("/api/stats", { method: "GET" });
        if (!res.ok) {
          const txt = await res.text();
          throw new Error(txt || `Request failed: ${res.status}`);
        }

        const data: StatsApiResponse = await res.json();

        if (!cancelled) {
          setStatsData({
            totalReviews: Number(data.totalReviews || 0),
            totalStudents: Number(data.totalStudents || 0),
            totalUniversities: Number(data.totalUniversities || 0),
            wouldRecommendPercentage: Number(data.wouldRecommendPercentage || 0),
          });
        }
      } catch (e: unknown) {
        console.error(e);
        if (!cancelled) {
          setStatsError(
            e instanceof Error ? e.message : "Failed to fetch stats",
          );
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }

    loadStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <main className="bg-[#FFFFFF]">
      <section className="px-4 py-16 pt-20 sm:px-6 sm:pt-28 md:pt-36">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="mb-5 text-4xl font-bold tracking-tight text-[#111827] sm:text-5xl lg:text-6xl">
            Making Course Selection{" "}
            <span className="bg-gradient-to-r from-[#6155F5] to-teal-500 bg-clip-text text-transparent">
              Transparent
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg md:text-xl">
            We believe every student deserves honest insights into their courses
            before committing. Coursality brings transparency to higher
            education through authentic peer reviews.
          </p>
        </div>
      </section>

      <section className="mx-auto mt-0 max-w-5xl space-y-6 px-4 py-12 sm:px-6 sm:py-16">
        <div className="rounded-xl p-4 transition-shadow hover:shadow-lg sm:p-6">
          <h2 className="text-xl font-semibold mb-4">The Problem We Solve</h2>
          <p className="text-gray-700 leading-7 mb-3">
            Selecting courses can be overwhelming. Students often lack clear
            insights into workload, grading fairness, and exam difficulty.
          </p>
          <ul className="list-disc pl-5 space-y-2 text-gray-700 leading-7">
            <li>Unclear exam difficulty and time commitments</li>
            <li>Limited information on grading and teaching quality</li>
            <li>Few practical tips from past students</li>
          </ul>
        </div>

        <div className="rounded-xl p-4 transition-shadow hover:shadow-lg sm:p-6">
          <h2 className="text-xl font-semibold">Our Mission</h2>
          <p className="text-gray-700 leading-7">
            At Coursality, our mission is to make course selection transparent
            and stress-free. We provide honest, unfiltered student reviews so
            you can make informed decisions about workload, grading, and
            teaching quality - no surprises, no guesswork.
          </p>
        </div>

        <HowItWorks />

        <div className="rounded-xl p-4 transition-shadow hover:shadow-lg sm:p-8">
          <h2 className="text-xl font-semibold mb-4">What Makes Us Different</h2>

          <p className="text-gray-700 mb-6 leading-7">
            We&apos;ve built features that prioritize honesty, utility, and
            student privacy.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
            <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-start transition-shadow hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#6155F5] mb-3"
                fill="currentColor"
                viewBox="0 0 28 28"
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25v-3a3.75 3.75 0 1 0-7.5 0v3h7.5Z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">100% Anonymous</h3>
              <p className="text-gray-700 text-sm leading-6">
                Your feedback is completely private, ensuring honest and
                authentic reviews.
              </p>
            </div>

            <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-start transition-shadow hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#6155F5]"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
              </svg>

              <h3 className="text-lg font-semibold mb-2">Verified Students</h3>
              <p className="text-gray-700 text-sm leading-6">
                All reviews come from real students to ensure authenticity and
                trust.
              </p>
            </div>

            <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-start transition-shadow hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#6155F5] mb-3"
                fill="currentColor"
                viewBox="0 0 28 28"
              >
                <path
                  fillRule="evenodd"
                  d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Detailed Ratings</h3>
              <p className="text-gray-700 text-sm leading-6">
                Evaluate workload, exams, grading, and attendance in depth.
              </p>
            </div>

            <div className="rounded-lg p-4 bg-gray-50 flex flex-col items-start transition-shadow hover:shadow-md">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-[#6155F5] mb-3"
                fill="currentColor"
                viewBox="0 0 28 28"
              >
                <path
                  fillRule="evenodd"
                  d="M3.792 2.938A49.069 49.069 0 0 1 12 2.25c2.797 0 5.54.236 8.209.688a1.857 1.857 0 0 1 1.541 1.836v1.044a3 3 0 0 1-.879 2.121l-6.182 6.182a1.5 1.5 0 0 0-.439 1.061v2.927a3 3 0 0 1-1.658 2.684l-1.757.878A.75.75 0 0 1 9.75 21v-5.818a1.5 1.5 0 0 0-.44-1.06L3.13 7.938a3 3 0 0 1-.879-2.121V4.774c0-.897.64-1.683 1.542-1.836Z"
                  clipRule="evenodd"
                />
              </svg>
              <h3 className="text-lg font-semibold mb-2">Smart Filters</h3>
              <p className="text-gray-700 text-sm leading-6">
                Filter courses by university, department, major, language,
                level, year, and semester, then sort reviews by date, votes,
                and rating signals.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        {statsError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Failed to load statistics: {statsError}
          </div>
        ) : loadingStats ? (
          <div className="text-center py-10 text-gray-400 text-sm">
            Loading statistics...
          </div>
        ) : (
          <StatsSection
             stats={{
             reviews: statsData.totalReviews,
             students: statsData.totalStudents,
             universities: statsData.totalUniversities,
             rating: statsData.wouldRecommendPercentage, 
            }}
          />
        )}

        <div className="text-center pt-10">
          <h2 className="mb-2 text-2xl font-bold sm:text-3xl">
            Start Making Better Course Decisions
          </h2>
          <p className="text-gray-600 mb-6">
            Join thousands of students who use Coursality to navigate their
            academic journey with confidence.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/courses">
              <Button className="h-11">Browse Courses</Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
