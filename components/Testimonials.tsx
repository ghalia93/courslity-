"use client";

// Renders the reusable Testimonials UI component.
import { useEffect, useState } from "react";
import StarRating from "./StarRating";

type Testimonial = {
  feedbackId: number;
  text: string;
  username: string;
  rating: number;
  createdAt: string;
};

type TestimonialsApiResponse = {
  success: boolean;
  message?: string;
  testimonials?: Testimonial[];
};

export default function TestimonialsSection({ limit = 8 }: { limit?: number }) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/testimonials?limit=${limit}`, {
          cache: "no-store",
        });

        const data = (await res.json()) as TestimonialsApiResponse;

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Failed to fetch testimonials");
        }

        setTestimonials(data.testimonials || []);
      } catch (e: unknown) {
        setError(
          e instanceof Error ? e.message : "Failed to fetch testimonials",
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [limit]);

  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold">Testimonials</h2>
          <p className="text-sm text-gray-500">What students are saying</p>
        </div>

        {loading && <p className="text-gray-500">Loading testimonials...</p>}

        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && testimonials.length === 0 && (
          <p className="text-gray-500">No testimonials yet.</p>
        )}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.feedbackId}
              className="rounded-2xl border bg-white p-5 shadow-sm"
            >
              {/* Rating display using the shared star component. */}
              <StarRating
                value={Number(t.rating) || 0}
                readOnly
                className="mb-2"
              />

              <p className="text-gray-700 leading-relaxed">
                &quot;{t.text}&quot;
              </p>

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-medium">{t.username}</span>
                <span className="text-xs text-gray-400">
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
