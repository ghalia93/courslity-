"use client";

import { useState, useEffect } from "react";
import Button from "@/components/Button";
import { Filters } from "@/types/filters";

interface FiltersPanelProps {
  filters: Filters;
  setFilters: (filters: Filters) => void;
  onApply?: () => void;
  onReset?: () => void;
}

export default function FiltersPanel({
  filters,
  setFilters,
  onApply,
  onReset,
}: FiltersPanelProps) {
  const [draftFilters, setDraftFilters] = useState<Filters>(filters);

  // Keep draft in sync if parent resets filters externally
  useEffect(() => {
    setDraftFilters(filters);
  }, [filters]);

  const handleDraftChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
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
  <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
    <div className="flex flex-col gap-4">
      {/* Top row */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col md:flex-col lg:flex-row flex-wrap gap-2 lg:gap-4 w-full">
          <select
            name="university"
            value={draftFilters.university}
            onChange={handleDraftChange}
            className="w-full lg:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">All Universities</option>
            <option value="American University of Beirut">
              American University of Beirut
            </option>
            <option value="University of Balamand">
              University of Balamand
            </option>
            <option value="Lebanese American University">
              Lebanese American University
            </option>
            <option value="Beirut Arab University">
              Beirut Arab University
            </option>
            <option value="Lebanese International University">
              Lebanese International University
            </option>
            <option value="Université Saint-Joseph de Beyrouth">
              Université Saint-Joseph de Beyrouth
            </option>
          </select>

          <select
            name="department"
            value={draftFilters.department}
            onChange={handleDraftChange}
            className="w-full lg:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Mathematics">Mathematics</option>
          </select>

          <select
            name="language"
            value={draftFilters.language}
            onChange={handleDraftChange}
            className="w-full lg:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">Any Language</option>
            <option value="English">English</option>
            <option value="Arabic">Arabic</option>
            <option value="French">French</option>
          </select>

          <select
            name="level"
            value={draftFilters.level}
            onChange={handleDraftChange}
            className="w-full lg:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">Any Level</option>
            <option value="Undergraduate">Undergraduate</option>
            <option value="Graduate">Graduate</option>
            <option value="Phd">Phd</option>
          </select>
        </div>

        <div className="flex gap-2 shrink-0">
          <Button onClick={handleApply} className="text-sm w-full lg:w-auto">
            Apply
          </Button>
          <Button
            onClick={handleReset}
            className="text-sm w-full lg:w-auto"
            variant="elevated"
          >
            Reset
          </Button>
        </div>
      </div>

      {/* Bottom row: only for Undergraduate */}
      {draftFilters.level === "Undergraduate" && (
        <div className="flex flex-col sm:flex-row gap-2 lg:gap-4">
          <select
            name="year"
            value={draftFilters.year || ""}
            onChange={handleDraftChange}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">Any Year</option>
            <option value="1">Year 1</option>
            <option value="2">Year 2</option>
            <option value="3">Year 3</option>
            <option value="4">Year 4</option>
          </select>

          <select
            name="semester"
            value={draftFilters.semester || ""}
            onChange={handleDraftChange}
            className="w-full sm:w-auto rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 focus:border-[#6155F5] focus:outline-none"
          >
            <option value="">Any Semester</option>
            <option value="fall">Fall</option>
            <option value="spring">Spring</option>
            <option value="summer">Summer</option>
          </select>
        </div>
      )}
    </div>
  </div>
);

        <div className="flex gap-2 mt-2 lg:mt-0">
          <Button onClick={handleApply} className="text-sm w-full lg:w-auto">
            Apply
          </Button>
          <Button
            onClick={handleReset}
            className="text-sm w-full lg:w-auto"
            variant="elevated"
          >
            Reset
          </Button>
        </div>
}
