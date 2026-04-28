export const COURSE_LEVEL_OPTIONS = [
  { label: "Freshmen", value: "freshman" },
  { label: "Undergraduate", value: "undergraduate" },
  { label: "Graduate", value: "graduate" },
  { label: "Master Degree", value: "master_degree" },
  { label: "Doctoral", value: "doctoral" },
] as const;

export type CourseLevel = (typeof COURSE_LEVEL_OPTIONS)[number]["value"];

export const COURSE_LEVEL_VALUES = COURSE_LEVEL_OPTIONS.map(
  (level) => level.value,
);

export function formatCourseLevel(level: string) {
  const option = COURSE_LEVEL_OPTIONS.find((item) => item.value === level);
  if (option) return option.label;

  return level
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function sortCourseLevels(levels: string[]) {
  const unique = Array.from(new Set(levels.filter(Boolean)));
  const known = COURSE_LEVEL_VALUES.filter((level) => unique.includes(level));
  const unknown = unique
    .filter((level) => !COURSE_LEVEL_VALUES.includes(level as CourseLevel))
    .sort((a, b) => a.localeCompare(b));

  return [...known, ...unknown];
}
