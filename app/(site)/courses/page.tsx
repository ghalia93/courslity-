"use client";

import {
  Suspense,
  useState,
  useMemo,
  useEffect,
  useRef,
  ChangeEvent,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { filterCourses } from "@/lib/filterCourses";
import { Filters } from "@/types/filters";
import { Course } from "@/types/course";
import FiltersPanel from "@/components/FiltersPanel";
import CourseCard from "@/components/CourseCard";
import { COURSE_LEVEL_VALUES } from "@/lib/courseLevels";

type UniversityOption = {
  university_id: number;
  name: string;
  email_domain: string;
};

type DepartmentOption = {
  department_id: number;
  name: string;
  university_id: number;
  university: string;
};

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // ── Initialise from URL params ──────────────────────────────────────────────
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filters, setFilters] = useState<Filters>({
    university: searchParams.get("university") || "",
    department: searchParams.get("department") || "",
    language: searchParams.get("language") || "",
    level: searchParams.get("level") || "",
    year: searchParams.get("year") || "",
    semester: searchParams.get("semester") || "",
  });

  // ── Courses from API ────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const [coursesRes, universitiesRes, departmentsRes] = await Promise.all([
          fetch("/api/courses?limit=500&page=1", { cache: "no-store" }),
          fetch("/api/universities", { cache: "no-store" }),
          fetch("/api/departments", { cache: "no-store" }),
        ]);

        if (!coursesRes.ok) throw new Error("Failed to fetch courses");
        if (!universitiesRes.ok) throw new Error("Failed to fetch universities");

        const coursesData = await coursesRes.json();
        const universitiesData = await universitiesRes.json();

        setCourses(coursesData.courses ?? []);
        setUniversities(universitiesData ?? []);

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // ── Debounce search query (300 ms) ──────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // ── Sync active search + filters → URL (skip on initial mount) ─────────────
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    const params = new URLSearchParams();
    if (debouncedQuery) params.set("query", debouncedQuery);
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    router.replace(`/courses?${params.toString()}`, { scroll: false });
  }, [debouncedQuery, filters, router]);

  // ── Filter courses client-side ──────────────────────────────────────────────
  const filteredCourses = useMemo(
    () => filterCourses(courses, { ...filters, query: debouncedQuery }),
    [courses, filters, debouncedQuery],
  );

  const filterOptions = useMemo(
    () => ({
      universities: uniqueSorted([
        ...universities.map((university) => university.name),
        ...courses.map((course) => course.university),
      ]),
      departments: [
        ...departments.map((department) => ({
          name: department.name,
          university: department.university,
        })),
        ...courses.map((course) => ({
          name: course.department,
          university: course.university,
        })),
      ],
      languages: uniqueSorted(courses.map((course) => course.language)),
      levels: [
        ...universities.flatMap((university) =>
          COURSE_LEVEL_VALUES.map((level) => ({
            value: level,
            university: university.name,
          })),
        ),
        ...courses.map((course) => ({
          value: course.level,
          university: course.university,
        })),
      ],
    }),
    [courses, departments, universities],
  );

  const [showFilters, setShowFilters] = useState(false);
  const isSearching = !!debouncedQuery;

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          {isSearching
            ? `Search Results for "${debouncedQuery}"`
            : "Browse Courses"}
        </h1>
        <p className="mt-2 text-gray-500 max-w-xl">
          Explore and filter courses by university, department, language, and
          level.
        </p>

        {/* Search bar + filter toggle */}
        <div className="mt-6 flex min-w-0 items-center gap-3">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search courses, codes, universities..."
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setQuery(e.target.value)
              }
              className="w-full border border-gray-300 rounded-xl pl-10 pr-4 py-2.5
                        focus:outline-none focus:ring-2 focus:ring-[#6155F5]
                        focus:border-transparent transition"
            />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center justify-center rounded-xl border border-gray-300
                        p-2.5 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Filters panel */}
        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="overflow-hidden mb-6 mt-6"
            >
              <FiltersPanel
                filters={filters}
                setFilters={setFilters}
                universities={filterOptions.universities}
                departments={filterOptions.departments}
                languages={filterOptions.languages}
                levels={filterOptions.levels}
                onApply={() => setShowFilters(false)}
                onReset={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course list */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <p className="text-gray-400 text-center py-10 md:col-span-2">
              Loading courses…
            </p>
          ) : error ? (
            <p className="text-red-500 text-center py-10 md:col-span-2">
              {error}
            </p>
          ) : filteredCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-10 md:col-span-2">
              No courses match your search or filters.
            </p>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard key={course.courseId} {...course} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-4 py-10 md:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-gray-400">
            Loading courses...
          </div>
        </main>
      }
    >
      <CoursesPageContent />
    </Suspense>
  );
}
