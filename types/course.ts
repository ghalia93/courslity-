// Defines shared TypeScript types for course data.
export interface Course {
  courseId: number;
  slug?: string;
  code: string;
  title: string;
  university: string;
  department: string;
  description: string;
  credits: string | number;
  level: string;
  language: string;
  year?: number | null;
  semester?: string | null;
  averageRating: number | null;
  ratings: {
    exam: number | null;
    workload: number | null;
    attendance: number | null;
    grading: number | null;
  };
  reviewCount: number;
  prerequisites?: { course_id: number; code: string; title: string }[];
}
