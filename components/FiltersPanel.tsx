"use client";

// Renders the reusable FiltersPanel UI component.
import { useEffect, useMemo, useState } from "react";
import Button from "@/components/Button";
import { Filters } from "@/types/filters";
import { formatCourseLevel } from "@/lib/courseLevels";

export type DepartmentFilterOption =
  | string
  | {
      name: string;
      university?: string;
    };

export type LevelFilterOption =
  | string
  | {
      value: string;
      university?: string;
    };

interface FiltersPanelProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  universities: string[];
  departments: DepartmentFilterOption[];
  languages: string[];
  levels: LevelFilterOption[];
  onApply?: () => void;
  onReset?: () => void;
  showLanguage?: boolean;
}

function uniqueSorted(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).sort((a, b) =>
    a.localeCompare(b),
  );
}

function uniqueInOrder(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

function getDepartmentName(department: DepartmentFilterOption) {
  return typeof department === "string" ? department : department.name;
}

function getLevelValue(level: LevelFilterOption) {
  return typeof level === "string" ? level : level.value;
}

function departmentBelongsToUniversity(
  department: DepartmentFilterOption,
  university: string,
) {
  return (
    !university ||
    typeof department === "string" ||
    department.university === university
  );
}

function levelBelongsToUniversity(level: LevelFilterOption, university: string) {
  return (
    !university || typeof level === "string" || level.university === university
  );
}

export default function FiltersPanel({
  filters,
  setFilters,
  universities,
  departments,
  languages,
  levels,
  onApply,
  onReset,
  showLanguage = true,
}: FiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);

  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const departmentOptions = useMemo(
    () =>
      uniqueSorted(
        departments
          .filter((department) =>
            departmentBelongsToUniversity(department, draftFilters.university),
          )
          .map(getDepartmentName),
      ),
    [departments, draftFilters.university],
  );

  const options = useMemo(
    () => ({
      universities: uniqueSorted(universities),
      departments: departmentOptions,
      languages: uniqueSorted(languages),
      levels: uniqueInOrder(
        levels
          .filter((level) =>
            levelBelongsToUniversity(level, draftFilters.university),
          )
          .map(getLevelValue),
      ),
    }),
    [departmentOptions, draftFilters.university, languages, levels, universities],
  );

  useEffect(() => {
    if (
      departments.length > 0 &&
      draftFilters.department &&
      !departmentOptions.includes(draftFilters.department)
    ) {
      setDraftFilters((prev) => ({ ...prev, department: "" }));
    }
  }, [departmentOptions, departments.length, draftFilters.department]);

  useEffect(() => {
    if (
      levels.length > 0 &&
      draftFilters.level &&
      !options.levels.includes(draftFilters.level)
    ) {
      setDraftFilters((prev) => ({ ...prev, level: "" }));
    }
  }, [draftFilters.level, levels.length, options.levels]);

  const handleDraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "university" ? { department: "", level: "" } : {}),
    }));
  };

  const handleApply = () => {
    setFilters(draftFilters);
    onApply?.();
  };

  const handleReset = () => {
    const reset: Filters = {
      university: "",
      department: "",
      language: "",
      level: "",
      year: "",
      semester: "",
    };
    setFilters(reset);
    setDraftFilters(reset);
    onReset?.();
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex w-full flex-col flex-wrap gap-2 md:flex-col lg:flex-row lg:gap-4">
            <select
              name="university"
              value={draftFilters.university}
              onChange={handleDraftChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none lg:w-auto"
            >
              <option value="">All Universities</option>
              {options.universities.map((university) => (
                <option key={university} value={university}>
                  {university}
                </option>
              ))}
            </select>

            <select
              name="department"
              value={draftFilters.department}
              onChange={handleDraftChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none lg:w-auto"
            >
              <option value="">All Departments</option>
              {options.departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            {showLanguage && (
              <select
                name="language"
                value={draftFilters.language}
                onChange={handleDraftChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none lg:w-auto"
              >
                <option value="">Any Language</option>
                {options.languages.map((language) => (
                  <option key={language} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            )}

            <select
              name="level"
              value={draftFilters.level}
              onChange={handleDraftChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none lg:w-auto"
            >
              <option value="">Any Level</option>
              {options.levels.map((level) => (
                <option key={level} value={level}>
                  {formatCourseLevel(level)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex shrink-0 gap-2">
            <Button onClick={handleApply} className="w-full text-sm lg:w-auto">
              Apply
            </Button>
            <Button
              onClick={handleReset}
              className="w-full text-sm lg:w-auto"
              variant="elevated"
            >
              Reset
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:gap-4">
          <select
            name="year"
            value={draftFilters.year || ""}
            onChange={handleDraftChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none sm:w-auto"
          >
            <option value="">Any Year</option>
            <option value="1">Year 1 (200-299)</option>
            <option value="2">Year 2 (300-399)</option>
            <option value="3">Year 3 (400-499)</option>
            <option value="4">Year 4 (500-599)</option>
          </select>

          <select
            name="semester"
            value={draftFilters.semester || ""}
            onChange={handleDraftChange}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none sm:w-auto"
          >
            <option value="">Any Semester</option>
            <option value="fall">Fall</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
          </select>
        </div>
      </div>
    </div>
  );
}
