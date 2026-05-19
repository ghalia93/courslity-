"use client";

// Renders the reusable WriteReviewCard UI component.
import { useState } from "react";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import SliderRow from "@/components/SliderRow";
import { calculateOverallRating } from "@/lib/reviewRatings";

const SEMESTER_OPTIONS = ["Fall", "Spring", "Summer"];

type WriteReviewCardProps = {
  slug: string;
  courseId: number;
  onSubmit: () => void;
  onCancel: () => void;
};

export default function WriteReviewCard({
  slug,
  courseId,
  onSubmit,
  onCancel,
}: WriteReviewCardProps) {
  const [instructor, setInstructor] = useState("");
  const [semester, setSemester] = useState("");
  const [examDifficulty, setExamDifficulty] = useState(3);
  const [attendanceStrictness, setAttendanceStrictness] = useState(3);
  const [workload, setWorkload] = useState(3);
  const [gradingFairness, setGradingFairness] = useState(3);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const overallRating = calculateOverallRating({
    examDifficulty,
    attendanceStrictness,
    workload,
    gradingFairness,
  });

  const canSubmit =
    instructor.trim().length > 0 &&
    semester.trim().length > 0 &&
    review.trim().length > 0;

  function resetForm() {
    setInstructor("");
    setSemester("");
    setExamDifficulty(3);
    setAttendanceStrictness(3);
    setWorkload(3);
    setGradingFairness(3);
    setReview("");
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const params = new URLSearchParams({ course_id: String(courseId) });
      const res = await fetch(`/api/courses/${slug}/reviews?${params}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          instructor: instructor.trim(),
          semester: semester.trim(),
          examDifficulty,
          attendanceStrictness,
          workload,
          gradingFairness,
          review: review.trim(),
        }),
      });

      const data = await res
        .json()
        .catch(() => ({} as { message?: string }));

      if (!res.ok) {
        setError(data?.message ?? "Failed to submit review");
        return;
      }

      resetForm();
      onSubmit();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCancel() {
    resetForm();
    onCancel();
  }

  return (
    <div className="w-full rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-xl font-semibold text-gray-900">Leave Your Review</h2>

      {error && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Overall Rating
          </div>
          <StarRating value={overallRating} readOnly />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Instructor&apos;s Name
          </div>
          <input
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]/30"
          />
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-gray-700">
            Semester Taken
          </div>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]/30"
          >
            <option value="" disabled>
              Select semester
            </option>
            {SEMESTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SliderRow
          label="Exam Difficulty (1-5)"
          value={examDifficulty}
          onChange={setExamDifficulty}
          leftLabel="Easy"
          rightLabel="Very Hard"
        />
        <SliderRow
          label="Attendance Strictness (1-5)"
          value={attendanceStrictness}
          onChange={setAttendanceStrictness}
          leftLabel="Relaxed"
          rightLabel="Very Strict"
        />
        <SliderRow
          label="Workload (1-5)"
          value={workload}
          onChange={setWorkload}
          leftLabel="Light"
          rightLabel="Very Heavy"
        />
        <SliderRow
          label="Grading Fairness (1-5)"
          value={gradingFairness}
          onChange={setGradingFairness}
          leftLabel="Unfair"
          rightLabel="Very Fair"
        />
      </div>

      <div className="mt-6 space-y-2">
        <div className="text-sm font-medium text-gray-700">Your Review</div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this course..."
          className="w-full min-h-[140px] resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]/30"
        />
      </div>

      <div className="mt-6 grid gap-3 sm:flex sm:justify-end">
        <Button variant="elevated" onClick={handleCancel} disabled={submitting}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!canSubmit || submitting}
          className={
            !canSubmit || submitting ? "opacity-50 cursor-not-allowed" : ""
          }
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
