"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  GraduationCap,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Button from "@/components/Button";
import SearchableDropdownField from "@/components/SearchableDropdown";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useAuth } from "@/context/AuthContext";
import {
  COURSE_LEVEL_OPTIONS,
  formatCourseLevel,
} from "@/lib/courseLevels";
import {
  ROADMAP_SEMESTER_OPTIONS,
  formatRoadmapSemester,
} from "@/lib/roadmapOptions";
import type {
  RoadmapCourse,
  RoadmapDepartmentOption,
  RoadmapMajorOption,
  RoadmapSemester,
  RoadmapSummary,
  RoadmapUniversityOption,
} from "@/types/roadmap";

type CourseOption = {
  course_id: number;
  code: string;
  title: string;
  credits: number;
  level: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

type OptionsResponse = {
  success: boolean;
  message?: string;
  universities?: RoadmapUniversityOption[];
  departments?: RoadmapDepartmentOption[];
  majors?: RoadmapMajorOption[];
  courses?: CourseOption[];
};

type RoadmapsResponse = {
  success: boolean;
  message?: string;
  roadmaps?: RoadmapSummary[];
};

type SaveResponse = {
  success: boolean;
  message?: string;
  roadmap?: RoadmapSummary;
};

type TimelineItem = RoadmapCourse;

function courseLabel(course: CourseOption | TimelineItem) {
  return `${course.code} - ${course.title}`;
}

function sortTimeline(items: TimelineItem[]) {
  const semesterOrder: Record<RoadmapSemester, number> = {
    fall: 1,
    spring: 2,
    summer: 3,
  };

  return [...items].sort((a, b) => {
    if (a.year_number !== b.year_number) return a.year_number - b.year_number;
    if (a.semester !== b.semester) {
      return semesterOrder[a.semester] - semesterOrder[b.semester];
    }
    if (a.sequence_order !== b.sequence_order) {
      return a.sequence_order - b.sequence_order;
    }
    return a.code.localeCompare(b.code);
  });
}

export default function AdminRoadmapsPage() {
  const { user, loading: authLoading } = useAuth();
  const [universities, setUniversities] = useState<RoadmapUniversityOption[]>(
    [],
  );
  const [departments, setDepartments] = useState<RoadmapDepartmentOption[]>([]);
  const [majors, setMajors] = useState<RoadmapMajorOption[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [roadmaps, setRoadmaps] = useState<RoadmapSummary[]>([]);

  const [selectedUniversityId, setSelectedUniversityId] = useState<number | "">(
    "",
  );
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | "">(
    "",
  );
  const [majorInput, setMajorInput] = useState("");
  const [level, setLevel] = useState("undergraduate");
  const [totalCredits, setTotalCredits] = useState("");
  const [selectedYear, setSelectedYear] = useState("1");
  const [selectedSemester, setSelectedSemester] =
    useState<RoadmapSemester>("fall");
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);
  const [timeline, setTimeline] = useState<TimelineItem[]>([]);
  const [editingRoadmapId, setEditingRoadmapId] = useState<number | null>(null);
  const [pendingDeleteRoadmap, setPendingDeleteRoadmap] =
    useState<RoadmapSummary | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const isUniversityAdmin = user?.role === "super_admin";
  const showUniversityAdminWarning = !authLoading && !isUniversityAdmin;
  const universityAdminWarning = "You are not the University Admin";

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const [optionsRes, roadmapsRes] = await Promise.all([
        fetch("/api/admin/roadmaps/options", { credentials: "include" }),
        fetch("/api/admin/roadmaps", { credentials: "include" }),
      ]);

      const optionsData = (await optionsRes.json()) as OptionsResponse;
      const roadmapsData = (await roadmapsRes.json()) as RoadmapsResponse;

      if (!optionsRes.ok || !optionsData.success) {
        throw new Error(optionsData.message ?? "Failed to load options.");
      }

      if (!roadmapsRes.ok || !roadmapsData.success) {
        throw new Error(roadmapsData.message ?? "Failed to load roadmaps.");
      }

      setUniversities(optionsData.universities ?? []);
      setDepartments(optionsData.departments ?? []);
      setMajors(optionsData.majors ?? []);
      setCourses(optionsData.courses ?? []);
      setRoadmaps(roadmapsData.roadmaps ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const departmentOptions = useMemo(
    () =>
      selectedUniversityId
        ? departments.filter(
            (department) => department.university_id === selectedUniversityId,
          )
        : [],
    [departments, selectedUniversityId],
  );

  const majorOptions = useMemo(
    () =>
      selectedDepartmentId
        ? majors.filter((major) => major.department_id === selectedDepartmentId)
        : [],
    [majors, selectedDepartmentId],
  );

  const courseOptions = useMemo(
    () =>
      selectedDepartmentId
        ? courses.filter(
            (course) =>
              course.department_id === selectedDepartmentId &&
              course.university_id === selectedUniversityId,
          )
        : [],
    [courses, selectedDepartmentId, selectedUniversityId],
  );

  const timelineByTerm = useMemo(() => {
    const groups = new Map<string, TimelineItem[]>();

    for (const item of sortTimeline(timeline)) {
      const key = `${item.year_number}-${item.semester}`;
      groups.set(key, [...(groups.get(key) ?? []), item]);
    }

    return Array.from(groups.entries()).map(([key, items]) => {
      const [year, semester] = key.split("-");
      return {
        key,
        year_number: Number(year),
        semester: semester as RoadmapSemester,
        items,
      };
    });
  }, [timeline]);

  const selectedCourse = useMemo(
    () =>
      selectedCourseId
        ? courseOptions.find((course) => course.course_id === selectedCourseId)
        : null,
    [courseOptions, selectedCourseId],
  );

  function resetEditor() {
    setEditingRoadmapId(null);
    setSelectedUniversityId("");
    setSelectedDepartmentId("");
    setMajorInput("");
    setLevel("undergraduate");
    setTotalCredits("");
    setSelectedCourseId(null);
    setTimeline([]);
  }

  function handleUniversityChange(value: string) {
    setSelectedUniversityId(value ? Number(value) : "");
    setSelectedDepartmentId("");
    setMajorInput("");
    setSelectedCourseId(null);
    setTimeline([]);
    setEditingRoadmapId(null);
  }

  function handleDepartmentChange(value: string) {
    setSelectedDepartmentId(value ? Number(value) : "");
    setMajorInput("");
    setSelectedCourseId(null);
    setTimeline([]);
    setEditingRoadmapId(null);
  }

  function addCourseToTimeline() {
    setError("");
    setMessage("");

    if (!selectedCourse) {
      setError("Select a course from the selected department first.");
      return;
    }

    if (timeline.some((item) => item.course_id === selectedCourse.course_id)) {
      setError("This course is already in the roadmap.");
      return;
    }

    const item: TimelineItem = {
      course_id: selectedCourse.course_id,
      code: selectedCourse.code,
      title: selectedCourse.title,
      credits: selectedCourse.credits,
      level: selectedCourse.level,
      department_id: selectedCourse.department_id,
      department: selectedCourse.department,
      university_id: selectedCourse.university_id,
      university: selectedCourse.university,
      year_number: Number(selectedYear),
      semester: selectedSemester,
      sequence_order: timeline.length + 1,
    };

    setTimeline((prev) => sortTimeline([...prev, item]));
    setSelectedCourseId(null);
  }

  function removeTimelineCourse(courseId: number) {
    setTimeline((prev) =>
      prev
        .filter((item) => item.course_id !== courseId)
        .map((item, index) => ({ ...item, sequence_order: index + 1 })),
    );
  }

  function loadRoadmapIntoEditor(roadmap: RoadmapSummary) {
    setError("");
    setMessage("");
    setEditingRoadmapId(roadmap.roadmap_id);
    setSelectedUniversityId(roadmap.university_id);
    setSelectedDepartmentId(roadmap.department_id);
    setMajorInput(roadmap.major);
    setLevel(roadmap.level);
    setTotalCredits(String(roadmap.total_credits));
    setTimeline(
      sortTimeline(roadmap.terms.flatMap((term) => term.courses)).map(
        (item, index) => ({
          ...item,
          sequence_order: index + 1,
        }),
      ),
    );
    setSelectedCourseId(null);
  }

  async function saveRoadmap() {
    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      return;
    }

    if (!selectedUniversityId || !selectedDepartmentId) {
      setError("Select a university and department first.");
      return;
    }

    if (!majorInput.trim()) {
      setError("Major name is required.");
      return;
    }

    if (!totalCredits || Number(totalCredits) < 1) {
      setError("Major credits are required.");
      return;
    }

    if (timeline.length === 0) {
      setError("Add at least one course to the timeline.");
      return;
    }

    try {
      setSaving(true);
      const res = await fetch("/api/admin/roadmaps", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          university_id: selectedUniversityId,
          department_id: selectedDepartmentId,
          major_name: majorInput.trim(),
          level,
          total_credits: Number(totalCredits),
          courses: timeline.map((item, index) => ({
            course_id: item.course_id,
            year_number: item.year_number,
            semester: item.semester,
            sequence_order: index + 1,
          })),
        }),
      });

      const data = (await res.json()) as SaveResponse;
      if (!res.ok || !data.success || !data.roadmap) {
        throw new Error(data.message ?? "Failed to save roadmap.");
      }

      const saved = data.roadmap;
      setRoadmaps((prev) => {
        const exists = prev.some(
          (roadmap) => roadmap.roadmap_id === saved.roadmap_id,
        );
        const next = exists
          ? prev.map((roadmap) =>
              roadmap.roadmap_id === saved.roadmap_id ? saved : roadmap,
            )
          : [...prev, saved];

        return next.sort((a, b) =>
          `${a.university} ${a.major}`.localeCompare(
            `${b.university} ${b.major}`,
          ),
        );
      });
    setEditingRoadmapId(saved.roadmap_id);
    setMessage("Roadmap saved successfully.");
    await loadData();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save roadmap.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteRoadmap() {
    if (!pendingDeleteRoadmap) return;

    setError("");
    setMessage("");

    if (!isUniversityAdmin) {
      setError(universityAdminWarning);
      setPendingDeleteRoadmap(null);
      return;
    }

    try {
      setDeleting(true);
      const res = await fetch(
        `/api/admin/roadmaps?roadmap_id=${pendingDeleteRoadmap.roadmap_id}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );
      const data = (await res.json()) as { success: boolean; message?: string };

      if (!res.ok || !data.success) {
        throw new Error(data.message ?? "Failed to delete roadmap.");
      }

      setRoadmaps((prev) =>
        prev.filter(
          (roadmap) => roadmap.roadmap_id !== pendingDeleteRoadmap.roadmap_id,
        ),
      );
      if (editingRoadmapId === pendingDeleteRoadmap.roadmap_id) {
        resetEditor();
      }
      setPendingDeleteRoadmap(null);
      setMessage("Roadmap deleted successfully.");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to delete roadmap.",
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      {pendingDeleteRoadmap && (
        <ConfirmModal
          title="Delete roadmap?"
          description={
            <>
              This will delete the full{" "}
              <span className="font-medium text-gray-700">
                {pendingDeleteRoadmap.major}
              </span>{" "}
              roadmap and every course placement inside it.
            </>
          }
          confirmText={deleting ? "Deleting..." : "Delete"}
          cancelText="Cancel"
          variant="danger"
          onCancel={() => {
            if (!deleting) setPendingDeleteRoadmap(null);
          }}
          onConfirm={deleteRoadmap}
        />
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-950">
            Roadmap Management
          </h1>
          <p className="text-sm text-gray-500">
            Build course timelines by university, department, major, and level.
          </p>
        </div>
        <Button
          variant="elevated"
          onClick={loadData}
          disabled={loading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw size={16} /> Refresh
        </Button>
      </div>

      {(error || message) && (
        <div
          className={`mt-5 rounded-lg border px-4 py-3 text-sm ${
            error
              ? "border-red-200 bg-red-50 text-red-700"
              : "border-green-200 bg-green-50 text-green-700"
          }`}
        >
          {error || message}
        </div>
      )}

      {showUniversityAdminWarning && (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are not the University Admin. Only the University Admin can add
          roadmaps.
        </div>
      )}

      <div className="mt-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Roadmap Details
            </h2>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <select
              value={selectedUniversityId}
              onChange={(event) => handleUniversityChange(event.target.value)}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5]"
            >
              <option value="">Select university</option>
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
              value={selectedDepartmentId}
              onChange={(event) => handleDepartmentChange(event.target.value)}
              disabled={!selectedUniversityId}
              className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5] disabled:bg-gray-50"
            >
              <option value="">Select department</option>
              {departmentOptions.map((department) => (
                <option
                  key={department.department_id}
                  value={department.department_id}
                >
                  {department.name}
                </option>
              ))}
            </select>

            <SearchableDropdownField
              value={majorInput}
              options={majorOptions.map((item) => item.name)}
              placeholder="Major name"
              onChange={setMajorInput}
            />

            <SearchableDropdownField
              value={formatCourseLevel(level)}
              options={COURSE_LEVEL_OPTIONS.map((item) => item.label)}
              placeholder="Select level"
              onChange={(value) => {
                const match = COURSE_LEVEL_OPTIONS.find(
                  (item) => item.label === value,
                );
                if (match) setLevel(match.value);
              }}
            />

            <input
              value={totalCredits}
              onChange={(event) => setTotalCredits(event.target.value)}
              type="number"
              min={1}
              max={500}
              placeholder="Major credits"
              className="h-10 rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]/30"
            />

            <div className="flex gap-2">
              <Button
                onClick={saveRoadmap}
                disabled={saving || authLoading}
                className="flex flex-1 items-center gap-2"
              >
                <Check size={16} />
                {saving ? "Saving..." : "Confirm"}
              </Button>
              <Button
                onClick={resetEditor}
                disabled={saving}
                variant="elevated"
                className="px-4"
              >
                New
              </Button>
            </div>
          </div>

          {editingRoadmapId && (
            <p className="mt-3 text-xs text-gray-500">
              Editing roadmap #{editingRoadmapId}
            </p>
          )}

          <div className="mt-6 border-t border-gray-100 pt-5">
            <div className="grid gap-3 md:grid-cols-[110px_150px_1fr_auto]">
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(event.target.value)}
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5]"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((year) => (
                  <option key={year} value={year}>
                    Year {year}
                  </option>
                ))}
              </select>

              <select
                value={selectedSemester}
                onChange={(event) =>
                  setSelectedSemester(event.target.value as RoadmapSemester)
                }
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5]"
              >
                {ROADMAP_SEMESTER_OPTIONS.map((semester) => (
                  <option key={semester.value} value={semester.value}>
                    {semester.label}
                  </option>
                ))}
              </select>

              <select
                value={selectedCourseId ?? ""}
                onChange={(event) =>
                  setSelectedCourseId(
                    event.target.value ? Number(event.target.value) : null,
                  )
                }
                disabled={!selectedDepartmentId || courseOptions.length === 0}
                className="h-10 min-w-0 rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-[#6155F5] disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {selectedDepartmentId
                    ? courseOptions.length > 0
                      ? "Select course"
                      : "No courses available"
                    : "Select department first"}
                </option>
                {courseOptions.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {courseLabel(course)}
                  </option>
                ))}
              </select>

              <Button
                onClick={addCourseToTimeline}
                disabled={!selectedDepartmentId || !selectedCourseId}
                className="flex items-center gap-2"
              >
                <Plus size={16} />
                Add
              </Button>
            </div>

            <div className="mt-5">
              {timeline.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-400">
                  No timeline courses yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                  {timelineByTerm.map((term) => (
                    <div
                      key={term.key}
                      className="grid gap-3 p-4 lg:grid-cols-[140px_1fr]"
                    >
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          Year {term.year_number}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRoadmapSemester(term.semester)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {term.items.map((item) => (
                          <div
                            key={item.course_id}
                            className="flex flex-col gap-2 rounded-lg bg-gray-50 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.code} - {item.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.credits} cr. -{" "}
                                {formatCourseLevel(item.level)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                removeTimelineCourse(item.course_id)
                              }
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50"
                              aria-label="Remove course"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#6155F5]" />
            <h2 className="text-base font-semibold text-gray-900">
              Existing Roadmaps
            </h2>
          </div>

          <div className="mt-4 max-h-[680px] space-y-3 overflow-auto pr-1">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">
                Loading roadmaps...
              </p>
            ) : roadmaps.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-400">
                No roadmaps yet.
              </p>
            ) : (
              roadmaps.map((roadmap) => (
                <div
                  key={roadmap.roadmap_id}
                  onClick={() => loadRoadmapIntoEditor(roadmap)}
                  className={`w-full cursor-pointer rounded-lg border p-4 text-left transition hover:border-[#6155F5] ${
                    editingRoadmapId === roadmap.roadmap_id
                      ? "border-[#6155F5] bg-[#F4F3FF]"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-gray-950">
                        {roadmap.major}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {roadmap.university} - {roadmap.department}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#EEF2FF] px-2 py-1 text-xs font-medium text-[#6155F5]">
                      {formatCourseLevel(roadmap.level)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span>{roadmap.total_credits} major credits</span>
                    <span>{roadmap.planned_credits} planned credits</span>
                    <span>{roadmap.course_count} courses</span>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        setPendingDeleteRoadmap(roadmap);
                      }}
                      disabled={deleting}
                      className="ml-auto inline-flex items-center gap-1 rounded-md border border-red-200 px-2 py-1 text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 size={13} />
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
