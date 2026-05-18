// Renders the site courses slug page.
import { notFound } from "next/navigation";
import CourseInfo from "@/components/CourseInfo";
import CoursePageClient from "@/components/CoursePageClient";
import { getCourseDetailBySlug } from "@/lib/courseDetails";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    return await getCourseDetailBySlug(slug);
  } catch {
    return null;
  }
}

export default async function CoursePage({ params }: Props) {
  const { slug } = await params;
  const course = await getCourse(slug);

  if (!course) notFound();

  return (
    <main className="min-h-screen bg-[#FFFFFF] px-4 py-8 sm:px-6 sm:py-10">
      <section className="mx-auto max-w-5xl">
        <CourseInfo course={course} />
        <CoursePageClient slug={slug} />
      </section>
    </main>
  );
}
