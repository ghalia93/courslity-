"use client";

// Renders the reusable CourseCard UI component.
import Link from "next/link";
import React from "react";
import { FileText, Briefcase, MapPin, Scale, User } from "lucide-react";
import { normalizeCourseDescription } from "@/lib/courseDescriptionText";
import { formatCourseLevel } from "@/lib/courseLevels";

type CourseRatings = {
  exam: number | null;
  workload: number | null;
  attendance: number | null;
  grading: number | null;
};

type CourseCardProps = {
  courseId: number;
  code: string;
  title: string;
  university: string;
  department: string;
  credits: string | number;
  level: string;
  language: string;
  averageRating: number | null;
  description: string;
  ratings: CourseRatings;
  reviewCount: number;
  className?: string;
};

function StarIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 17.27l5.18 3.05-1.39-5.93 4.61-4-6.07-.52L12 4.5 9.67 9.87l-6.07.52 4.61 4-1.39 5.93L12 17.27z" />
    </svg>
  );
}

function MetricValue({ value }: { value: number | null }) {
  return (
    <span className="shrink-0 text-sm text-gray-500 sm:text-[15px]">
      {value != null ? `${value}/5` : "N/A"}
    </span>
  );
}

function formatReviewCount(count: number): string {
  if (count === 0) return "No reviews yet";
  if (count === 1) return "1 Review";
  return `${count} Reviews`;
}

export default function CourseCard({
  courseId,
  code,
  title,
  university,
  department,
  credits,
  level,
  language,
  averageRating,
  description,
  ratings = { exam: null, workload: null, attendance: null, grading: null },
  reviewCount,
  className = "",
}: CourseCardProps) {
  const slug = code.trim().toLowerCase().replace(/\s+/g, "-");
  const displayDescription = normalizeCourseDescription({
    description,
  });

  return (
    <Link
      href={`/courses/${slug}?course_id=${courseId}`}
      className="block w-full min-w-0"
    >
      <div
        className={`w-full min-w-0 rounded-xl bg-white p-4 sm:min-h-[250px] sm:rounded-2xl sm:p-5
      shadow-[0_12px_40px_rgba(0,0,0,0.12)]
      cursor-pointer transition-transform hover:scale-[1.005]
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.15)]
      ${className}`}
      >
        {/* Title row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold tracking-tight text-[#111827] sm:text-[20px]">
              <span className="text-[#6155F5]">{code}</span> {title}
            </h3>
            <p className="mt-1 text-sm leading-5 text-gray-400 sm:text-[15px]">
              {university} - {department} - {credits}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            {averageRating != null ? (
              <>
                <span className="text-lg font-semibold text-[#111827] sm:text-[20px]">
                  {averageRating.toFixed(1)}
                </span>
                <StarIcon className="h-6 w-6 text-[#F5C542]" />
              </>
            ) : (
              <span className="text-[15px] text-gray-400">No rating</span>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="text-[13px] font-medium text-[#6155F5] bg-[#EEF2FF] px-2 py-1 rounded-full">
            {formatCourseLevel(level)}
          </span>
          <span className="text-[13px] font-medium text-[#10B981] bg-[#D1FAE5] px-2 py-1 rounded-full">
            {language}
          </span>
        </div>

        {/* Description */}
        <div className="mt-3 rounded-xl border border-[#E4E2FF] bg-[#F8F7FF] p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-[#6155F5]">
            Course Description
          </p>
          <p className="mt-1 text-[15px] leading-relaxed text-gray-800">
            {displayDescription || "No course description has been added yet."}
          </p>
        </div>

        {/* Metrics */}
        <div className="mt-4 rounded-xl border border-gray-300 p-3">
          <div className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <FileText className="h-5 w-5 shrink-0 text-[#6155F5]" />
              <span className="min-w-0 flex-1 text-sm text-gray-500 sm:text-[15px]">
                Exam
              </span>
              <MetricValue value={ratings.exam} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Briefcase className="h-5 w-5 shrink-0 text-[#6155F5]" />
              <span className="min-w-0 flex-1 text-sm text-gray-500 sm:text-[15px]">
                Workload
              </span>
              <MetricValue value={ratings.workload} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <MapPin className="h-5 w-5 shrink-0 text-[#6155F5]" />
              <span className="min-w-0 flex-1 text-sm text-gray-500 sm:text-[15px]">
                Attendance
              </span>
              <MetricValue value={ratings.attendance} />
            </div>

            <div className="flex min-w-0 items-center gap-2">
              <Scale className="h-5 w-5 shrink-0 text-[#6155F5]" />
              <span className="min-w-0 flex-1 text-sm text-gray-500 sm:text-[15px]">
                Grading
              </span>
              <MetricValue value={ratings.grading} />
            </div>
          </div>
        </div>

        {/* Review count */}
        <div className="mt-3 flex items-center gap-2 text-gray-400">
          <User className="h-6 w-6" />
          <span className="text-[15px] font-medium">
            {formatReviewCount(reviewCount)}
          </span>
        </div>
      </div>
    </Link>
  );
}
