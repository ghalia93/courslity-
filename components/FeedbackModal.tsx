"use client";

// Renders the reusable FeedbackModal UI component.
import { useState } from "react";
import StarRating from "./StarRating";
import Button from "./Button";
import { useToast } from "./toast/Toastprovider";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

type Props = {
  onClose: () => void;
  onSubmitted: () => void;
};

export default function FeedbackModal({ onClose, onSubmitted }: Props) {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();
  const { user } = useAuth();
  const isAdminUser = isAdminRole(user?.role);

  async function handleSubmit() {
    if (isAdminUser) {
      toast("Admins cannot submit student feedback.", "error");
      return;
    }

    if (!feedback.trim()) {
      toast("Please write some feedback before submitting.", "error");
      return;
    }
    if (rating === 0) {
      toast("Please select a rating.", "error");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "feedback",
          rating,
          message: feedback.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.message || "Failed to submit feedback");
      }

      toast("Thanks! Your feedback was submitted.", "success");
      onSubmitted();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to submit feedback";
      toast(message, "error");
    } finally {
      setLoading(false);
    }
  }

  const isDisabled = isAdminUser || loading || !feedback.trim() || rating === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6">
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-4 shadow-xl sm:p-6">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-500 hover:text-gray-900"
          aria-label="Close"
          type="button"
          disabled={loading}
        >
          x
        </button>

        <h2 className="text-lg font-semibold text-gray-900">
          Help us improve Coursality!
        </h2>

        <div className="mt-2">
          <StarRating value={rating} onChange={setRating} />
        </div>

        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Write feedback..."
          className="mt-4 h-32 w-full resize-none rounded-lg border border-gray-300 p-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#6155F5]"
        />

        <div className="mt-4 flex justify-end">
          <div
            className={`w-full sm:w-auto ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            onClick={() => {
              if (!isDisabled) handleSubmit();
            }}
          >
            <Button className="w-full sm:w-auto">
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
