"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import AddCourseCard from "@/components/admin/AddCourseCard";
import Button from "@/components/Button";
import SearchableDropdownField from "@/components/SearchableDropdown";
import { useAuth } from "@/context/AuthContext";
import {
  COURSE_LEVEL_OPTIONS,
  COURSE_LEVEL_VALUES,
  formatCourseLevel,
  sortCourseLevels,
} from "@/lib/courseLevels";
import {
  Pencil,
  Trash2,
  Plus,
  Search,
  Star,
  SlidersHorizontal,
  ChevronDown,
  X,
} from "lucide-react";

type Course = {
  course_id: number;
  code: string;
  title: string;
  description: string;
  credits: number;
  level: string;
  language: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
  deleted_at: string | null;
  rating: number;
  number_of_reviews: number;
  metrics: {
    exam: number;
    workload: number;
    attendance: number;
    grading: number;
  };
};

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

type SortKey = "rating_high" | "rating_low" | "reviews_most";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function uniqueSorted(values: string[]) {
  return unique(values.filter(Boolean)).sort((a, b) => a.localeCompare(b));
}

// ─── Edit Modal ──────────────────────────────────────────────────────────────

const VALID_LANGUAGES = [
  "English",
  "Arabic",
  "French",
  "German",
  "Spanish",
  "Other",
];

function EditCourseModal({
  course,
  onClose,
  onSaved,
}: {
  course: Course;
  onClose: () => void;
  onSaved: (updated: Partial<Course> & { course_id: number }) => void;
}) {
  const [form, setForm] = useState({
    title: course.title,
    description: course.description,
    credits: String(course.credits),
    language: course.language,
    level: course.level as string,
  });
  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const levelLabel = formatCourseLevel(form.level);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    setApiError(null);
    const creditsNum = Number(form.credits);
    if (isNaN(creditsNum) || creditsNum < 1 || creditsNum > 9) {
      setApiError("Credits must be between 1 and 9.");
      return;
    }
    if (!form.title.trim()) {
      setApiError("Title is required.");
      return;
    }

    const payload: {
      title: string;
      description: string;
      credits: number;
      language: string;
      level: Course["level"];
    } = {
      title: form.title.trim(),
      description: form.description.trim(),
      credits: creditsNum,
      language: form.language,
      level: form.level as Course["level"],
    };

    try {
      setSaving(true);
      const res = await fetch(`/api/admin/courses/${course.course_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!data.success) {
        setApiError(data.message ?? "Failed to update course.");
        return;
      }
      onSaved({ course_id: course.course_id, ...payload });
      onClose();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Edit {course.code}
            </h2>
            <p className="text-sm text-gray-400">
              Course code cannot be changed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-3">
          {apiError && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              {apiError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">Title</label>
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Credits
                </label>
                <input
                  name="credits"
                  value={form.credits}
                  onChange={handleChange}
                  type="number"
                  min={1}
                  max={9}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                    focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:border-transparent"
                />
              </div>

              <div>
                <label className="text-xs text-gray-500 mb-1 block">
                  Level
                </label>
                <SearchableDropdownField
                  value={levelLabel}
                  options={COURSE_LEVEL_OPTIONS.map((level) => level.label)}
                  placeholder="Select level"
                  onChange={(v) => {
                    const selectedLevel = COURSE_LEVEL_OPTIONS.find(
                      (level) => level.label === v,
                    );
                    if (!selectedLevel) return;
                    setForm((prev) => ({ ...prev, level: selectedLevel.value }));
                  }}
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Language
              </label>
              <SearchableDropdownField
                value={form.language}
                options={VALID_LANGUAGES}
                placeholder="Select language"
                onChange={(v) => setForm((prev) => ({ ...prev, language: v }))}
              />
            </div>

            <div>
              <label className="text-xs text-gray-500 mb-1 block">
                Description
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-md text-white bg-[#6155F5] hover:bg-[#4f45d4] transition disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Course Detail Modal ─────────────────────────────────────────────────────

function CourseDetailModal({
  course,
  onClose,
  onEdit,
  onDelete,
}: {
  course: Course;
  onClose: () => void;
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg
          max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-gray-900">
                {course.code}
              </h2>
              {course.deleted_at ? (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700">
                  Deleted
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-green-100 text-green-700">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{course.title}</p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">University</p>
              <p className="text-gray-800 font-medium">{course.university}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Department</p>
              <p className="text-gray-800 font-medium">{course.department}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Level</p>
              <p className="text-gray-800 font-medium">
                {formatCourseLevel(course.level)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Language</p>
              <p className="text-gray-800 font-medium">{course.language}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Credits</p>
              <p className="text-gray-800 font-medium">{course.credits} cr.</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Reviews</p>
              <p className="text-gray-800 font-medium">
                {course.number_of_reviews}
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Overall rating</p>
            <div className="flex items-center gap-1.5">
              <Star size={15} className="text-amber-400 fill-amber-400" />
              <span className="text-lg font-semibold text-gray-900">
                {course.rating.toFixed(2)}
              </span>
              <span className="text-sm text-gray-400">/ 5.00</span>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Metric breakdown</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  label: "Exam difficulty",
                  value: course.metrics.exam,
                  color: "bg-blue-100 text-blue-800",
                },
                {
                  label: "Workload",
                  value: course.metrics.workload,
                  color: "bg-green-100 text-green-800",
                },
                {
                  label: "Attendance",
                  value: course.metrics.attendance,
                  color: "bg-yellow-100 text-yellow-800",
                },
                {
                  label: "Grading",
                  value: course.metrics.grading,
                  color: "bg-purple-100 text-purple-800",
                },
              ].map((m) => (
                <div
                  key={m.label}
                  className={`rounded-lg px-3 py-2 ${m.color}`}
                >
                  <p className="text-[11px] opacity-70">{m.label}</p>
                  <p className="text-base font-semibold">
                    {m.value}{" "}
                    <span className="text-xs font-normal opacity-60">/ 5</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Description</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {course.description}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs text-gray-400 space-y-0.5">
            <p>
              course_id:{" "}
              <span className="text-gray-600 font-mono">
                {course.course_id}
              </span>
            </p>
            <p>
              department_id:{" "}
              <span className="text-gray-600 font-mono">
                {course.department_id}
              </span>
            </p>
            <p>
              university_id:{" "}
              <span className="text-gray-600 font-mono">
                {course.university_id}
              </span>
            </p>
            {course.deleted_at && (
              <p>
                deleted_at:{" "}
                <span className="text-red-500 font-mono">
                  {course.deleted_at}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              onDelete(course);
              onClose();
            }}
            disabled={!!course.deleted_at}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-red-600
              border border-red-200 hover:bg-red-50 transition disabled:opacity-30"
          >
            <Trash2 size={14} /> Delete
          </button>
          <button
            onClick={() => {
              onEdit(course);
              onClose();
            }}
            disabled={!!course.deleted_at}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-white
              bg-[#6155F5] hover:bg-[#4f45d4] transition disabled:opacity-30"
          >
            <Pencil size={14} /> Edit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ────────────────────────────────────────────────────

function DeleteConfirmModal({
  courseName,
  deleting,
  onConfirm,
  onCancel,
}: {
  courseName: string;
  deleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-sm w-full mx-4">
        <h2 className="text-base font-semibold text-gray-900">
          Delete course?
        </h2>
        <p className="mt-2 text-sm text-gray-500">
          <span className="font-medium text-gray-700">{courseName}</span> will
          be soft-deleted and hidden from students.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50"
          >
            {deleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Filter Select ───────────────────────────────────────────────────────────

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-gray-500 font-medium">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm
            text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5]"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
          size={13}
        />
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function AdminCoursesPage() {
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [catalogUniversities, setCatalogUniversities] = useState<
    UniversityOption[]
  >([]);
  const [catalogDepartments, setCatalogDepartments] = useState<
    DepartmentOption[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Course | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "deleted"
  >("all");
  const [sortKey, setSortKey] = useState<SortKey>("rating_high");
  const isUniversityAdmin = user?.role === "super_admin";
  const showUniversityAdminWarning = !authLoading && !isUniversityAdmin;
  const universityAdminWarning = "You are not the University Admin";

  // ── Fetch all courses ──────────────────────────────────────────────────────
  const loadCourses = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/courses", {
        credentials: "include",
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        throw new Error(data?.message ?? "Failed to load courses.");
      }

      setCourses((data.courses ?? []) as Course[]);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Network error. Could not load courses.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const loadAcademicCatalog = useCallback(async () => {
    try {
      const [universitiesRes, departmentsRes] = await Promise.all([
        fetch("/api/admin/universities", {
          credentials: "include",
          cache: "no-store",
        }),
        fetch("/api/departments", { cache: "no-store" }),
      ]);

      const universitiesData = await universitiesRes.json().catch(() => null);
      const departmentsData = await departmentsRes.json().catch(() => null);

      if (universitiesRes.ok && universitiesData?.success) {
        setCatalogUniversities(
          (universitiesData.universities ?? []) as UniversityOption[],
        );
      }

      if (departmentsRes.ok) {
        setCatalogDepartments(
          (Array.isArray(departmentsData)
            ? departmentsData
            : departmentsData?.departments ?? []) as DepartmentOption[],
        );
      }
    } catch {
      setCatalogUniversities([]);
      setCatalogDepartments([]);
    }
  }, []);

  useEffect(() => {
    void loadCourses();
    void loadAcademicCatalog();
  }, [loadAcademicCatalog, loadCourses]);

  const universities = useMemo(
    () =>
      uniqueSorted([
        ...catalogUniversities.map((university) => university.name),
        ...courses.map((course) => course.university),
      ]),
    [catalogUniversities, courses],
  );

  const departments = useMemo(
    () =>
      uniqueSorted([
        ...catalogDepartments
          .filter(
            (department) =>
              universityFilter === "all" ||
              department.university === universityFilter,
          )
          .map((department) => department.name),
        ...courses
          .filter(
            (course) =>
              universityFilter === "all" ||
              course.university === universityFilter,
          )
          .map((course) => course.department),
      ]),
    [catalogDepartments, courses, universityFilter],
  );

  const languages = useMemo(
    () => uniqueSorted(courses.map((course) => course.language)),
    [courses],
  );

  const levels = useMemo(() => {
    if (universityFilter === "all") {
      return sortCourseLevels([
        ...COURSE_LEVEL_VALUES,
        ...courses.map((course) => course.level),
      ]);
    }

    return sortCourseLevels([
      ...COURSE_LEVEL_VALUES,
      ...courses
        .filter((course) => course.university === universityFilter)
        .map((course) => course.level),
    ]);
  }, [courses, universityFilter]);

  useEffect(() => {
    if (departmentFilter !== "all" && !departments.includes(departmentFilter)) {
      setDepartmentFilter("all");
    }
  }, [departmentFilter, departments]);

  useEffect(() => {
    if (levelFilter !== "all" && !levels.includes(levelFilter)) {
      setLevelFilter("all");
    }
  }, [levelFilter, levels]);

  const activeFilterCount = [
    universityFilter !== "all",
    departmentFilter !== "all",
    levelFilter !== "all",
    languageFilter !== "all",
    statusFilter !== "all",
    sortKey !== "rating_high",
  ].filter(Boolean).length;

  function resetFilters() {
    setUniversityFilter("all");
    setDepartmentFilter("all");
    setLevelFilter("all");
    setLanguageFilter("all");
    setStatusFilter("all");
    setSortKey("rating_high");
  }

  const filteredCourses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const result = courses.filter((c) => {
      const matchesSearch =
        !q ||
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.university.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q);
      return (
        matchesSearch &&
        (universityFilter === "all" || c.university === universityFilter) &&
        (departmentFilter === "all" || c.department === departmentFilter) &&
        (levelFilter === "all" || c.level === levelFilter) &&
        (languageFilter === "all" || c.language === languageFilter) &&
        (statusFilter === "all" ||
          (statusFilter === "active" && !c.deleted_at) ||
          (statusFilter === "deleted" && !!c.deleted_at))
      );
    });
    return [...result].sort((a, b) => {
      switch (sortKey) {
        case "rating_high":
          return b.rating - a.rating;
        case "rating_low":
          return a.rating - b.rating;
        case "reviews_most":
          return b.number_of_reviews - a.number_of_reviews;
        default:
          return 0;
      }
    });
  }, [
    courses,
    searchQuery,
    universityFilter,
    departmentFilter,
    levelFilter,
    languageFilter,
    statusFilter,
    sortKey,
  ]);

  // ── Create ─────────────────────────────────────────────────────────────────
  // AddCourseCard now calls the API itself and passes back the created Course object
  const handleSaveCourse = useCallback(
    (newCourse: Course) => {
      setCourses((prev) => [
        newCourse,
        ...prev.filter((course) => course.course_id !== newCourse.course_id),
      ]);
      setShowForm(false);
      void loadCourses();
      void loadAcademicCatalog();
    },
    [loadAcademicCatalog, loadCourses],
  );

  // ── Delete ─────────────────────────────────────────────────────────────────
  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/courses/${pendingDelete.course_id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.message ?? "Failed to delete course.");
        return;
      }
      setCourses((prev) =>
        prev.map((c) =>
          c.course_id === pendingDelete.course_id
            ? { ...c, deleted_at: new Date().toISOString() }
            : c,
        ),
      );
    } catch {
      setError("Network error. Could not delete course.");
    } finally {
      setDeleting(false);
      setPendingDelete(null);
    }
  }

  // ── Edit ───────────────────────────────────────────────────────────────────
  function handleEdit(course: Course) {
    setEditingCourse(course);
  }

  function handleEditSaved(updated: Partial<Course> & { course_id: number }) {
    setCourses((prev) =>
      prev.map((c) =>
        c.course_id === updated.course_id ? { ...c, ...updated } : c,
      ),
    );
  }

  const closeDetail = useCallback(() => setDetailCourse(null), []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {detailCourse && (
        <CourseDetailModal
          course={detailCourse}
          onClose={closeDetail}
          onEdit={handleEdit}
          onDelete={(c) => {
            setDetailCourse(null);
            setPendingDelete(c);
          }}
        />
      )}

      {pendingDelete && (
        <DeleteConfirmModal
          courseName={`${pendingDelete.code} — ${pendingDelete.title}`}
          deleting={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setPendingDelete(null)}
        />
      )}

      {editingCourse && (
        <EditCourseModal
          course={editingCourse}
          onClose={() => setEditingCourse(null)}
          onSaved={(updated) => {
            handleEditSaved(updated);
            setEditingCourse(null);
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">
            Course Management
          </h1>
          <p className="text-sm text-gray-500">
            Manage courses and academic data
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            if (!isUniversityAdmin) {
              setShowForm(false);
              setError(universityAdminWarning);
              return;
            }

            setError(null);
            setShowForm(true);
          }}
          disabled={authLoading}
          className="flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <Plus size={18} /> Add Course
        </Button>
      </div>

      {showUniversityAdminWarning && (
        <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          You are not the University Admin. Only the University Admin can add
          courses.
        </div>
      )}

      {showForm && isUniversityAdmin && (
        <AddCourseCard
          onClose={() => setShowForm(false)}
          onSave={handleSaveCourse}
        />
      )}

      <div className="mt-4 flex flex-row gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by code, title, university, or department..."
            className="w-full h-11 pl-10 pr-4 text-gray-900 placeholder-gray-400 rounded-md
              border border-gray-300 transition-colors focus:outline-none
              focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]"
          />
        </div>
        <div className="relative hidden sm:block">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-11 pl-3 pr-9 rounded-md border border-gray-300 bg-white text-sm
              text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]"
          >
            <option value="rating_high">Highest rated</option>
            <option value="rating_low">Lowest rated</option>
            <option value="reviews_most">Most reviewed</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={15}
          />
        </div>
        <button
          onClick={() => setShowFilters((p) => !p)}
          className="relative h-11 px-3 flex items-center justify-center gap-1.5 rounded-md
            border border-gray-300 hover:bg-gray-50 transition text-sm text-gray-700"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-[#6155F5] text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {showFilters && (
        <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3 items-end">
            <FilterSelect
              label="University"
              value={universityFilter}
              onChange={(v) => {
                setUniversityFilter(v);
                setDepartmentFilter("all");
              }}
              options={[
                { value: "all", label: "All universities" },
                ...universities.map((u) => ({ value: u, label: u })),
              ]}
            />
            <FilterSelect
              label="Department"
              value={departmentFilter}
              onChange={setDepartmentFilter}
              options={[
                { value: "all", label: "All departments" },
                ...departments.map((d) => ({ value: d, label: d })),
              ]}
            />
            <FilterSelect
              label="Level"
              value={levelFilter}
              onChange={setLevelFilter}
              options={[
                { value: "all", label: "All levels" },
                ...levels.map((level) => ({
                  value: level,
                  label: formatCourseLevel(level),
                })),
              ]}
            />
            <FilterSelect
              label="Language"
              value={languageFilter}
              onChange={setLanguageFilter}
              options={[
                { value: "all", label: "All languages" },
                ...languages.map((l) => ({ value: l, label: l })),
              ]}
            />
            <FilterSelect
              label="Status"
              value={statusFilter}
              onChange={(v) => setStatusFilter(v as typeof statusFilter)}
              options={[
                { value: "all", label: "All statuses" },
                { value: "active", label: "Active" },
                { value: "deleted", label: "Deleted" },
              ]}
            />
            <div className="flex flex-col gap-1 sm:hidden">
              <label className="text-xs text-gray-500 font-medium">
                Sort by
              </label>
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5]"
                >
                  <option value="rating_high">Highest rated</option>
                  <option value="rating_low">Lowest rated</option>
                  <option value="reviews_most">Most reviewed</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={13}
                />
              </div>
            </div>
            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="h-9 px-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      )}

      <p className="mt-3 text-xs text-gray-400">
        {loading
          ? "Loading..."
          : `${filteredCourses.length} course${filteredCourses.length !== 1 ? "s" : ""} found`}
      </p>
      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── Desktop table ── */}
      <div className="hidden md:block mt-2 rounded-xl border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm table-fixed">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">Course</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">
                University
              </th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Level</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">
                Language
              </th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Credits</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Rating</th>
              <th className="text-left px-4 py-3 whitespace-nowrap w-[150px]">
                Metrics
              </th>
              <th className="text-left px-4 py-3 whitespace-nowrap">
                Description
              </th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Reviews</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Status</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-12 text-center text-gray-400 text-sm"
                >
                  Loading courses...
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td
                  colSpan={11}
                  className="px-4 py-12 text-center text-gray-400 text-sm"
                >
                  No courses match your search or filters.
                </td>
              </tr>
            ) : (
              filteredCourses.map((course) => (
                <tr
                  key={course.course_id}
                  onClick={() => setDetailCourse(course)}
                  className={`border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${course.deleted_at ? "opacity-50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 whitespace-nowrap">
                      {course.code}
                    </p>
                    <p className="text-xs text-gray-500 max-w-45 truncate">
                      {course.title}
                    </p>
                    <p className="text-xs text-gray-400 max-w-45 truncate">
                      {course.department}
                    </p>
                  </td>
                  <td className="px-4 py-3 max-w-40">
                    <p className="text-gray-700 truncate">
                      {course.university}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {formatCourseLevel(course.level)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {course.language}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {course.credits} cr.
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Star
                        size={13}
                        className="text-amber-400 fill-amber-400"
                      />
                      <span className="font-medium text-gray-800">
                        {course.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1.5 max-w-[180px]">
                      <span className="inline-flex w-fit items-center rounded-md bg-blue-100 text-blue-800 px-1.5 py-0.5 text-xs font-medium">
                        Exam: {course.metrics.exam}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-md bg-green-100 text-green-800 px-1.5 py-0.5 text-xs font-medium">
                        Workload: {course.metrics.workload}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-md bg-yellow-100 text-yellow-800 px-1.5 py-0.5 text-xs font-medium">
                        Attendance: {course.metrics.attendance}
                      </span>
                      <span className="inline-flex w-fit items-center rounded-md bg-purple-100 text-purple-800 px-1.5 py-0.5 text-xs font-medium">
                        Grading: {course.metrics.grading}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 max-w-50">
                    <p className="text-gray-500 text-xs line-clamp-2">
                      {course.description}
                    </p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {course.number_of_reviews}
                  </td>
                  <td className="px-4 py-3">
                    {course.deleted_at ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">
                        Deleted
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex justify-end gap-3 text-gray-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEdit(course)}
                        disabled={!!course.deleted_at}
                        className="hover:text-blue-500 transition-colors disabled:opacity-30"
                        aria-label="Edit course"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => setPendingDelete(course)}
                        disabled={!!course.deleted_at}
                        className="hover:text-red-500 transition-colors disabled:opacity-30"
                        aria-label="Delete course"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Mobile cards ── */}
      <div className="md:hidden mt-2 flex flex-col gap-4">
        {loading ? (
          <p className="text-gray-400 text-sm text-center py-8">
            Loading courses...
          </p>
        ) : filteredCourses.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No courses match your search or filters.
          </p>
        ) : (
          filteredCourses.map((course) => (
            <div
              key={course.course_id}
              onClick={() => setDetailCourse(course)}
              className={`rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:border-gray-300 transition-colors ${course.deleted_at ? "opacity-50" : ""}`}
            >
              <div className="flex justify-between items-start">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {course.code}
                    </h3>
                    {course.deleted_at ? (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-red-100 text-red-700 shrink-0">
                        Deleted
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-green-100 text-green-700 shrink-0">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {course.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    {course.department}
                  </p>
                </div>
                <div
                  className="flex gap-3 text-gray-400 shrink-0 ml-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => handleEdit(course)}
                    disabled={!!course.deleted_at}
                    className="hover:text-blue-500 transition-colors disabled:opacity-30"
                    aria-label="Edit course"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    onClick={() => setPendingDelete(course)}
                    disabled={!!course.deleted_at}
                    className="hover:text-red-500 transition-colors disabled:opacity-30"
                    aria-label="Delete course"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">University:</span>{" "}
                  {course.university}
                </p>
                <p>
                  <span className="text-gray-400">Level:</span>{" "}
                  <span>{formatCourseLevel(course.level)}</span>
                </p>
                <p>
                  <span className="text-gray-400">Language:</span>{" "}
                  {course.language}
                </p>
                <p>
                  <span className="text-gray-400">Credits:</span>{" "}
                  {course.credits} cr.
                </p>
                <p>
                  <span className="text-gray-400">Rating:</span>{" "}
                  <span className="inline-flex items-center gap-1">
                    <Star size={12} className="text-amber-400 fill-amber-400" />
                    <span className="font-medium">
                      {course.rating.toFixed(1)}
                    </span>
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Reviews:</span>{" "}
                  {course.number_of_reviews}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">
                  Exam: {course.metrics.exam}
                </span>
                <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs">
                  Workload: {course.metrics.workload}
                </span>
                <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-xs">
                  Attendance: {course.metrics.attendance}
                </span>
                <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-xs">
                  Grading: {course.metrics.grading}
                </span>
              </div>
              <p className="mt-3 text-xs text-gray-400 line-clamp-2">
                {course.description}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
