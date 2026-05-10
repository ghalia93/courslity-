"use client";

// Renders the reusable FeedbackCarousel UI component.
import { useEffect, useRef, useState } from "react";
import FeedbackModal from "./FeedbackModal";
import Button from "./Button";
import StarRating from "./StarRating";

type Feedback = {
  quote: string;
  user: string;
  rating: number;
  createdAt?: string;
};

type TestimonialApiItem = {
  text: string;
  username: string;
  rating: number | string;
  createdAt?: string;
};

type TestimonialsApiResponse = {
  success: boolean;
  message?: string;
  testimonials?: TestimonialApiItem[];
};

function QuoteCard({ quote, user, rating }: Feedback) {
  return (
    <div
      className="
        w-[min(230px,calc(100vw-4rem))] rounded-xl bg-white px-5 py-5 sm:px-6 sm:py-6
        border border-gray-100
        transition-all duration-300 ease-out
        hover:shadow-[0_12px_30px_rgba(0,0,0,0.15)]
        hover:-translate-y-1
      "
    >
      {/* Rating display using the shared star component. */}
      <StarRating value={Number(rating) || 0} readOnly className="mb-2" />

      <p className="text-[13px] font-bold text-gray-900 leading-snug">
        &quot;{quote}&quot;
      </p>
      <p className="mt-3 text-[11px] text-gray-400">{user}</p>
    </div>
  );
}

export default function FeedbackCarousel() {
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [reloadKey, setReloadKey] = useState(0);

  const rowRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch("/api/testimonials?limit=12", {
          cache: "no-store",
        });
        const data = (await res.json()) as TestimonialsApiResponse;

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch testimonials");
        }

        const mapped: Feedback[] = (data.testimonials || []).map((t) => ({
          quote: t.text,
          user: t.username,
          rating: Number(t.rating) || 0,
          createdAt: t.createdAt,
        }));

        setFeedbacks(mapped);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Failed to fetch testimonials",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [reloadKey]);

  function slideLeft() {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: -220, behavior: "smooth" });
  }

  function slideRight() {
    if (!rowRef.current) return;
    rowRef.current.scrollBy({ left: 220, behavior: "smooth" });
  }

  return (
    <section className="w-full py-10">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="text-center text-3xl font-extrabold text-gray-900 sm:text-4xl">
          What Our Users Think
        </h2>

        <div className="relative mt-8">
          <button
            type="button"
            onClick={slideLeft}
            className="absolute left-0 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            aria-label="Previous"
          >
            {"<"}
          </button>

          <div
            ref={rowRef}
            className="flex flex-nowrap gap-4 overflow-x-auto px-10 sm:gap-6 sm:px-12"
            style={{ scrollbarWidth: "none" }}
          >
            {loading && <p className="text-gray-500 px-2">Loading...</p>}

            {!loading && error && (
              <p className="text-red-500 px-2">{error}</p>
            )}

            {!loading && !error && feedbacks.length === 0 && (
              <p className="text-gray-500 px-2">No feedback yet.</p>
            )}

            {!loading &&
              !error &&
              feedbacks.map((f, idx) => (
                <div key={idx} className="shrink-0">
                  <QuoteCard
                    quote={f.quote}
                    user={f.user}
                    rating={f.rating}
                    createdAt={f.createdAt}
                  />
                </div>
              ))}
          </div>

          <button
            type="button"
            onClick={slideRight}
            className="absolute right-0 top-1/2 z-10 h-9 w-9 -translate-y-1/2 rounded-full border border-gray-200 bg-white shadow-sm hover:bg-gray-50"
            aria-label="Next"
          >
            {">"}
          </button>
        </div>

        <div className="mt-8 flex justify-center">
          <Button variant="primary" onClick={() => setFeedbackOpen(true)}>
            Leave Your Feedback
          </Button>
        </div>
      </div>

      {feedbackOpen && (
        <FeedbackModal
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={() => {
            setFeedbackOpen(false);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </section>
  );
}
