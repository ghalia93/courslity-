"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, Star, TrendingUp } from "lucide-react";
import UserGrowthChart from "@/components/admin/charts/UserGrowthChart";
import ReviewTrendChart from "@/components/admin/charts/ReviewTrendChart";
import RatingsDistributionChart from "@/components/admin/charts/RatingsDistributionChart";

type ChartPoint = { date: string; count: number };
type CourseRatingPoint = {
  courseId: number;
  code: string;
  title: string;
  averageRating: number;
  reviewCount: number;
};

type Metrics = {
  totalUsers: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
  userGrowth: ChartPoint[];
  reviewsTrend: ChartPoint[];
  ratingDistribution: CourseRatingPoint[];
};

const EMPTY: Metrics = {
  totalUsers: 0,
  totalCourses: 0,
  totalReviews: 0,
  averageRating: 0,
  userGrowth: [],
  reviewsTrend: [],
  ratingDistribution: [],
};

function StatCard({
  value,
  label,
  Icon,
  iconBg,
  iconColor,
  loading,
}: {
  value: string;
  label: string;
  Icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  loading: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-300 bg-white p-4">
      <div
        className={`h-10 w-10 rounded-lg ${iconBg} flex items-center justify-center`}
      >
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>
      <div className="mt-3 text-lg font-semibold text-black">
        {loading ? (
          <span className="inline-block h-6 w-20 animate-pulse rounded bg-gray-200" />
        ) : (
          value
        )}
      </div>
      <div className="text-xs text-gray-700">{label}</div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/metrics")
      .then((r) => r.json())
      .then((data) => setMetrics(data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

 const stats = [
  {
    value: (metrics.totalUsers ?? 0).toLocaleString(),
    label: "Total Users",
    Icon: Users,
    iconBg: "bg-[#E8F1FF]",
    iconColor: "text-[#2F80ED]",
  },
  {
    value: (metrics.totalCourses ?? 0).toLocaleString(),
    label: "Total Courses",
    Icon: BookOpen,
    iconBg: "bg-[#FFE9EE]",
    iconColor: "text-[#EB5757]",
  },
  {
    value: (metrics.totalReviews ?? 0).toLocaleString(),
    label: "Total Reviews",
    Icon: Star,
    iconBg: "bg-[#FFF6D9]",
    iconColor: "text-[#F2C94C]",
  },
  {
    value: (metrics.averageRating ?? 0).toFixed(1),
    label: "Average Rating",
    Icon: TrendingUp,
    iconBg: "bg-[#E8F7EA]",
    iconColor: "text-[#27AE60]",
  },
];
  return (
    <div>
      <h1 className="text-2xl font-semibold text-black">Overview</h1>
      <p className="mt-1 text-sm text-gray-500">
        Welcome Back! Here&apos;s what&apos;s happening with your platform
        today.
      </p>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <UserGrowthChart data={metrics.userGrowth} />
        <ReviewTrendChart data={metrics.reviewsTrend} />
        <RatingsDistributionChart data={metrics.ratingDistribution} />
      </div>
    </div>
  );
}
