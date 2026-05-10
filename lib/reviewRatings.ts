// Calculates overall review ratings from individual rating fields.
export type ReviewRatingInputs = {
  examDifficulty: number;
  attendanceStrictness: number;
  workload: number;
  gradingFairness: number;
};

function normalizeRating(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(5, Math.max(1, value));
}

export function calculateOverallRating({
  examDifficulty,
  attendanceStrictness,
  workload,
  gradingFairness,
}: ReviewRatingInputs): number {
  // Lower difficulty, attendance strictness, and workload are better; higher grading fairness is better.
  const examScore = 6 - normalizeRating(examDifficulty);
  const attendanceScore = 6 - normalizeRating(attendanceStrictness);
  const workloadScore = 6 - normalizeRating(workload);
  const gradingScore = normalizeRating(gradingFairness);

  return Number(
    ((examScore + attendanceScore + workloadScore + gradingScore) / 4).toFixed(
      2,
    ),
  );
}
