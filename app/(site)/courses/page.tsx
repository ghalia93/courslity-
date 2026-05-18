"use client";

// Renders the site courses page.
import {
  Suspense,
  useCallback,
  useState,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { filterCourses } from "@/lib/filterCourses";
import { Filters } from "@/types/filters";
import { Course } from "@/types/course";
import FiltersPanel from "@/components/FiltersPanel";
import CourseCard from "@/components/CourseCard";
import Searchbar from "@/components/Searchbar";
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

type MajorOption = {
  major_id: number;
  name: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

type CourseSortKey = "most_reviewed" | "highest_rated" | "lowest_rated";

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function CoursesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // -- Initialise from URL params ---
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sortKey, setSortKey] = useState<CourseSortKey>("most_reviewed");
  const [filters, setFilters] = useState<Filters>({
    university: searchParams.get("university") || "",
    department: searchParams.get("department") || "",
    major: searchParams.get("major") || "",
    language: searchParams.get("language") || "",
    level: searchParams.get("level") || "",
    year: searchParams.get("year") || "",
    semester: searchParams.get("semester") || "",
  });

  // -- Courses from API ---
  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [majors, setMajors] = useState<MajorOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (showPageLoading = true) => {
    try {
      if (showPageLoading) setLoading(true);
      setError(null);
      const [coursesRes, universitiesRes, departmentsRes, majorsRes] =
        await Promise.all([
          fetch("/api/courses?limit=5000&page=1", { cache: "no-store" }),
          fetch("/api/universities", { cache: "no-store" }),
          fetch("/api/departments", { cache: "no-store" }),
          fetch("/api/majors", { cache: "no-store" }),
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

      if (majorsRes.ok) {
        const majorsData = await majorsRes.json();
        setMajors(Array.isArray(majorsData) ? majorsData : []);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      if (showPageLoading) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (showFilters) void loadData(false);
  }, [loadData, showFilters]);

  useEffect(() => {
    const refreshCatalog = () => void loadData(false);
    const refreshWhenVisible = () => {
      if (document.visibilityState === "visible") refreshCatalog();
    };

    window.addEventListener("focus", refreshCatalog);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      window.removeEventListener("focus", refreshCatalog);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, [loadData]);

  // -- Debounce search query (300 ms) ---
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  // Sync active search and filters to the URL after the initial mount.
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

  // -- Filter courses client-side ---
  const filteredCourses = useMemo(
    () => filterCourses(courses, { ...filters, query: debouncedQuery }),
    [courses, filters, debouncedQuery],
  );

  const sortedCourses = useMemo(() => {
    return [...filteredCourses].sort((a, b) => {
      if (sortKey === "highest_rated") {
        return (b.averageRating ?? -1) - (a.averageRating ?? -1);
      }

      if (sortKey === "lowest_rated") {
        return (a.averageRating ?? Number.MAX_SAFE_INTEGER) -
          (b.averageRating ?? Number.MAX_SAFE_INTEGER);
      }

      return b.reviewCount - a.reviewCount;
    });
  }, [filteredCourses, sortKey]);

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
      majors: [
        ...majors.map((major) => ({
          name: major.name,
          department: major.department,
          university: major.university,
        })),
        ...courses.flatMap((course) =>
          (course.majors ?? []).map((major) => ({
            name: major,
            department: course.department,
            university: course.university,
          })),
        ),
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
    [courses, departments, majors, universities],
  );

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
          <div className="min-w-0 flex-1">
            <Searchbar query={query} setQuery={setQuery} />
          </div>

          <button
            onClick={() => setShowFilters((prev) => !prev)}
            className="flex items-center justify-center rounded-xl border border-gray-300
                        p-2.5 hover:bg-gray-50 transition"
          >
            <SlidersHorizontal className="h-5 w-5 text-gray-700" />
          </button>

          <div className="relative hidden sm:block">
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as CourseSortKey)}
              className="h-11 rounded-xl border border-gray-300 bg-white pl-3 pr-9 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
            >
              <option value="most_reviewed">Most reviewed</option>
              <option value="highest_rated">Highest rated</option>
              <option value="lowest_rated">Lowest rated</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={15}
            />
          </div>
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
                majors={filterOptions.majors}
                languages={filterOptions.languages}
                levels={filterOptions.levels}
                onApply={() => setShowFilters(false)}
                onReset={() => setShowFilters(false)}
              />
              <div className="mt-4 sm:hidden">
                <label className="text-xs font-medium text-gray-500">
                  Sort by
                </label>
                <div className="relative mt-1">
                  <select
                    value={sortKey}
                    onChange={(e) =>
                      setSortKey(e.target.value as CourseSortKey)
                    }
                    className="h-10 w-full rounded-lg border border-gray-300 bg-white pl-3 pr-9 text-sm text-gray-700 appearance-none focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
                  >
                    <option value="most_reviewed">Most reviewed</option>
                    <option value="highest_rated">Highest rated</option>
                    <option value="lowest_rated">Lowest rated</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                    size={15}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course list */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <p className="text-gray-400 text-center py-10 md:col-span-2">
              Loading courses...
            </p>
          ) : error ? (
            <p className="text-red-500 text-center py-10 md:col-span-2">
              {error}
            </p>
          ) : sortedCourses.length === 0 ? (
            <p className="text-gray-500 text-center py-10 md:col-span-2">
              No courses match your search or filters.
            </p>
          ) : (
            sortedCourses.map((course) => (
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
