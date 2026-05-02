import { notFound } from "next/navigation";
import CourseInfo from "@/components/CourseInfo";
import CoursePageClient from "@/components/CoursePageClient";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCourse(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"}/api/courses/${slug}`,
      { next: { revalidate: 3600 } },
    );
    if (res.status === 404) return null;
    if (!res.ok) throw new Error("Failed to fetch course");
    const data = await res.json();
    return data.course ?? null;
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
