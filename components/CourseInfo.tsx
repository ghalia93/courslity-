"use client";

// Renders the reusable CourseInfo UI component.
import {
  ArrowLeft,
  School,
  GraduationCap,
  Star,
  FileText,
  Briefcase,
  MapPin,
  Scale,
} from "lucide-react";
import Link from "next/link";
import { formatCourseLevel } from "@/lib/courseLevels";

type CourseRatings = {
  exam: number | null;
  workload: number | null;
  attendance: number | null;
  grading: number | null;
};

type Course = {
  courseId: number;
  slug: string;
  code: string;
  title: string;
  description: string;
  credits: string;
  level: string;
  language: string;
  department: string;
  university: string;
  reviewCount: number;
  averageRating: number | null;
  ratings: CourseRatings;
  prerequisites: { course_id: number; code: string; title: string }[];

};

function StarRating({ rating }: { rating: number }) {
  const fullStars = Math.floor(rating);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-5 w-5 ${
            i < fullStars ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | null;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex justify-between">
        <span className="text-sm text-gray-500">{label}</span>
        {icon}
      </div>
      <div className="text-center">
        {value != null ? (
          <>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {value.toFixed(1)}
            </p>
            <p className="text-[12px] text-gray-400">out of 5</p>
          </>
        ) : (
          <p className="mt-1 text-2xl font-bold text-gray-400">N/A</p>
        )}
      </div>
    </div>
  );
}

export default function CourseInfo({ course }: { course: Course }) {
  return (
    <div className="mx-auto max-w-5xl py-6 pt-0 sm:py-8">
      <Link
        href="/courses"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      {/* Code + credits */}
      <div className="flex items-center gap-3">
        <span className="rounded-full bg-[#6155F5]/10 px-3 py-1 text-sm font-medium text-[#6155F5]">
          {course.code}
        </span>
        <span className="text-sm text-gray-400">{course.credits}</span>
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
        {course.title}
      </h1>

      {/* University + department */}
      <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1">
          <School className="h-4 w-4 text-[#6155F5]" />
          {course.university}
        </div>
        <div className="flex items-center gap-1">
          <GraduationCap className="h-4 w-4 text-[#6155F5]" />
          {course.department}
        </div>
      </div>

      {/* Rating row */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {course.averageRating != null ? (
          <>
            <StarRating rating={course.averageRating} />
            <span className="font-semibold text-gray-900">
              {course.averageRating.toFixed(2)}/5
            </span>
          </>
        ) : (
          <span className="text-sm text-gray-400">No rating yet</span>
        )}
        <span className="text-sm text-gray-400">
          (
          {course.reviewCount === 0
            ? "No reviews yet"
            : course.reviewCount === 1
              ? "1 Review"
              : `${course.reviewCount} Reviews`}
          )
        </span>
      </div>

      <div className="my-6 h-px w-full bg-gray-200" />

      {/* Description */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900">
          Course Description
        </h2>
        <p className="mt-2 text-left leading-relaxed text-gray-600 sm:text-justify">
          {course.description}
        </p>
      </div>

      {/* Level + language */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-400">Level</div>
          <div className="mt-1 font-medium text-gray-900">
            {formatCourseLevel(course.level)}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="text-xs text-gray-400">Language</div>
          <div className="mt-1 font-medium text-gray-900">
            {course.language}
          </div>
        </div>
      </div>

      {/* Prerequisites */}
      {course.prerequisites?.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-900">Prerequisites</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {course.prerequisites.map((prereq) => (
              <Link
                key={prereq.course_id}
                href={`/courses/${prereq.code.trim().toLowerCase().replace(/\s+/g, "-")}`}
                className="inline-flex max-w-full flex-wrap rounded-full bg-[#6155F5]/10 px-3 py-1 text-sm font-medium text-[#6155F5] transition hover:bg-[#6155F5]/20"
              >
                {prereq.code} - {prereq.title}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ratings */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900">Course Ratings</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            label="Exam Difficulty"
            value={course.ratings?.exam ?? null}
            icon={<FileText className="h-5 w-5 text-[#6155F5]" />}
          />
          <MetricCard
            label="Workload"
            value={course.ratings?.workload ?? null}
            icon={<Briefcase className="h-5 w-5 text-[#6155F5]" />}
          />
          <MetricCard
            label="Attendance Strictness"
            value={course.ratings?.attendance ?? null}
            icon={<MapPin className="h-5 w-5 text-[#6155F5]" />}
          />
          <MetricCard
            label="Grading Fairness"
            value={course.ratings?.grading ?? null}
            icon={<Scale className="h-5 w-5 text-[#6155F5]" />}
          />
        </div>
      </div>
    </div>
  );
}
