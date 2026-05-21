"use client";

// Renders university reviews on the public university page.
import { useCallback, useEffect, useState } from "react";
import {
  BadgeDollarSign,
  Building2,
  GraduationCap,
  Sparkles,
  Users,
} from "lucide-react";
import StarRating from "@/components/StarRating";
import ReviewFooterBar from "@/components/ReviewFooterBar";

type UniversityReview = {
  review_id: number;
  anonymous_name: string;
  overall_rating: number;
  review_text: string;
  academic_quality_rating: number;
  professors_rating: number;
  facilities_rating: number;
  tuition_value_rating: number;
  student_life_rating: number;
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
  if (mins < 60) return `${Math.max(0, mins)}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  return `${months}mo ago`;
}

type UniversityReviewsProps = {
  universityId: number;
  refreshKey?: number;
};

export default function UniversityReviews({
  universityId,
  refreshKey = 0,
}: UniversityReviewsProps) {
  const [reviews, setReviews] = useState<UniversityReview[]>([]);
  const [sort, setSort] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({ sort });
      const res = await fetch(
        `/api/universities/${universityId}/reviews?${params.toString()}`,
      );
      if (!res.ok) throw new Error("Failed to load reviews");

      const data = await res.json();
      setReviews(data.reviews ?? []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [sort, universityId]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews, refreshKey]);

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          University Reviews{" "}
          {!loading && (
            <span className="font-normal text-gray-500">
              ({reviews.length})
            </span>
          )}
        </h2>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#6155F5] sm:w-auto"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <p className="py-10 text-center text-gray-400">Loading reviews...</p>
      )}

      {!loading && error && (
        <p className="py-10 text-center text-red-500">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <p className="py-10 text-center text-gray-400">
          No university reviews yet. Be the first to review this university!
        </p>
      )}

      {!loading && !error && reviews.length > 0 && (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div
              key={review.review_id}
              className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-6 lg:p-7"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {review.anonymous_name}
                  </h3>
                  <p className="mt-0.5 text-sm text-gray-500">
                    Shared a university experience
                  </p>
                </div>
                <StarRating value={review.overall_rating} readOnly />
              </div>

              <p className="mt-4 text-[15px] leading-7 text-gray-700">
                {review.review_text}
              </p>

              <div className="mt-6 rounded-xl border border-gray-200 bg-white px-4 py-4 sm:px-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                  <div className="flex items-center gap-3 text-gray-600">
                    <GraduationCap className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      Academic: {review.academic_quality_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Users className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      Professors: {review.professors_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Building2 className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      Facilities: {review.facilities_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <BadgeDollarSign className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      Tuition: {review.tuition_value_rating}/5
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-600">
                    <Sparkles className="h-5 w-5 text-gray-400" />
                    <span className="text-sm">
                      Life: {review.student_life_rating}/5
                    </span>
                  </div>
                </div>
              </div>

              <ReviewFooterBar
                reviewId={review.review_id}
                voteEndpointBase="/api/university-reviews"
                initialUpvotes={review.upvotes}
                initialDownvotes={review.downvotes}
                initialUserVote={review.user_vote}
                timeAgo={timeAgo(review.created_at)}
                onVoteChange={(summary) => {
                  setReviews((prev) =>
                    prev.map((item) =>
                      item.review_id === review.review_id
                        ? { ...item, ...summary }
                        : item,
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
