import type { Filters } from "@/types/filters";
import type { RoadmapSummary } from "@/types/roadmap";

type RoadmapFilters = Filters & {
  query?: string;
};

function normalize(value: string | number | null | undefined) {
  return String(value ?? "").toLowerCase().trim();
}

export function filterRoadmaps(
  roadmaps: RoadmapSummary[],
  {
    university = "",
    department = "",
    level = "",
    year = "",
    semester = "",
    query = "",
  }: RoadmapFilters,
): RoadmapSummary[] {
  const normalizedQuery = normalize(query);
  const normalizedUniversity = normalize(university);
  const normalizedDepartment = normalize(department);
  const normalizedLevel = normalize(level);
  const normalizedYear = String(year ?? "").trim();
  const normalizedSemester = normalize(semester);

  return roadmaps.filter((roadmap) => {
    const matchesUniversity =
      !normalizedUniversity ||
      normalize(roadmap.university) === normalizedUniversity;

    const matchesDepartment =
      !normalizedDepartment ||
      normalize(roadmap.department) === normalizedDepartment;

    const matchesLevel =
      !normalizedLevel || normalize(roadmap.level) === normalizedLevel;

    const matchesTerm =
      (!normalizedYear && !normalizedSemester) ||
      roadmap.terms.some((term) => {
        const matchesYear =
          !normalizedYear || String(term.year_number) === normalizedYear;
        const matchesSemester =
          !normalizedSemester || normalize(term.semester) === normalizedSemester;

        return matchesYear && matchesSemester;
      });

    const matchesQuery =
      !normalizedQuery ||
      normalize(roadmap.title).includes(normalizedQuery) ||
      normalize(roadmap.major).includes(normalizedQuery) ||
      normalize(roadmap.university).includes(normalizedQuery) ||
      normalize(roadmap.department).includes(normalizedQuery) ||
      roadmap.terms.some((term) =>
        term.courses.some(
          (course) =>
            normalize(course.code).includes(normalizedQuery) ||
            normalize(course.title).includes(normalizedQuery),
        ),
      );

    return (
      matchesUniversity &&
      matchesDepartment &&
      matchesLevel &&
      matchesTerm &&
      matchesQuery
    );
  });
}
