"use client";

import { useState, useMemo, useEffect, useRef, ChangeEvent } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { filterCourses } from "@/lib/filterCourses";
import { Filters } from "@/types/filters";
import { Course } from "@/types/course";
import FiltersPanel from "@/components/FiltersPanel";
import CourseCard from "@/components/CourseCard";

export default function CoursesPage() {
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
  });

  // ── Courses from API ────────────────────────────────────────────────────────
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch a generous first page; adjust limit as your dataset grows
        const res = await fetch("/api/courses?limit=50&page=1");
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data.courses ?? []);
      } catch (err: any) {
        setError(err.message ?? "Something went wrong");
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

  const [showFilters, setShowFilters] = useState(false);
  const isSearching = !!debouncedQuery;

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 py-10">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900">
          {isSearching
            ? `Search Results for "${debouncedQuery}"`
            : "Browse Courses"}
        </h1>
        <p className="mt-2 text-gray-500 max-w-xl">
          Explore and filter courses by university, department, language, and
          level.
        </p>

        {/* Search bar + filter toggle */}
        <div className="mt-6 flex items-center gap-3">
          <div className="relative flex-1">
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
                onApply={() => setShowFilters(false)}
                onReset={() => setShowFilters(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Course list */}
        <div className="mt-8 grid justify-center gap-8 sm:grid-cols-1 md:grid-cols-2">
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
