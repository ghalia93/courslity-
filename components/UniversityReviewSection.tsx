"use client";

// Coordinates the university review form and review list.
import { useState } from "react";
import Button from "@/components/Button";
import WriteUniversityReviewCard from "@/components/WriteUniversityReviewCard";
import UniversityReviews from "@/components/UniversityReviews";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/Toastprovider";

type UniversityReviewSectionProps = {
  universityId: number;
};

export default function UniversityReviewSection({
  universityId,
}: UniversityReviewSectionProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  function handleReviewSubmitted() {
    setShowWriteReview(false);
    setRefreshKey((key) => key + 1);
  }

  function handleLeaveReviewClick() {
    if (!user) {
      toast("You must be logged in to leave a review", "error");
      return;
    }

    setShowWriteReview(true);
  }

  return (
    <section className="mt-6">
      {!showWriteReview && (
        <Button onClick={handleLeaveReviewClick} variant="primary">
          Leave a review
        </Button>
      )}

      {showWriteReview && (
        <WriteUniversityReviewCard
          universityId={universityId}
          onSubmit={handleReviewSubmitted}
          onCancel={() => setShowWriteReview(false)}
        />
      )}

      <UniversityReviews universityId={universityId} refreshKey={refreshKey} />
    </section>
  );
}
