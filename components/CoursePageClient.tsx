"use client";

// Renders the reusable CoursePageClient UI component.
import { useState } from "react";
import Button from "@/components/Button";
import WriteReviewCard from "@/components/WriteReviewCard";
import StudentReviews from "@/components/StudentReviews";

interface Props {
  slug: string;
}

export default function CoursePageClient({ slug }: Props) {
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    setShowWriteReview(false);
    setRefreshKey((k) => k + 1); // triggers StudentReviews to refetch
  }

  return (
    <div>
      {!showWriteReview && (
        <Button onClick={() => setShowWriteReview(true)} variant="primary">
          Leave a review
        </Button>
      )}
      {showWriteReview && (
        <WriteReviewCard
          slug={slug}
          onSubmit={handleReviewSubmitted}
          onCancel={() => setShowWriteReview(false)}
        />
      )}
      <StudentReviews slug={slug} refreshKey={refreshKey} />
    </div>
  );
}
