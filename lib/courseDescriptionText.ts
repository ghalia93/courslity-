// Keeps course descriptions consistent wherever they are displayed.
type CourseDescriptionInput = {
  description?: string | null;
};

export function normalizeCourseDescription({
  description,
}: CourseDescriptionInput) {
  return String(description || "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(
      "civilization impact on the modern world",
      "civilization's impact on the modern world",
    );
}
