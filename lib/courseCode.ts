// Normalizes and formats course codes for matching and display.
export function getCourseNumber(code: string): number | null {
  const match = code.match(/\d+/);
  if (!match) return null;

  return Number.parseInt(match[0], 10);
}

export function getYearFromCourseCode(code: string): number | null {
  const courseNumber = getCourseNumber(code);
  if (courseNumber == null) return null;

  if (courseNumber >= 200 && courseNumber <= 299) return 1;
  if (courseNumber >= 300 && courseNumber <= 399) return 2;
  if (courseNumber >= 400 && courseNumber <= 499) return 3;
  if (courseNumber >= 500 && courseNumber <= 599) return 4;

  return null;
}

export function getSemesterFromCourseCode(code: string): string | null {
  const courseNumber = getCourseNumber(code);
  if (courseNumber == null) return null;

  const lastTwoDigits = courseNumber % 100;

  if (lastTwoDigits >= 75) return "summer";
  if (lastTwoDigits >= 50) return "spring";
  return "fall";
}
