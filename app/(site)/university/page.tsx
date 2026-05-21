"use client";

// Renders the public University page with university-scoped course browsing.
import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, Search } from "lucide-react";
import CourseCard from "@/components/CourseCard";
import UniversityReviewSection from "@/components/UniversityReviewSection";
import { Course } from "@/types/course";

type UniversityOption = {
  university_id: number;
  name: string;
  email_domain: string;
  description: string | null;
};

function UniversityPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [universities, setUniversities] = useState<UniversityOption[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedUniversity, setSelectedUniversity] = useState(
    searchParams.get("name") || "",
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadUniversityData() {
      try {
        setLoading(true);
        setError(null);

        const [universitiesRes, coursesRes] = await Promise.all([
          fetch("/api/universities", { cache: "no-store" }),
          fetch("/api/courses?limit=5000&page=1", { cache: "no-store" }),
        ]);

        if (!universitiesRes.ok) {
          throw new Error("Failed to load universities");
        }
        if (!coursesRes.ok) {
          throw new Error("Failed to load courses");
        }

        const universitiesData = await universitiesRes.json();
        const coursesData = await coursesRes.json();

        setUniversities(Array.isArray(universitiesData) ? universitiesData : []);
        setCourses(coursesData.courses ?? []);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    loadUniversityData();
  }, []);

  function chooseUniversity(name: string) {
    setSelectedUniversity(name);
    const params = new URLSearchParams();
    params.set("name", name);
    router.replace(`/university?${params.toString()}`, { scroll: false });
  }

  const universityCards = useMemo(() => {
    return universities.map((university) => {
      const courseCount = courses.filter(
        (course) => course.university === university.name,
      ).length;

      return {
        ...university,
        courseCount,
      };
    });
  }, [courses, universities]);

  const selectedUniversityOption = useMemo(
    () =>
      universityCards.find(
        (university) => university.name === selectedUniversity,
      ) ?? null,
    [selectedUniversity, universityCards],
  );

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesUniversity =
        selectedUniversity && course.university === selectedUniversity;
      const matchesQuery =
        !normalizedQuery ||
        course.code.toLowerCase().includes(normalizedQuery) ||
        course.title.toLowerCase().includes(normalizedQuery) ||
        course.department.toLowerCase().includes(normalizedQuery);

      return matchesUniversity && matchesQuery;
    });
  }, [courses, query, selectedUniversity]);

  return (
    <main className="min-h-screen bg-white px-4 py-8 sm:px-6 md:px-8 md:py-10">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              University
            </h1>
            <p className="mt-2 max-w-xl text-gray-500">
              Choose a university to browse only the courses connected to it.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search selected courses..."
              className="h-11 w-full rounded-xl border border-gray-300 pl-10 pr-4 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]"
            />
          </div>
        </div>

        {loading ? (
          <p className="py-12 text-center text-sm text-gray-400">
            Loading universities...
          </p>
        ) : error ? (
          <p className="py-12 text-center text-sm text-red-500">{error}</p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {universityCards.map((university) => (
                <button
                  key={university.university_id}
                  type="button"
                  onClick={() => chooseUniversity(university.name)}
                  className={`flex min-h-24 items-center gap-4 rounded-xl border px-4 py-3 text-left transition ${
                    selectedUniversity === university.name
                      ? "border-[#6155F5] bg-[#F4F3FF] shadow-sm"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-[#6155F5] shadow-sm">
                    <Building2 size={20} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold text-gray-900">
                      {university.name}
                    </span>
                    <span className="mt-0.5 block text-sm text-gray-500">
                      {university.courseCount} courses
                    </span>
                  </span>
                </button>
              ))}
            </div>

            {selectedUniversityOption && (
              <section className="mt-8">
                <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="max-w-3xl">
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedUniversityOption.name}
                      </h2>
                      <p className="mt-3 text-[15px] leading-7 text-gray-600">
                        {selectedUniversityOption.description ||
                          "No university description has been added yet."}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:flex lg:grid">
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-medium text-gray-500">
                          Courses
                        </p>
                        <p className="mt-1 text-lg font-semibold text-gray-900">
                          {selectedUniversityOption.courseCount}
                        </p>
                      </div>
                      <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                        <p className="text-xs font-medium text-gray-500">
                          Email domain
                        </p>
                        <p className="mt-1 max-w-40 truncate text-sm font-semibold text-gray-900">
                          {selectedUniversityOption.email_domain || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <UniversityReviewSection
                  universityId={selectedUniversityOption.university_id}
                />
              </section>
            )}

            <div className="mt-8">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedUniversity
                  ? `Courses Available at ${selectedUniversity}`
                  : "Select a university"}
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {!selectedUniversity ? (
                  <p className="text-sm text-gray-400 lg:col-span-2">
                    Pick a university above to show its courses.
                  </p>
                ) : filteredCourses.length === 0 ? (
                  <p className="text-sm text-gray-400 lg:col-span-2">
                    No courses match this university and search.
                  </p>
                ) : (
                  filteredCourses.map((course) => (
                    <CourseCard key={course.courseId} {...course} />
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function UniversityPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white px-4 py-10 md:px-8">
          <div className="mx-auto max-w-6xl text-center text-sm text-gray-400">
            Loading universities...
          </div>
        </main>
      }
    >
      <UniversityPageContent />
    </Suspense>
  );
}
