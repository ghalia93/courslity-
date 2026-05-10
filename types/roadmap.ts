// Defines shared TypeScript types for roadmap data.
export type RoadmapSemester = "fall" | "spring" | "summer";

export type RoadmapCourse = {
  roadmap_course_id?: number;
  course_id: number;
  code: string;
  title: string;
  credits: number;
  level: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
  year_number: number;
  semester: RoadmapSemester;
  sequence_order: number;
};

export type RoadmapTerm = {
  year_number: number;
  semester: RoadmapSemester;
  courses: RoadmapCourse[];
};

export type RoadmapSummary = {
  roadmap_id: number;
  title: string;
  university_id: number;
  university: string;
  department_id: number;
  department: string;
  major_id: number;
  major: string;
  level: string;
  total_credits: number;
  planned_credits: number;
  course_count: number;
  terms: RoadmapTerm[];
};

export type RoadmapUniversityOption = {
  university_id: number;
  name: string;
  email_domain?: string;
};

export type RoadmapDepartmentOption = {
  department_id: number;
  name: string;
  university_id: number;
  university: string;
};

export type RoadmapMajorOption = {
  major_id: number;
  name: string;
  department_id: number;
  department: string;
  university_id: number;
  university: string;
};

