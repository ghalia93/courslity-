// Filters course lists by search text and selected course facets.
import { Course } from "@/types/course";
import {
  getSemesterFromCourseCode,
  getYearFromCourseCode,
} from "@/lib/courseCode";
import { getUniversityAliasSearchTerms } from "@/lib/universityAliases";

interface CourseFilters {
  university?: string;
  department?: string;
  major?: string;
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
    major = "",
    language = "",
    level = "",
    year = "",
    semester = "",
    query = "",
  }: CourseFilters,
): Course[] {
  const normalizedQuery = query.toLowerCase().trim();
  const universityAliasSearchTerms = getUniversityAliasSearchTerms(query).map(
    (term) => term.toLowerCase(),
  );
  const normalizedUniversity = university.toLowerCase().trim();
  const normalizedDepartment = department.toLowerCase().trim();
  const normalizedMajor = major.toLowerCase().trim();
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

    const matchesMajor =
      !normalizedMajor ||
      (course.majors ?? []).some(
        (courseMajor) => courseMajor.toLowerCase() === normalizedMajor,
      );

    const matchesLanguage =
      !normalizedLanguage ||
      course.language.toLowerCase() === normalizedLanguage;

    const matchesLevel =
      !normalizedLevel || course.level.toLowerCase() === normalizedLevel;

    const courseYears =
      course.years && course.years.length > 0
        ? course.years
        : [course.year ?? getYearFromCourseCode(course.code)].filter(
            (value): value is number => value !== null && value !== undefined,
          );
    const courseSemesters =
      course.semesters && course.semesters.length > 0
        ? course.semesters
        : [course.semester ?? getSemesterFromCourseCode(course.code)].filter(
            (value): value is string => Boolean(value),
          );

    const matchesYear =
      !normalizedYear ||
      courseYears.some((courseYear) => String(courseYear) === normalizedYear);

    const matchesSemester =
      !normalizedSemester ||
      courseSemesters.some(
        (courseSemester) =>
          String(courseSemester).toLowerCase() === normalizedSemester,
      );

    const matchesQuery =
      !normalizedQuery ||
      course.title.toLowerCase().includes(normalizedQuery) ||
      course.code.toLowerCase().includes(normalizedQuery) ||
      course.university.toLowerCase().includes(normalizedQuery) ||
      universityAliasSearchTerms.some((term) =>
        course.university.toLowerCase().includes(term),
      ) ||
      course.department.toLowerCase().includes(normalizedQuery);

    return (
      matchesUniversity &&
      matchesDepartment &&
      matchesMajor &&
      matchesLanguage &&
      matchesLevel &&
      matchesYear &&
      matchesSemester &&
      matchesQuery
    );
  });
}
