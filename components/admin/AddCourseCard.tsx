"use client";

// Renders the admin AddCourseCard interface component.
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "@/components/Button";
import SearchableDropdownField from "@/components/SearchableDropdown";
import {
  COURSE_LEVEL_OPTIONS,
  type CourseLevel,
  formatCourseLevel,
} from "@/lib/courseLevels";

export type AddCoursePayload = {
  code: string;
  title: string;
  description: string;
  credits: number;
  language: string;
  level: CourseLevel;
  department_id: number;
  major_id: number;
};

export type CreatedCourse = AddCoursePayload & {
  course_id: number;
  department: string;
  majorIds: number[];
  majors: string[];
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

type University = {
  university_id: number;
  name: string;
  email_domain?: string;
};

type Department = {
  department_id: number;
  name: string;
};

type Major = {
  major_id: number;
  name: string;
};

type Props = {
  onClose: () => void;
  onSave: (course: CreatedCourse) => void;
};

const LANGUAGES = ["English", "Arabic", "French", "German", "Spanish", "Other"];

export default function AddCourseCard({ onClose, onSave }: Props) {
  const [universities, setUniversities] = useState<University[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [majors, setMajors] = useState<Major[]>([]);
  const [loadingUniversities, setLoadingUniversities] = useState(true);
  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingMajors, setLoadingMajors] = useState(false);

  const [universityInput, setUniversityInput] = useState("");
  const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(
    null,
  );
  const [departmentInput, setDepartmentInput] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(
    null,
  );
  const [majorInput, setMajorInput] = useState("");
  const [selectedMajorId, setSelectedMajorId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    code: "",
    title: "",
    description: "",
    credits: "",
    language: "English",
    level: "freshman" as CourseLevel,
  });

  const [saving, setSaving] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    setLoadingUniversities(true);
    fetch("/api/admin/universities", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUniversities(data.universities ?? []);
      })
      .catch(() => setApiError("Failed to load universities."))
      .finally(() => setLoadingUniversities(false));
  }, []);

  useEffect(() => {
    setDepartments([]);
    setMajors([]);
    setDepartmentInput("");
    setSelectedDepartmentId(null);
    setMajorInput("");
    setSelectedMajorId(null);

    if (selectedUniversityId == null) return;

    setLoadingDepartments(true);
    fetch(`/api/admin/universities/${selectedUniversityId}/departments`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setDepartments(data.departments ?? []);
      })
      .catch(() => setApiError("Failed to load departments."))
      .finally(() => setLoadingDepartments(false));
  }, [selectedUniversityId]);

  useEffect(() => {
    setMajors([]);
    setMajorInput("");
    setSelectedMajorId(null);

    if (selectedUniversityId == null || selectedDepartmentId == null) return;

    setLoadingMajors(true);
    fetch(
      `/api/admin/universities/${selectedUniversityId}/departments/${selectedDepartmentId}/majors`,
      {
        credentials: "include",
      },
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMajors(data.majors ?? []);
      })
      .catch(() => setApiError("Failed to load majors."))
      .finally(() => setLoadingMajors(false));
  }, [selectedDepartmentId, selectedUniversityId]);

  function handleTextChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit() {
    setApiError(null);

    if (!selectedUniversityId) {
      setApiError("Please select a university from the list.");
      return;
    }

    if (!selectedDepartmentId) {
      setApiError("Please select a department from the selected university.");
      return;
    }

    if (!selectedMajorId) {
      setApiError("Please select a major from the selected department.");
      return;
    }

    if (!formData.code.trim() || !formData.title.trim()) {
      setApiError("Course code and title are required.");
      return;
    }

    const creditsNum = Number(formData.credits);
    if (
      !formData.credits ||
      Number.isNaN(creditsNum) ||
      creditsNum < 1 ||
      creditsNum > 9
    ) {
      setApiError("Credits must be a number between 1 and 9.");
      return;
    }

    const payload: AddCoursePayload = {
      code: formData.code.trim(),
      title: formData.title.trim(),
      description: formData.description.trim() || "No description yet.",
      credits: creditsNum,
      language: formData.language,
      level: formData.level,
      department_id: selectedDepartmentId,
      major_id: selectedMajorId,
    };

    try {
      setSaving(true);
      const res = await fetch("/api/admin/courses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setApiError(data?.message ?? "Failed to create course.");
        return;
      }

      onSave(data.course as CreatedCourse);
      onClose();
    } catch {
      setApiError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const universityNames = universities.map((university) => university.name);
  const departmentNames = departments.map((department) => department.name);
  const majorNames = majors.map((major) => major.name);
  const departmentPlaceholder =
    selectedUniversityId == null
      ? "Select university first"
      : loadingDepartments
        ? "Loading departments..."
        : departments.length === 0
          ? "Add departments in University Setup first"
          : "Select department";
  const majorPlaceholder =
    selectedDepartmentId == null
      ? "Select department first"
      : loadingMajors
        ? "Loading majors..."
        : majors.length === 0
          ? "Add majors in University Setup first"
          : "Select major";
  const levelLabel =
    selectedUniversityId == null ? "" : formatCourseLevel(formData.level);

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            Add New Course
          </h2>
          <p className="text-sm text-gray-500">
            Select a university, department, and major, then add the course
            details.
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          aria-label="Close"
        >
          <X size={18} />
        </button>
      </div>

      {apiError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <SearchableDropdownField
          value={universityInput}
          options={universityNames}
          placeholder={
            loadingUniversities ? "Loading universities..." : "Select university"
          }
          onChange={(typed) => {
            setUniversityInput(typed);
            const match = universities.find(
              (university) =>
                university.name.toLowerCase() === typed.trim().toLowerCase(),
            );
            setSelectedUniversityId(match?.university_id ?? null);
          }}
        />

        <SearchableDropdownField
          value={departmentInput}
          options={selectedUniversityId == null ? [] : departmentNames}
          placeholder={departmentPlaceholder}
          onChange={(typed) => {
            setDepartmentInput(typed);
            const match = departments.find(
              (department) =>
                department.name.toLowerCase() === typed.trim().toLowerCase(),
            );
            setSelectedDepartmentId(match?.department_id ?? null);
          }}
        />

        <SearchableDropdownField
          value={majorInput}
          options={selectedDepartmentId == null ? [] : majorNames}
          placeholder={majorPlaceholder}
          onChange={(typed) => {
            setMajorInput(typed);
            const match = majors.find(
              (major) =>
                major.name.toLowerCase() === typed.trim().toLowerCase(),
            );
            setSelectedMajorId(match?.major_id ?? null);
          }}
        />

        <input
          name="code"
          value={formData.code}
          onChange={handleTextChange}
          placeholder="Course Code (e.g. CMPS 101)"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
        />

        <input
          name="title"
          value={formData.title}
          onChange={handleTextChange}
          placeholder="Course Title"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
        />

        <input
          name="credits"
          value={formData.credits}
          onChange={handleTextChange}
          placeholder="Credits (1-9)"
          type="number"
          min={1}
          max={9}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
        />

        <SearchableDropdownField
          value={levelLabel}
          options={
            selectedUniversityId == null
              ? []
              : COURSE_LEVEL_OPTIONS.map((level) => level.label)
          }
          placeholder={
            selectedUniversityId == null ? "Select university first" : "Select level"
          }
          onChange={(typed) => {
            const selectedLevel = COURSE_LEVEL_OPTIONS.find(
              (level) => level.label === typed,
            );
            if (!selectedLevel) return;
            setFormData((prev) => ({
              ...prev,
              level: selectedLevel.value,
            }));
          }}
        />

        <SearchableDropdownField
          value={formData.language}
          options={LANGUAGES}
          placeholder="Select language"
          onChange={(typed) =>
            setFormData((prev) => ({ ...prev, language: typed }))
          }
        />

        <textarea
          name="description"
          value={formData.description}
          onChange={handleTextChange}
          placeholder="Course Description"
          rows={4}
          className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-[#6155F5] md:col-span-2"
        />
      </div>

      <div className="mt-4 flex justify-end gap-3">
        <Button onClick={onClose} variant="elevated" disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="primary" disabled={saving}>
          {saving ? "Saving..." : "Save Course"}
        </Button>
      </div>
    </div>
  );
}
