"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Searchbar from "@/components/Searchbar";
import CourseCard from "@/components/CourseCard";
import FiltersPanel from "@/components/FiltersPanel";
import { Filters } from "@/types/filters";
import { Course } from "@/types/course";
import { filterCourses } from "@/lib/filterCourses";
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

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("query") || "";

  const [query, setQuery] = useState(initialQuery);
  const [showFilters, setShowFilters] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [departments, setDepartments] = useState<DepartmentOption[]>([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState<Filters>({
    university: searchParams.get("university") || "",
    department: searchParams.get("department") || "",
    language: searchParams.get("language") || "",
    level: searchParams.get("level") || "",
    year: searchParams.get("year") || "",
    semester: searchParams.get("semester") || "",
  });

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      try {
        const [coursesRes, universitiesRes, departmentsRes] = await Promise.all([
          fetch("/api/courses?limit=500&page=1", { cache: "no-store" }),
          fetch("/api/universities", { cache: "no-store" }),
          fetch("/api/departments", { cache: "no-store" }),
        ]);

        if (coursesRes.ok) {
          const coursesData = await coursesRes.json();
          setCourses(coursesData.courses ?? []);
        }

        if (universitiesRes.ok) {
          const universitiesData = await universitiesRes.json();
          setUniversities(universitiesData ?? []);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
        }
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();

    if (query) params.set("query", query);

    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });

    router.replace(`/search?${params.toString()}`);
  }, [query, filters, router]);

  const filteredCourses = useMemo(() => {
    return filterCourses(courses, { ...filters, query });
  }, [courses, query, filters]);

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

  return (
    <main className="min-h-screen bg-white px-4 md:px-8 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1">
            <Searchbar query={query} setQuery={setQuery} />
          </div>

          <button
            className="flex items-center justify-center rounded-xl border border-gray-300 
                        p-2.5 hover:bg-gray-50 transition"
            onClick={() => setShowFilters((prev) => !prev)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L15 12.414V19a1 1 0 01-1.447.894l-4-2A1 1 0 019 17V12.414L3.293 6.707A1 1 0 013 6V4z"
              />
            </svg>
          </button>
        </div>

        <AnimatePresence initial={false}>
          {showFilters && (
            <motion.div
              key="filters"
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden mb-6"
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

        {loading ? (
          <div className="mt-10 text-center text-gray-500">
            Loading courses...
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="mt-10 text-center text-gray-500">
            No courses found.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredCourses.map((course) => (
              <CourseCard key={course.courseId} {...course} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
