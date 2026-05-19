// Renders the site courses slug page.
import { notFound } from "next/navigation";
import CourseInfo from "@/components/CourseInfo";
import CoursePageClient from "@/components/CoursePageClient";
import {
  getCourseDetailById,
  getCourseDetailBySlug,
} from "@/lib/courseDetails";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ course_id?: string }>;
}

async function getCourse(slug: string, courseId?: number) {
  try {
    if (courseId) {
      return await getCourseDetailById(courseId, slug);
    }

    return await getCourseDetailBySlug(slug);
  } catch {
    return null;
  }
}

export default async function CoursePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = searchParams ? await searchParams : {};
  const courseId = Number(query.course_id || 0);
  const course = await getCourse(
    slug,
    Number.isInteger(courseId) && courseId > 0 ? courseId : undefined,
  );

  if (!course) notFound();

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <CourseInfo course={course} />
        <CoursePageClient slug={slug} courseId={course.courseId} />
      </section>
    </main>
  );
}
