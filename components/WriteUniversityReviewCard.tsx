"use client";

// Renders the university review form.
import { useState } from "react";
import Button from "@/components/Button";
import StarRating from "@/components/StarRating";
import SliderRow from "@/components/SliderRow";

type WriteUniversityReviewCardProps = {
  universityId: number;
  onSubmit: () => void;
  onCancel: () => void;
};

function calculateOverallRating(values: number[]) {
  return Number(
    (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2),
  );
}

export default function WriteUniversityReviewCard({
  universityId,
  onSubmit,
  onCancel,
}: WriteUniversityReviewCardProps) {
  const [academicQuality, setAcademicQuality] = useState(3);
  const [professors, setProfessors] = useState(3);
  const [facilities, setFacilities] = useState(3);
  const [tuitionValue, setTuitionValue] = useState(3);
  const [studentLife, setStudentLife] = useState(3);
  const [review, setReview] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const overallRating = calculateOverallRating([
    academicQuality,
    professors,
    facilities,
    tuitionValue,
    studentLife,
  ]);
  const canSubmit = review.trim().length > 0;

  function resetForm() {
    setAcademicQuality(3);
    setProfessors(3);
    setFacilities(3);
    setTuitionValue(3);
    setStudentLife(3);
    setReview("");
    setError(null);
  }

  async function handleSubmit() {
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/universities/${universityId}/reviews`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          academicQuality,
          professors,
          facilities,
          tuitionValue,
          studentLife,
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
      <h2 className="text-xl font-semibold text-gray-900">
        Leave Your University Review
      </h2>

      {error && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5 space-y-2">
        <div className="text-sm font-medium text-gray-700">
          Overall Rating
        </div>
        <StarRating value={overallRating} readOnly />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SliderRow
          label="Academic Quality (1-5)"
          value={academicQuality}
          onChange={setAcademicQuality}
          leftLabel="Weak"
          rightLabel="Excellent"
        />
        <SliderRow
          label="Professors (1-5)"
          value={professors}
          onChange={setProfessors}
          leftLabel="Poor"
          rightLabel="Supportive"
        />
        <SliderRow
          label="Campus Facilities (1-5)"
          value={facilities}
          onChange={setFacilities}
          leftLabel="Limited"
          rightLabel="Modern"
        />
        <SliderRow
          label="Tuition Value (1-5)"
          value={tuitionValue}
          onChange={setTuitionValue}
          leftLabel="Expensive"
          rightLabel="Worth it"
        />
        <SliderRow
          label="Student Life (1-5)"
          value={studentLife}
          onChange={setStudentLife}
          leftLabel="Quiet"
          rightLabel="Active"
        />
      </div>

      <div className="mt-6 space-y-2">
        <div className="text-sm font-medium text-gray-700">Your Review</div>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Share your experience with this university..."
          className="min-h-[140px] w-full resize-none rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:ring-2 focus:ring-[#6155F5]/30"
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
            !canSubmit || submitting ? "cursor-not-allowed opacity-50" : ""
          }
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </Button>
      </div>
    </div>
  );
}
