"use client";

// Renders the admin reviews page.
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  Star,
  Trash2,
  EyeOff,
  ChevronDown,
  ArrowBigUp,
  ArrowBigDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import ConfirmModal from "@/components/admin/ConfirmModal";

type ReviewRow = {
  review_id: string; // keep as string to match existing UI usage
  review_type: "course" | "university";
  reviewer_name: string;
  reviewer_email: string;
  course_code: string;
  course_title: string;
  university: string;
  department: string;
  semester_taken: string;
  review_text: string;
  instructor_name: string;
  overall_rating: number;
  grading_rating: number;
  workload_rating: number;
  attendance_rating: number;
  exam_difficulty_rating: number;
  academic_quality_rating?: number;
  professors_rating?: number;
  facilities_rating?: number;
  tuition_value_rating?: number;
  student_life_rating?: number;
  upvotes: number;
  downvotes: number;
  created_at: string;
};

type ReviewsApiResponse = {
  success: boolean;
  message?: string;
  reviews?: ReviewRow[];
  pagination?: {
    total?: number;
  };
};

type SortKey =
  | "newest"
  | "oldest"
  | "rating_high"
  | "rating_low"
  | "most_votes";

type ReviewKind = "all" | "course" | "university";

function unique<T>(arr: T[]): T[] {
  return Array.from(new Set(arr));
}

function RatingStars({ value, size = 13 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <Star size={size} className="text-amber-400 fill-amber-400" />
      <span className="font-medium text-gray-800 text-sm">
        {typeof value === "number" ? value.toFixed(2) : Number(value || 0).toFixed(2)}
      </span>
    </div>
  );
}

function VoteDisplay({
  upvotes,
  downvotes,
}: {
  upvotes: number;
  downvotes: number;
}) {
  const score = upvotes - downvotes;
  return (
    <div className="flex items-center gap-1 text-gray-600">
      <ArrowBigUp size={15} className="text-gray-400" />
      <span className="text-sm font-semibold w-5 text-center">{score}</span>
      <ArrowBigDown size={15} className="text-gray-400" />
    </div>
  );
}

function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <span
      className={`inline-flex w-fit items-center px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${color}`}
    >
      {label}: {value}
    </span>
  );
}

function isUniversityReview(review: ReviewRow) {
  return review.review_type === "university";
}

function getReviewTarget(review: ReviewRow) {
  return isUniversityReview(review)
    ? {
        label: "University Review",
        title: review.university,
        meta: "University experience",
      }
    : {
        label: review.course_code,
        title: review.course_title,
        meta: `${review.department} - ${review.university}`,
      };
}

function getReviewMetrics(review: ReviewRow) {
  if (isUniversityReview(review)) {
    return [
      {
        label: "Academic",
        value: review.academic_quality_rating ?? review.exam_difficulty_rating,
        color: "bg-blue-100 text-blue-800",
      },
      {
        label: "Professors",
        value: review.professors_rating ?? review.workload_rating,
        color: "bg-green-100 text-green-800",
      },
      {
        label: "Facilities",
        value: review.facilities_rating ?? review.attendance_rating,
        color: "bg-yellow-100 text-yellow-800",
      },
      {
        label: "Tuition",
        value: review.tuition_value_rating ?? review.grading_rating,
        color: "bg-purple-100 text-purple-800",
      },
      {
        label: "Life",
        value: review.student_life_rating ?? review.overall_rating,
        color: "bg-pink-100 text-pink-800",
      },
    ];
  }

  return [
    {
      label: "Exam",
      value: review.exam_difficulty_rating,
      color: "bg-blue-100 text-blue-800",
    },
    {
      label: "Workload",
      value: review.workload_rating,
      color: "bg-green-100 text-green-800",
    },
    {
      label: "Attendance",
      value: review.attendance_rating,
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      label: "Grading",
      value: review.grading_rating,
      color: "bg-purple-100 text-purple-800",
    },
  ];
}

function ReviewDetailModal({
  review,
  onClose,
  onRequestHide,
  onRequestDelete,
}: {
  review: ReviewRow;
  onClose: () => void;
  onRequestHide: (review: ReviewRow) => void;
  onRequestDelete: (review: ReviewRow) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const netVotes = review.upvotes - review.downvotes;
  const target = getReviewTarget(review);
  const metrics = getReviewMetrics(review);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl border border-gray-200 shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 p-5 border-b border-gray-100">
          <div>
            <p className="font-semibold text-gray-900">
              {target.label} - {target.title}
            </p>
            <p className="text-sm text-gray-400 mt-0.5">
              {target.meta}
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 p-1.5 rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Reviewer</p>
              <p className="text-gray-800 font-medium">{review.reviewer_name}</p>
              <p className="text-xs text-gray-400">{review.reviewer_email}</p>
            </div>
            {!isUniversityReview(review) && (
              <>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Instructor</p>
                  <p className="text-gray-800 font-medium">
                    {review.instructor_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Semester</p>
                  <p className="text-gray-800 font-medium">
                    {review.semester_taken}
                  </p>
                </div>
              </>
            )}
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
              <p className="text-gray-800 font-medium">{review.created_at}</p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Review</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100">
              {review.review_text}
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Overall rating</p>
              <RatingStars value={review.overall_rating} size={16} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Community votes</p>
              <div className="flex items-center gap-3 text-sm">
                <span className="flex items-center gap-1 text-green-600">
                  <ArrowBigUp size={16} /> {review.upvotes}
                </span>
                <span className="flex items-center gap-1 text-red-500">
                  <ArrowBigDown size={16} /> {review.downvotes}
                </span>
                <span className="text-gray-500">
                  Net:{" "}
                  <span className="font-semibold text-gray-800">
                    {netVotes > 0 ? `+${netVotes}` : netVotes}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-2">Rating breakdown</p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {metrics.map((m) => (
                <div key={m.label} className={`rounded-lg px-3 py-2 ${m.color}`}>
                  <p className="text-[11px] opacity-70">{m.label}</p>
                  <p className="text-base font-semibold">
                    {m.value}{" "}
                    <span className="text-xs font-normal opacity-60">/ 5</span>
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs text-gray-400">
            review_id:{" "}
            <span className="text-gray-600 font-mono">{review.review_id}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => onRequestHide(review)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-[#6155F5] border border-[#6155F5]/25 hover:bg-[#6155F5]/5 transition"
          >
            <EyeOff size={14} /> Hide review
          </button>
          <button
            onClick={() => onRequestDelete(review)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-red-600 border border-red-200 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete review
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<
    "all" | "5" | "4" | "3" | "2" | "1"
  >("all");
  const [universityFilter, setUniversityFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [reviewKind, setReviewKind] = useState<ReviewKind>("all");
  const [pendingHide, setPendingHide] = useState<ReviewRow | null>(null);
  const [pendingDelete, setPendingDelete] = useState<ReviewRow | null>(null);
  const [detailReview, setDetailReview] = useState<ReviewRow | null>(null);

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const limit = 20;
  const [total, setTotal] = useState(0);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(limit));

      const q = searchQuery.trim();
      if (q) params.set("q", q);

      if (ratingFilter !== "all") params.set("rating", ratingFilter);
      if (universityFilter !== "all") params.set("university", universityFilter);
      if (departmentFilter !== "all") params.set("department", departmentFilter);
      if (semesterFilter !== "all") params.set("semester", semesterFilter);

      params.set("sort", sortKey);
      params.set("kind", reviewKind);

      const res = await fetch(`/api/admin/reviews?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        credentials: "include",
      });

      const data = (await res.json()) as ReviewsApiResponse;

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to fetch reviews");
      }

      const mapped: ReviewRow[] = (data.reviews || []).map((r) => ({
        ...r,
        review_id: String(r.review_id),
      }));

      setReviews(mapped);
      setTotal(data.pagination?.total ?? 0);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setReviews([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [
    page,
    limit,
    searchQuery,
    ratingFilter,
    universityFilter,
    departmentFilter,
    semesterFilter,
    sortKey,
    reviewKind,
  ]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    setPage(1);
  }, [
    searchQuery,
    ratingFilter,
    universityFilter,
    departmentFilter,
    semesterFilter,
    sortKey,
    reviewKind,
  ]);

  function requestDelete(review: ReviewRow) {
    setPendingDelete(review);
  }

  function requestHide(review: ReviewRow) {
    setPendingHide(review);
  }

  function refreshAfterRemoval() {
    const isLastItemOnPage = reviews.length === 1 && page > 1;
    if (isLastItemOnPage) setPage((p) => p - 1);
    else fetchReviews();
  }

  async function confirmHide() {
    if (!pendingHide) return;

    try {
      const params = new URLSearchParams({ type: pendingHide.review_type });
      const res = await fetch(`/api/admin/reviews/${pendingHide.review_id}?${params.toString()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to hide review");
      }

      setPendingHide(null);
      setDetailReview(null);
      refreshAfterRemoval();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Hide failed");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;

    try {
      const params = new URLSearchParams({ type: pendingDelete.review_type });
      const res = await fetch(`/api/admin/reviews/${pendingDelete.review_id}?${params.toString()}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

      const data = (await res.json()) as { success: boolean; message?: string };
      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to delete review");
      }

      setPendingDelete(null);
      setDetailReview(null);
      refreshAfterRemoval();
    } catch (e: unknown) {
      alert(e instanceof Error ? e.message : "Delete failed");
    }
  }

  const closeDetail = useCallback(() => setDetailReview(null), []);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const universities = useMemo(() => unique(reviews.map((r) => r.university)), [reviews]);

  const departments = useMemo(
    () =>
      unique(
        reviews
          .filter((r) => !isUniversityReview(r))
          .filter((r) => universityFilter === "all" || r.university === universityFilter)
          .map((r) => r.department)
      ),
    [reviews, universityFilter]
  );

  const semesters = useMemo(
    () =>
      unique(
        reviews
          .filter((r) => !isUniversityReview(r))
          .map((r) => r.semester_taken),
      ),
    [reviews],
  );

  const activeFilterCount = [
    reviewKind !== "all",
    ratingFilter !== "all",
    universityFilter !== "all",
    departmentFilter !== "all",
    semesterFilter !== "all",
    sortKey !== "newest",
  ].filter(Boolean).length;

  function resetFilters() {
    setReviewKind("all");
    setRatingFilter("all");
    setUniversityFilter("all");
    setDepartmentFilter("all");
    setSemesterFilter("all");
    setSortKey("newest");
  }

  const filtered = reviews;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {pendingHide && (
        <ConfirmModal
          title="Hide review?"
          description={
            <>
              Do you want to hide this review for{" "}
              <span className="font-medium text-gray-700">
                {getReviewTarget(pendingHide).label} -{" "}
                {getReviewTarget(pendingHide).title}
              </span>{" "}
              by{" "}
              <span className="font-medium text-gray-700">
                {pendingHide.reviewer_name}
              </span>
              ? Choose Hide to remove it from public pages, or Cancel to keep it
              visible.
            </>
          }
          confirmText="Hide"
          cancelText="Cancel"
          variant="primary"
          onCancel={() => setPendingHide(null)}
          onConfirm={confirmHide}
        />
      )}

      {pendingDelete && (
        <ConfirmModal
          title="Delete review?"
          description={
            <>
              Are you sure you want to delete the review for{" "}
              <span className="font-medium text-gray-700">
                {getReviewTarget(pendingDelete).label} -{" "}
                {getReviewTarget(pendingDelete).title}
              </span>{" "}
              by{" "}
              <span className="font-medium text-gray-700">
                {pendingDelete.reviewer_name}
              </span>
              ? This action cannot be undone.
            </>
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          onCancel={() => setPendingDelete(null)}
          onConfirm={confirmDelete}
        />
      )}

      {detailReview && (
        <ReviewDetailModal
          review={detailReview}
          onClose={closeDetail}
          onRequestHide={(r) => {
            setDetailReview(null);
            requestHide(r);
          }}
          onRequestDelete={(r) => {
            setDetailReview(null);
            requestDelete(r);
          }}
        />
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Review Management</h1>
          <p className="text-sm text-gray-500">
            Moderate course and university reviews
          </p>
        </div>
      </div>

      <div className="mt-4 inline-flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-1">
        {[
          { value: "all", label: "All" },
          { value: "course", label: "Courses" },
          { value: "university", label: "University Reviews" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              const nextKind = option.value as ReviewKind;
              setReviewKind(nextKind);
              if (nextKind === "university") {
                setDepartmentFilter("all");
                setSemesterFilter("all");
              }
            }}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              reviewKind === option.value
                ? "bg-[#6155F5] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-4 flex flex-row gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by course, university, reviewer, instructor..."
            className="w-full h-11 pl-10 pr-4 text-gray-900 placeholder-gray-400 rounded-md border border-gray-300 transition-colors focus:outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]"
          />
        </div>

        <div className="relative hidden sm:block">
          <select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            className="h-11 pl-3 pr-9 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5] focus:ring-2 focus:ring-[#6155F5]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="rating_high">Highest rated</option>
            <option value="rating_low">Lowest rated</option>
            <option value="most_votes">Most voted</option>
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400"
            size={15}
          />
        </div>

        <button
          onClick={() => setShowFilters((p) => !p)}
          className="relative h-11 px-3 flex items-center justify-center gap-1.5 rounded-md border border-gray-300 hover:bg-gray-50 transition text-sm text-gray-700"
        >
          <SlidersHorizontal size={16} />
          <span className="hidden sm:inline">Filters</span>
          {activeFilterCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-[#6155F5] text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-md border border-red-200 bg-red-50 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading && <p className="mt-3 text-sm text-gray-400">Loading reviews...</p>}

      {showFilters && (
        <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3 items-end">
            {[
              {
                label: "University",
                value: universityFilter,
                onChange: (v: string) => {
                  setUniversityFilter(v);
                  setDepartmentFilter("all");
                },
                options: [
                  { value: "all", label: "All universities" },
                  ...universities.map((u) => ({ value: u, label: u })),
                ],
              },
              {
                label: "Department",
                value: departmentFilter,
                onChange: setDepartmentFilter,
                options: [
                  { value: "all", label: "All departments" },
                  ...departments.map((d) => ({ value: d, label: d })),
                ],
              },
              {
                label: "Semester",
                value: semesterFilter,
                onChange: setSemesterFilter,
                options: [
                  { value: "all", label: "All semesters" },
                  ...semesters.map((s) => ({ value: s, label: s })),
                ],
              },
              {
                label: "Overall rating",
                value: ratingFilter,
                onChange: setRatingFilter,
                options: [
                  { value: "all", label: "All ratings" },
                  ...["5", "4", "3", "2", "1"].map((v) => ({
                    value: v,
                    label: `${v} *`,
                  })),
                ],
              },
            ].map(({ label, value, onChange, options }) => (
              <div key={label} className="flex flex-col gap-1">
                <label className="text-xs text-gray-500 font-medium">{label}</label>
                <div className="relative">
                  <select
                    value={value}
                    onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
                    className="h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5]"
                  >
                    {options.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                    size={13}
                  />
                </div>
              </div>
            ))}

            <div className="flex flex-col gap-1 sm:hidden">
              <label className="text-xs text-gray-500 font-medium">Sort by</label>
              <div className="relative">
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5]"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="rating_high">Highest rated</option>
                  <option value="rating_low">Lowest rated</option>
                  <option value="most_votes">Most voted</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={13}
                />
              </div>
            </div>

            {activeFilterCount > 0 && (
              <button
                onClick={resetFilters}
                className="h-9 px-3 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 rounded-md border border-gray-300 bg-white hover:bg-gray-50 transition"
              >
                <X size={13} /> Reset
              </button>
            )}
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing page {page} of {totalPages} ({total} total)
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50"
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            className="h-9 px-3 rounded-md border border-gray-300 bg-white text-sm disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <div className="hidden md:block mt-2 rounded-xl border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">Target</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Reviewer</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Instructor</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Semester</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Review</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Overall</th>
              <th className="text-left px-6 py-3 whitespace-nowrap min-w-[150px]">Metrics</th>
              <th className="text-left px-8 py-3 whitespace-nowrap min-w-[90px]">Votes</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>

          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No reviews match your search or filters.
                </td>
              </tr>
            ) : (
              filtered.map((r) => {
                const target = getReviewTarget(r);
                const metrics = getReviewMetrics(r);

                return (
                  <tr
                    key={`${r.review_type}-${r.review_id}`}
                    onClick={() => setDetailReview(r)}
                    className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                  <td className="px-6 py-3 min-w-[150px]">
                    <p className="font-medium text-gray-900 whitespace-nowrap">
                      {target.label}
                    </p>
                    <p className="text-xs text-gray-500 max-w-40 truncate">
                      {target.title}
                    </p>
                    <p className="text-xs text-gray-400 max-w-40 truncate">
                      {target.meta}
                    </p>
                  </td>

                  <td className="px-8 py-3 min-w-[90px]">
                    <p className="whitespace-nowrap font-medium text-gray-800">
                      {r.reviewer_name}
                    </p>
                    <p className="text-xs text-gray-400 truncate max-w-40">
                      {r.reviewer_email}
                    </p>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {r.instructor_name}
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-700">
                    {r.semester_taken}
                  </td>

                  <td className="px-4 py-3 max-w-50">
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {r.review_text}
                    </p>
                  </td>

                  <td className="px-4 py-3">
                    <RatingStars value={r.overall_rating} />
                  </td>

                  <td className="px-4 py-3">
                    <div className="grid grid-cols-1 gap-1">
                      {metrics.map((metric) => (
                        <MetricBadge
                          key={metric.label}
                          label={metric.label}
                          value={metric.value}
                          color={metric.color}
                        />
                      ))}
                    </div>
                  </td>

                  <td className="px-4 py-3">
                    <VoteDisplay upvotes={r.upvotes} downvotes={r.downvotes} />
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                    {r.created_at}
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => requestHide(r)}
                        className="text-gray-400 hover:text-[#6155F5] transition-colors"
                        aria-label="Hide review"
                      >
                        <EyeOff size={16} />
                      </button>
                      <button
                        onClick={() => requestDelete(r)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete review"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-2 flex flex-col gap-4">
        {!loading && filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No reviews match your search or filters.
          </p>
        ) : (
          filtered.map((r) => {
            const target = getReviewTarget(r);
            const metrics = getReviewMetrics(r);

            return (
              <div
                key={`${r.review_type}-${r.review_id}`}
                onClick={() => setDetailReview(r)}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
              >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {target.label}
                  </h3>
                  <p className="text-sm text-gray-500">{target.title}</p>
                  <p className="text-xs text-gray-400">{target.meta}</p>
                </div>
                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => requestHide(r)}
                    className="text-gray-400 hover:text-[#6155F5] transition-colors p-1"
                    aria-label="Hide review"
                  >
                    <EyeOff size={16} />
                  </button>
                  <button
                    onClick={() => requestDelete(r)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="Delete review"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="mt-3 text-sm text-gray-600 space-y-1">
                <p>
                  <span className="text-gray-400">Reviewer:</span>{" "}
                  <span className="font-medium text-gray-800">{r.reviewer_name}</span>
                  <span className="text-gray-400 text-xs ml-1">
                    ({r.reviewer_email})
                  </span>
                </p>
                {!isUniversityReview(r) && (
                  <>
                    <p>
                      <span className="text-gray-400">Instructor:</span>{" "}
                      {r.instructor_name}
                    </p>
                    <p>
                      <span className="text-gray-400">Semester:</span>{" "}
                      {r.semester_taken}
                    </p>
                  </>
                )}
                <p>
                  <span className="text-gray-400">Date:</span> {r.created_at}
                </p>
              </div>

              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{r.review_text}</p>

              <div className="mt-3 flex items-center gap-4">
                <RatingStars value={r.overall_rating} />
                <VoteDisplay upvotes={r.upvotes} downvotes={r.downvotes} />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {metrics.map((metric) => (
                  <MetricBadge
                    key={metric.label}
                    label={metric.label}
                    value={metric.value}
                    color={metric.color}
                  />
                ))}
              </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
