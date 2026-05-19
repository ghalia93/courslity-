// Renders the public home page with hero content, featured courses, and feedback.
import Hero from "../../components/Hero";
import Link from "next/link";
import { headers } from "next/headers";
import CourseCard from "../../components/CourseCard";
import HowItWorks from "../../components/HowItWorks";
import FeedbackCarousel from "../../components/FeedbackCarousel";
import { ArrowRight, BookOpen, Map } from "lucide-react";
import type { Course } from "@/types/course";

async function getSiteOrigin() {
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  const requestHeaders = await headers();
  const host = requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

async function getRandomCourses() {
  try {
    const siteOrigin = await getSiteOrigin();
    const res = await fetch(
      `${siteOrigin}/api/courses?limit=50&page=1`,
      { cache: "no-store" },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const courses: Course[] = data.courses ?? [];

    // Shuffle and return 2
    for (let i = courses.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [courses[i], courses[j]] = [courses[j], courses[i]];
    }
    return courses.slice(0, 2);
  } catch {
    return [];
  }
}

export default async function Home() {
  const courses = await getRandomCourses();

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-7xl">
        <Hero />

        <div className="mt-6 grid gap-3 md:grid-cols-2">
          <Link
            href="/courses"
            className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[#111827] transition hover:border-[#6155F5]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl lg:text-2xl">
              <BookOpen size={22} className="shrink-0 text-[#6155F5]" />
              Browse Courses
            </span>
            <ArrowRight className="h-6 w-6 shrink-0 transition-transform duration-200 hover:translate-x-1" />
          </Link>

          <Link
            href="/roadmaps"
            className="flex min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 text-[#111827] transition hover:border-[#6155F5]"
          >
            <span className="inline-flex min-w-0 items-center gap-2 text-lg font-extrabold tracking-tight sm:text-xl lg:text-2xl">
              <Map size={22} className="shrink-0 text-[#6155F5]" />
              Explore Roadmaps
            </span>
            <ArrowRight className="h-6 w-6 shrink-0 transition-transform duration-200 hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {courses.length > 0 ? (
            courses.map((course) => (
              <CourseCard
                key={course.courseId}
                courseId={course.courseId}
                code={course.code}
                title={course.title}
                university={course.university}
                department={course.department}
                credits={`${course.credits} cr.`}
                level={course.level}
                language={course.language}
                averageRating={course.averageRating ?? null}
                description={course.description}
                ratings={
                  course.ratings ?? {
                    exam: null,
                    workload: null,
                    attendance: null,
                    grading: null,
                  }
                }
                reviewCount={course.reviewCount ?? 0}
              />
            ))
          ) : (
            <p className="text-gray-400 col-span-2 text-center py-10">
              Could not load courses.
            </p>
          )}
        </div>
      </section>

      <HowItWorks />
      <FeedbackCarousel />
    </main>
  );
}
