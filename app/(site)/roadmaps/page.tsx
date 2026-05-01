"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BookOpen, Building2, GraduationCap, RotateCcw } from "lucide-react";
import { formatCourseLevel } from "@/lib/courseLevels";
import { formatRoadmapSemester } from "@/lib/roadmapOptions";
import type {
  RoadmapDepartmentOption,
  RoadmapSummary,
  RoadmapUniversityOption,
} from "@/types/roadmap";

type RoadmapResponse = {
  success: boolean;
  message?: string;
  roadmaps?: RoadmapSummary[];
  filters?: {
    universities: RoadmapUniversityOption[];
    departments: RoadmapDepartmentOption[];
    years: number[];
  };
};

function getCourseSlug(code: string) {
  return code.trim().toLowerCase().replace(/\s+/g, "-");
}

function RoadmapsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [universityId, setUniversityId] = useState(
    searchParams.get("university_id") || "",
  );
  const [departmentId, setDepartmentId] = useState(
    searchParams.get("department_id") || "",
  );
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);
  const [universities, setUniversities] = useState<RoadmapUniversityOption[]>(
    [],
  );
  const [departments, setDepartments] = useState<RoadmapDepartmentOption[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function loadRoadmaps() {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (universityId) params.set("university_id", universityId);
      if (departmentId) params.set("department_id", departmentId);
      if (year) params.set("year", year);

      try {
        const res = await fetch(`/api/roadmaps?${params.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const data = (await res.json()) as RoadmapResponse;

        if (!res.ok || !data.success) {
          throw new Error(data.message ?? "Failed to load roadmaps.");
        }

        setRoadmaps(data.roadmaps ?? []);
        setUniversities(data.filters?.universities ?? []);
        setDepartments(data.filters?.departments ?? []);
        setYears(data.filters?.years ?? []);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadRoadmaps();

    return () => controller.abort();
  }, [universityId, departmentId, year]);

  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    const params = new URLSearchParams();
    if (universityId) params.set("university_id", universityId);
    if (departmentId) params.set("department_id", departmentId);
    if (year) params.set("year", year);

    router.replace(`/roadmaps?${params.toString()}`, { scroll: false });
  }, [departmentId, router, universityId, year]);

  const visibleDepartments = useMemo(() => {
    const selectedUniversityId = Number(universityId);
    return universityId
      ? departments.filter(
          (department) => department.university_id === selectedUniversityId,
        )
      : departments;
  }, [departments, universityId]);

  useEffect(() => {
    if (!departmentId) return;
    if (
      visibleDepartments.some(
        (department) => String(department.department_id) === departmentId,
      )
    ) {
      return;
    }
    setDepartmentId("");
  }, [departmentId, visibleDepartments]);

  function resetFilters() {
    setUniversityId("");
    setDepartmentId("");
    setYear("");
  }

  return (
    <main className="min-h-screen bg-white px-4 py-10 md:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-3xl font-bold text-gray-900">Roadmaps</h1>
        <p className="mt-2 max-w-xl text-gray-500">
          Filter roadmaps by university, department, and year.
        </p>

        <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-[1fr_1fr_180px_auto]">
            <select
              value={universityId}
              onChange={(event) => {
                setUniversityId(event.target.value);
                setDepartmentId("");
              }}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            >
              <option value="">All universities</option>
              {universities.map((university) => (
                <option
                  key={university.university_id}
                  value={university.university_id}
                >
                  {university.name}
                </option>
              ))}
            </select>

            <select
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            >
              <option value="">All departments</option>
              {visibleDepartments.map((department) => (
                <option
                  key={department.department_id}
                  value={department.department_id}
                >
                  {department.name}
                </option>
              ))}
            </select>

            <select
              value={year}
              onChange={(event) => setYear(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-700 outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            >
              <option value="">All years</option>
              {years.map((item) => (
                <option key={item} value={item}>
                  Year {item}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 text-sm text-gray-700 transition hover:bg-gray-50"
            >
              <RotateCcw size={15} />
              Reset
            </button>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          {loading
            ? "Loading roadmaps..."
            : `${roadmaps.length} roadmap${roadmaps.length === 1 ? "" : "s"} found`}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-5 grid gap-5">
          {!loading && !error && roadmaps.length === 0 && (
            <div className="rounded-lg border border-gray-200 bg-white px-4 py-12 text-center text-sm text-gray-500">
              No roadmaps match your filters.
            </div>
          )}

          {roadmaps.map((roadmap) => (
            <article
              key={roadmap.roadmap_id}
              className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#6155F5]">
                    <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-2 py-1">
                      <GraduationCap size={13} />
                      {formatCourseLevel(roadmap.level)}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-emerald-700">
                      <Building2 size={13} />
                      {roadmap.university}
                    </span>
                  </div>
                  <h2 className="mt-3 text-xl font-semibold text-gray-950">
                    {roadmap.major}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    {roadmap.department}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-gray-400">Major credits</p>
                    <p className="font-semibold text-gray-950">
                      {roadmap.total_credits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Shown credits</p>
                    <p className="font-semibold text-gray-950">
                      {roadmap.planned_credits}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Courses</p>
                    <p className="font-semibold text-gray-950">
                      {roadmap.course_count}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-gray-100">
                {roadmap.terms.map((term) => (
                  <div
                    key={`${roadmap.roadmap_id}-${term.year_number}-${term.semester}`}
                    className="grid gap-3 border-b border-gray-100 py-4 last:border-b-0 lg:grid-cols-[150px_1fr]"
                  >
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        Year {term.year_number}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRoadmapSemester(term.semester)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {term.courses.map((course) => (
                        <Link
                          key={course.course_id}
                          href={`/courses/${getCourseSlug(course.code)}`}
                          className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition hover:border-[#6155F5]/50 hover:bg-[#EEF2FF] hover:text-[#4f45d4] focus:outline-none focus:ring-2 focus:ring-[#6155F5]/30"
                        >
                          <BookOpen size={14} className="text-[#6155F5]" />
                          <span className="font-medium text-gray-950">
                            {course.code}
                          </span>
                          <span>{course.title}</span>
                          <span className="text-xs text-gray-400">
                            {course.credits} cr.
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}

export default function RoadmapsPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-4 py-10 md:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-gray-400">
            Loading roadmaps...
          </div>
        </main>
      }
    >
      <RoadmapsPageContent />
    </Suspense>
  );
}
