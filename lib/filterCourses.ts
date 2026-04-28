import { Course } from "@/types/course";

interface CourseFilters {
  university?: string;
  department?: string;
  level?: string;
  language?: string;
  year?: string;
  semester?: string;
  query?: string;
}

export function filterCourses(
  courses: Course[],
  {
    university = "",
    department = "",
    language = "",
    level = "",
    year = "",
    semester = "",
    query = "",
  }: CourseFilters,
): Course[] {
  const normalizedQuery = query.toLowerCase().trim();
  const normalizedUniversity = university.toLowerCase().trim();
  const normalizedDepartment = department.toLowerCase().trim();
  const normalizedLanguage = language.toLowerCase().trim();
  const normalizedLevel = level.toLowerCase().trim();
  const normalizedYear = year.trim();
  const normalizedSemester = semester.toLowerCase().trim();

  return courses.filter((course) => {
    const matchesUniversity =
      !normalizedUniversity ||
      course.university.toLowerCase() === normalizedUniversity;

    const matchesDepartment =
      !normalizedDepartment ||
      course.department.toLowerCase() === normalizedDepartment;

    const matchesLanguage =
      !normalizedLanguage ||
      course.language.toLowerCase() === normalizedLanguage;

    const matchesLevel =
      !normalizedLevel || course.level.toLowerCase() === normalizedLevel;

    const matchesYear =
      !normalizedYear || String(course.year ?? "") === normalizedYear;

    const matchesSemester =
      !normalizedSemester ||
      String(course.semester ?? "").toLowerCase() === normalizedSemester;

    const matchesQuery =
      !normalizedQuery ||
      course.title.toLowerCase().includes(normalizedQuery) ||
      course.code.toLowerCase().includes(normalizedQuery) ||
      course.university.toLowerCase().includes(normalizedQuery) ||
      course.department.toLowerCase().includes(normalizedQuery);

    return (
      matchesUniversity &&
      matchesDepartment &&
      matchesLanguage &&
      matchesLevel &&
      matchesYear &&
      matchesSemester &&
      matchesQuery
    );
  });
}
