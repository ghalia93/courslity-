"use client";

// Renders the admin overview dashboard with metrics, charts, and verification.
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { BadgeCheck, BookOpen, Star, TrendingUp, Users } from "lucide-react";
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

type PendingVerificationUser = {
  id: number;
  name: string;
  email: string;
  university: string | null;
  role: string;
  joined: string;
};

type Metrics = {
  totalUsers: number;
  totalCourses: number;
  totalReviews: number;
  averageRating: number;
  pendingVerificationCount: number;
  pendingVerification: PendingVerificationUser[];
  userGrowth: ChartPoint[];
  reviewsTrend: ChartPoint[];
  ratingDistribution: CourseRatingPoint[];
};

const EMPTY: Metrics = {
  totalUsers: 0,
  totalCourses: 0,
  totalReviews: 0,
  averageRating: 0,
  pendingVerificationCount: 0,
  pendingVerification: [],
  userGrowth: [],
  reviewsTrend: [],
  ratingDistribution: [],
};

function dateOnly(x: string | Date | null | undefined) {
  if (!x) return "";
  return String(x).slice(0, 10);
}

function roleLabel(role: string) {
  if (role === "super_admin") return "University Admin";
  if (role === "admin") return "Admin";
  return "Student";
}

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
  const [verifyingUserId, setVerifyingUserId] = useState<number | null>(null);

  const loadMetrics = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/metrics", {
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load metrics");
      }

      setMetrics({
        ...EMPTY,
        ...data,
        pendingVerification: data?.pendingVerification || [],
        userGrowth: data?.userGrowth || [],
        reviewsTrend: data?.reviewsTrend || [],
        ratingDistribution: data?.ratingDistribution || [],
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMetrics();
  }, [loadMetrics]);

  async function verifyUser(userId: number) {
    setVerifyingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify" }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.message || "Failed to verify user");
      }

      await loadMetrics();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Failed to verify user");
    } finally {
      setVerifyingUserId(null);
    }
  }

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
    value: (metrics.pendingVerificationCount ?? 0).toLocaleString(),
    label: "Pending Verification",
    Icon: BadgeCheck,
    iconBg: "bg-[#FFF1E8]",
    iconColor: "text-[#F2994A]",
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

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} loading={loading} />
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900">
              Pending Verification
            </h2>
            <p className="text-sm text-gray-500">
              Approve students and admins waiting for account verification.
            </p>
          </div>

          <Link
            href="/admin/users"
            className="inline-flex h-9 items-center justify-center rounded-md border border-gray-300 px-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Open Users
          </Link>
        </div>

        <div className="mt-4 overflow-x-auto">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="h-12 animate-pulse rounded-lg bg-gray-100"
                />
              ))}
            </div>
          ) : metrics.pendingVerification.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
              No users are waiting for verification.
            </div>
          ) : (
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-xs text-gray-500">
                <tr className="border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">User</th>
                  <th className="py-2 pr-4 font-medium">University</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Joined</th>
                  <th className="py-2 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {metrics.pendingVerification.map((pendingUser) => (
                  <tr
                    key={pendingUser.id}
                    className="border-b border-gray-100 last:border-0"
                  >
                    <td className="py-3 pr-4">
                      <p className="font-medium text-gray-900">
                        {pendingUser.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {pendingUser.email}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {pendingUser.university || "No university"}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {roleLabel(pendingUser.role)}
                    </td>
                    <td className="py-3 pr-4 text-gray-700">
                      {dateOnly(pendingUser.joined)}
                    </td>
                    <td className="py-3 text-right">
                      <button
                        type="button"
                        onClick={() => verifyUser(pendingUser.id)}
                        disabled={verifyingUserId === pendingUser.id}
                        className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md bg-[#6155F5] px-3 text-xs font-medium text-white transition hover:bg-[#4f45d4] disabled:opacity-60"
                      >
                        <BadgeCheck size={15} />
                        {verifyingUserId === pendingUser.id
                          ? "Verifying..."
                          : "Verify"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <UserGrowthChart data={metrics.userGrowth} />
        <ReviewTrendChart data={metrics.reviewsTrend} />
        <RatingsDistributionChart data={metrics.ratingDistribution} />
      </div>
    </div>
  );
}
