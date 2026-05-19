// Handles API courses slug requests.
import { NextResponse } from "next/server";
import {
  getCourseDetailById,
  getCourseDetailBySlug,
} from "@/lib/courseDetails";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);
    const courseId = Number(searchParams.get("course_id") || 0);
    const course =
      Number.isInteger(courseId) && courseId > 0
        ? await getCourseDetailById(courseId, slug)
        : await getCourseDetailBySlug(slug);

    if (!course) {
      return NextResponse.json(
        { success: false, message: "Course not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      course,
    });
  } catch (error: unknown) {
    console.error("GET COURSE BY SLUG ERROR:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch course" },
      { status: 500 },
    );
  }
}
