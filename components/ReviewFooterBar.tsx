"use client";

// Renders the reusable ReviewFooterBar UI component.
import { useEffect, useState } from "react";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";

type ReviewFooterBarProps = {
  reviewId: number;
  voteEndpointBase?: string;
  initialUpvotes?: number;
  initialDownvotes?: number;
  initialUserVote?: number | null;
  timeAgo?: string;
  onVoteChange?: (summary: {
    upvotes: number;
    downvotes: number;
    net_votes: number;
    user_vote: number | null;
  }) => void;
};

export default function ReviewFooterBar({
  reviewId,
  voteEndpointBase = "/api/reviews",
  initialUpvotes = 0,
  initialDownvotes = 0,
  initialUserVote = null,
  timeAgo = "2 weeks ago",
  onVoteChange,
}: ReviewFooterBarProps) {
  const [upvotes, setUpvotes] = useState(initialUpvotes);
  const [downvotes, setDownvotes] = useState(initialDownvotes);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setUpvotes(initialUpvotes);
    setDownvotes(initialDownvotes);
    setUserVote(initialUserVote);
    setError("");
  }, [initialDownvotes, initialUpvotes, initialUserVote]);

  const netVotes = upvotes - downvotes;

  async function submitVote(vote: 1 | -1) {
    if (saving) return;

    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${voteEndpointBase}/${reviewId}/vote`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vote }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.success) {
        setError(data?.message ?? "Could not save vote");
        return;
      }

      const summary = {
        upvotes: Number(data.upvotes),
        downvotes: Number(data.downvotes),
        net_votes: Number(data.net_votes),
        user_vote: data.user_vote == null ? null : Number(data.user_vote),
      };

      setUpvotes(summary.upvotes);
      setDownvotes(summary.downvotes);
      setUserVote(summary.user_vote);
      onVoteChange?.(summary);
    } catch {
      setError("Could not save vote");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-6 border-t border-gray-200 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => submitVote(1)}
            disabled={saving}
            className="transition active:scale-95 disabled:opacity-50"
            aria-label="Upvote"
          >
            <ArrowBigUp
              className={`h-7 w-7 ${
                userVote === 1 ? "text-green-600" : "text-gray-400"
              }`}
            />
          </button>

          <span className="text-base font-medium text-gray-700">
            {netVotes}
          </span>

          <button
            type="button"
            onClick={() => submitVote(-1)}
            disabled={saving}
            className="transition active:scale-95 disabled:opacity-50"
            aria-label="Downvote"
          >
            <ArrowBigDown
              className={`h-7 w-7 ${
                userVote === -1 ? "text-gray-700" : "text-gray-400"
              }`}
            />
          </button>
        </div>

        <div className="text-sm text-gray-500 sm:text-base">{timeAgo}</div>
      </div>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
