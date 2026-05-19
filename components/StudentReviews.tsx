"use client";

// Renders the reusable StudentReviews UI component.
import { useState, useEffect, useCallback } from "react";
import StarRating from "@/components/StarRating";
import ReviewFooterBar from "@/components/ReviewFooterBar";
import { FileText, Briefcase, MapPin, Scale } from "lucide-react";

type Review = {
  review_id: number;
  anonymous_name: string;
  semester_taken: string;
  instructor_name: string;
  overall_rating: number;
  review_text: string;
  exam_difficulty_rating: number;
  workload_rating: number;
  attendance_rating: number;
  grading_rating: number;
  upvotes: number;
  downvotes: number;
  net_votes: number;
  user_vote: number | null;
  created_at: string;
};

const SORT_OPTIONS = [
  { label: "Newest", value: "newest" },
  { label: "Oldest", value: "oldest" },
  { label: "Highest rated", value: "rating_high" },
  { label: "Lowest rated", value: "rating_low" },
  { label: "Most voted", value: "most_votes" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

interface Props {
  slug: string;
  courseId: number;
  refreshKey?: number;
}

export default function StudentReviews({ slug, courseId, refreshKey = 0 }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        sort,
        course_id: String(courseId),
      });
      const res = await fetch(`/api/courses/${slug}/reviews?${params}`);
      if (!res.ok) throw new Error("Failed to load reviews");

      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [courseId, slug, sort]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Student Reviews{" "}
          {!loading && (
            <span className="text-gray-500 font-normal">
              ({reviews.length})
            </span>
          )}
        </h2>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6155F5] sm:w-auto"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="text-gray-400 text-center py-10">Loading reviews...</p>
      )}

      {!loading && error && (
        <p className="text-red-500 text-center py-10">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="text-gray-400 text-center py-10">
          No reviews yet. Be the first to review this course!
        </p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div
              key={r.review_id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {r.anonymous_name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Taken {r.semester_taken} - Instructor: {r.instructor_name}
                  </p>
                </div>
                <StarRating value={r.overall_rating} readOnly />
              </div>

              <p className="mt-4 text-gray-700 leading-7 text-[15px]">
                {r.review_text}
              </p>

              <div className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <FileText className="h-5 w-5 text-gray-400" />
                    <span className="text-sm sm:text-base">
                      Exam: {r.exam_difficulty_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Briefcase className="h-5 w-5 text-gray-400" />
                    <span className="text-sm sm:text-base">
                      Workload: {r.workload_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <MapPin className="h-5 w-5 text-gray-400" />
                    <span className="text-sm sm:text-base">
                      Attendance: {r.attendance_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Scale className="h-5 w-5 text-gray-400" />
                    <span className="text-sm sm:text-base">
                      Grading: {r.grading_rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <ReviewFooterBar
                reviewId={r.review_id}
                initialUpvotes={r.upvotes}
                initialDownvotes={r.downvotes}
                initialUserVote={r.user_vote}
                timeAgo={timeAgo(r.created_at)}
                onVoteChange={(summary) => {
                  setReviews((prev) =>
                    prev.map((review) =>
                      review.review_id === r.review_id
                        ? { ...review, ...summary }
                        : review,
                    ),
                  );
                }}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
