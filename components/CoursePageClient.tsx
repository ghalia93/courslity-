"use client";

// Renders the reusable CoursePageClient UI component.
import { useState } from "react";
import Button from "@/components/Button";
import WriteReviewCard from "@/components/WriteReviewCard";
import StudentReviews from "@/components/StudentReviews";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/Toastprovider";

interface Props {
  slug: string;
  courseId: number;
}

export default function CoursePageClient({ slug, courseId }: Props) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    setShowWriteReview(false);
    setRefreshKey((k) => k + 1); // triggers StudentReviews to refetch
  }

  function handleLeaveReviewClick() {
    if (!user) {
      toast("You must be logged in to leave a review", "error");
      return;
    }

    setShowWriteReview(true);
  }

  return (
    <div>
      {!showWriteReview && (
        <Button onClick={handleLeaveReviewClick} variant="primary">
          Leave a review
        </Button>
      )}
      {showWriteReview && (
        <WriteReviewCard
          slug={slug}
          courseId={courseId}
          onSubmit={handleReviewSubmitted}
          onCancel={() => setShowWriteReview(false)}
        />
      )}
      <StudentReviews slug={slug} courseId={courseId} refreshKey={refreshKey} />
    </div>
  );
}
