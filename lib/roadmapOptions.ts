// Defines shared roadmap option labels and ordering helpers.
import type { RoadmapSemester } from "@/types/roadmap";

export const ROADMAP_SEMESTER_OPTIONS: {
  label: string;
  value: RoadmapSemester;
}[] = [
  { label: "Fall", value: "fall" },
  { label: "Spring", value: "spring" },
  { label: "Summer", value: "summer" },
];

export const ROADMAP_SEMESTER_VALUES = ROADMAP_SEMESTER_OPTIONS.map(
  (semester) => semester.value,
);

export function formatRoadmapSemester(semester: string) {
  return (
    ROADMAP_SEMESTER_OPTIONS.find((option) => option.value === semester)
      ?.label ?? semester
  );
}

