"use client";

// Renders the admin feedback page.
import { useMemo, useState, useEffect, useCallback } from "react";
import {
  Search,
  Star,
  Trash2,
  ChevronDown,
  SlidersHorizontal,
  X,
  MessageSquare,
  AlertTriangle,
} from "lucide-react";

type FeedbackKind = "feedback" | "problem";
type ViewKind = "all" | FeedbackKind;

type FeedbackRow = {
  feedback_id: string;
  user_id: string;
  full_name: string;
  email: string;
  kind: FeedbackKind;
  rating: number;
  message: string;
  created_at: string;
};

type FeedbackResponseRow = {
  feedback_id: number | string;
  user_id: number | string | null;
  full_name?: string | null;
  email?: string | null;
  kind?: FeedbackKind;
  rating: number | string;
  message?: string | null;
  created_at?: string | null;
};

type SortKey = "newest" | "oldest" | "rating_high" | "rating_low";

function RatingStars({ value, large = false }: { value: number; large?: boolean }) {
  const filled = Math.round(value);
  const sz = large ? 16 : 12;
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={sz}
            className={
              i < filled
                ? "text-amber-400 fill-amber-400"
                : "text-gray-200 fill-gray-200"
            }
          />
        ))}
      </div>
      <span className={`font-medium text-gray-700 ${large ? "text-base" : "text-sm"}`}>
        {Number(value).toFixed(2)}
      </span>
    </div>
  );
}

function RatingBadge({ value }: { value: number }) {
  if (value >= 4)
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Positive
      </span>
    );
  if (value >= 3)
    return (
      <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        Neutral
      </span>
    );
  return (
    <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
      Negative
    </span>
  );
}

function KindBadge({ kind }: { kind: FeedbackKind }) {
  if (kind === "problem") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
        <AlertTriangle size={12} />
        Problem
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-700">
      <MessageSquare size={12} />
      Feedback
    </span>
  );
}

function FeedbackDetailModal({
  feedback,
  onClose,
  onDelete,
}: {
  feedback: FeedbackRow;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-900">{feedback.full_name}</p>
              <KindBadge kind={feedback.kind} />
            </div>
            <p className="text-sm text-gray-400 mt-0.5">{feedback.email}</p>
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
              <p className="text-xs text-gray-400 mb-1">Rating</p>
              <RatingStars value={feedback.rating} large />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Sentiment</p>
              <RatingBadge value={feedback.rating} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Type</p>
              <KindBadge kind={feedback.kind} />
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Submitted</p>
              <p className="text-gray-800 font-medium">{feedback.created_at}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-0.5">Score</p>
              <p className="text-gray-800 font-medium">
                {Number(feedback.rating).toFixed(2)} / 5.00
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-gray-400 mb-1.5">Message</p>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-lg p-3 border border-gray-100 whitespace-pre-wrap">
              {feedback.message}
            </p>
          </div>

          <div className="rounded-lg bg-gray-50 border border-gray-100 px-3 py-2.5 text-xs text-gray-400 space-y-0.5">
            <p>
              feedback_id:{" "}
              <span className="text-gray-600 font-mono">{feedback.feedback_id}</span>
            </p>
            <p>
              user_id:{" "}
              <span className="text-gray-600 font-mono">{feedback.user_id}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={() => {
              onDelete(feedback.feedback_id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-md text-red-600 border border-red-200 hover:bg-red-50 transition"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminFeedbackPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [viewKind, setViewKind] = useState<ViewKind>("all");
  const [ratingFilter, setRatingFilter] = useState<"all" | "positive" | "neutral" | "negative">("all");
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [detailFeedback, setDetailFeedback] = useState<FeedbackRow | null>(null);

  const [feedbackList, setFeedbackList] = useState<FeedbackRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadFeedback = useCallback(async (q: string, sort: SortKey, kind: ViewKind) => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (sort) params.set("sort", sort);
      if (kind !== "all") params.set("kind", kind);

      const res = await fetch(`/api/admin/feedback?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to load feedback");
      }

      const rows: FeedbackRow[] = ((data.feedback || []) as FeedbackResponseRow[]).map((r) => ({
        feedback_id: String(r.feedback_id),
        user_id: r.user_id == null ? "" : String(r.user_id),
        full_name: String(r.full_name || ""),
        email: String(r.email || ""),
        kind: r.kind === "problem" ? "problem" : "feedback",
        rating: Number(r.rating) || 0,
        message: String(r.message || ""),
        created_at: String(r.created_at || ""),
      }));

      setFeedbackList(rows);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to load feedback";
      setError(message);
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeedback("", "newest", "all");
  }, [loadFeedback]);

  useEffect(() => {
    const t = setTimeout(() => {
      loadFeedback(searchQuery, sortKey, viewKind);
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, sortKey, viewKind, loadFeedback]);

  async function handleDelete(feedback_id: string) {
    try {
      setPendingDelete(null);
      const res = await fetch(`/api/admin/feedback/${feedback_id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data?.success) throw new Error(data?.message || "Failed to delete feedback");
      setFeedbackList((prev) => prev.filter((f) => f.feedback_id !== feedback_id));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Failed to delete feedback";
      alert(message);
    }
  }

  const avgRating = feedbackList.length
    ? (feedbackList.reduce((s, f) => s + Number(f.rating || 0), 0) / feedbackList.length).toFixed(2)
    : " - ";
  const feedbackCount = feedbackList.filter((f) => f.kind === "feedback").length;
  const problemCount = feedbackList.filter((f) => f.kind === "problem").length;

  const activeFilterCount = [ratingFilter !== "all", sortKey !== "newest"].filter(Boolean).length;
  const emptyLabel = viewKind === "problem" ? "problem reports" : viewKind === "feedback" ? "feedback entries" : "entries";

  function resetFilters() {
    setRatingFilter("all");
    setSortKey("newest");
  }

  const filtered = useMemo(() => {
    return feedbackList.filter((f) => {
      const matchesRating =
        ratingFilter === "all" ||
        (ratingFilter === "positive" && f.rating >= 4) ||
        (ratingFilter === "neutral" && f.rating >= 3 && f.rating < 4) ||
        (ratingFilter === "negative" && f.rating < 3);
      return matchesRating;
    });
  }, [feedbackList, ratingFilter]);

  const foundLabel =
    viewKind === "problem"
      ? `problem report${filtered.length !== 1 ? "s" : ""}`
      : viewKind === "feedback"
        ? `feedback entr${filtered.length !== 1 ? "ies" : "y"}`
        : `entr${filtered.length !== 1 ? "ies" : "y"}`;

  const closeDetail = useCallback(() => setDetailFeedback(null), []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {detailFeedback && (
        <FeedbackDetailModal
          feedback={detailFeedback}
          onClose={closeDetail}
          onDelete={(id) => {
            setDetailFeedback(null);
            handleDelete(id);
          }}
        />
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 max-w-sm w-full mx-4">
            <h2 className="text-base font-semibold text-gray-900">Delete feedback?</h2>
            <p className="mt-2 text-sm text-gray-500">
              This entry will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(pendingDelete)}
                className="px-4 py-2 text-sm rounded-md bg-red-500 text-white hover:bg-red-600 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-black">Feedback</h1>
          <p className="text-sm text-gray-500">Review general feedback and reported problems from users</p>
        </div>
      </div>

      <div className="mt-4 inline-flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-1">
        {[
          { value: "all", label: "All" },
          { value: "problem", label: "Problems" },
          { value: "feedback", label: "Feedback" },
        ].map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => setViewKind(option.value as ViewKind)}
            className={`rounded-lg px-3 py-2 text-sm transition ${
              viewKind === option.value
                ? "bg-[#6155F5] text-white"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total submissions",
            value: feedbackList.length,
            icon: <MessageSquare size={16} className="text-gray-400" />,
          },
          {
            label: "Problem reports",
            value: problemCount,
            icon: <AlertTriangle size={16} className="text-red-500" />,
          },
          {
            label: "General feedback",
            value: feedbackCount,
            icon: <MessageSquare size={16} className="text-sky-500" />,
          },
          {
            label: "Avg. rating",
            value: avgRating,
            icon: <Star size={16} className="text-amber-400 fill-amber-400" />,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 flex items-center gap-3"
          >
            <div>{stat.icon}</div>
            <div>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-row gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, email, or message..."
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

      {showFilters && (
        <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 font-medium">Sentiment</label>
              <div className="relative">
                <select
                  value={ratingFilter}
                  onChange={(e) => setRatingFilter(e.target.value as typeof ratingFilter)}
                  className="h-9 pl-3 pr-8 rounded-md border border-gray-300 bg-white text-sm text-gray-700 appearance-none focus:outline-none focus:border-[#6155F5]"
                >
                  <option value="all">All</option>
                  <option value="positive">Positive (&gt;= 4*)</option>
                  <option value="neutral">Neutral (3-4*)</option>
                  <option value="negative">Negative (&lt; 3*)</option>
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-gray-400"
                  size={13}
                />
              </div>
            </div>

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

      {loading && <p className="mt-4 text-sm text-gray-500">Loading...</p>}
      {!loading && error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      <p className="mt-3 text-xs text-gray-400">
        {filtered.length} {foundLabel} found
      </p>

      <div className="hidden md:block mt-2 rounded-xl border border-gray-200 bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="text-left px-4 py-3 whitespace-nowrap">User</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Type</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Rating</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Sentiment</th>
              <th className="text-left px-4 py-3">Message</th>
              <th className="text-left px-4 py-3 whitespace-nowrap">Date</th>
              <th className="text-right px-4 py-3 whitespace-nowrap">Actions</th>
            </tr>
          </thead>
          <tbody>
            {!loading && filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-gray-400 text-sm">
                  No {emptyLabel} match your search or filters.
                </td>
              </tr>
            ) : (
              filtered.map((f) => (
                <tr
                  key={f.feedback_id}
                  onClick={() => setDetailFeedback(f)}
                  className="border-t border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900 whitespace-nowrap">{f.full_name}</p>
                    <p className="text-xs text-gray-400">{f.email}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <KindBadge kind={f.kind} />
                  </td>
                  <td className="px-4 py-3">
                    <RatingStars value={f.rating} />
                  </td>
                  <td className="px-4 py-3">
                    <RatingBadge value={f.rating} />
                  </td>
                  <td className="px-4 py-3 max-w-100">
                    <p className="text-gray-600 text-xs line-clamp-2">{f.message}</p>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-xs">
                    {f.created_at}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setPendingDelete(f.feedback_id)}
                        className="text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Delete feedback"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="md:hidden mt-2 flex flex-col gap-4">
        {!loading && filtered.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">
            No {emptyLabel} match your search or filters.
          </p>
        ) : (
          filtered.map((f) => (
            <div
              key={f.feedback_id}
              onClick={() => setDetailFeedback(f)}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm cursor-pointer hover:border-gray-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-gray-900">{f.full_name}</h3>
                  <p className="text-xs text-gray-400">{f.email}</p>
                </div>
                <div onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => setPendingDelete(f.feedback_id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    aria-label="Delete feedback"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3">
                <KindBadge kind={f.kind} />
                <RatingStars value={f.rating} />
                <RatingBadge value={f.rating} />
              </div>
              <p className="mt-3 text-sm text-gray-600 line-clamp-2">{f.message}</p>
              <p className="mt-3 text-xs text-gray-400">{f.created_at}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
