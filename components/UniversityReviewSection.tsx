"use client";

// Coordinates the university review form and review list.
import { useState } from "react";
import Button from "@/components/Button";
import WriteUniversityReviewCard from "@/components/WriteUniversityReviewCard";
import UniversityReviews from "@/components/UniversityReviews";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/toast/Toastprovider";
import { isAdminRole } from "@/lib/roles";

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
  const isAdminUser = isAdminRole(user?.role);

  function handleReviewSubmitted() {
    setShowWriteReview(false);
    setRefreshKey((key) => key + 1);
  }

  function handleLeaveReviewClick() {
    if (!user) {
      toast("You must be logged in to leave a review", "error");
      return;
    }

    if (isAdminRole(user.role)) {
      toast("Admins cannot leave student reviews", "error");
      return;
    }

    setShowWriteReview(true);
  }

  return (
    <section className="mt-6">
      {!showWriteReview && !isAdminUser && (
        <Button onClick={handleLeaveReviewClick} variant="primary">
          Leave a review
        </Button>
      )}

      {showWriteReview && !isAdminUser && (
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
