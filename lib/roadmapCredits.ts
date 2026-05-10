// Calculates roadmap credit totals from grouped roadmap courses.
import type { RoadmapSemester } from "@/types/roadmap";

export const ROADMAP_TERM_MIN_CREDITS = 3;
export const ROADMAP_TERM_MAX_CREDITS = 19;

export type RoadmapCreditItem = {
  credits: number;
  year_number: number;
  semester: RoadmapSemester;
};

export type RoadmapTermCreditSummary = {
  key: string;
  year_number: number;
  semester: RoadmapSemester;
  credits: number;
};

export function getRoadmapTermCreditSummaries(
  items: RoadmapCreditItem[],
): RoadmapTermCreditSummary[] {
  const summaries = new Map<string, RoadmapTermCreditSummary>();

  for (const item of items) {
    const key = `${item.year_number}-${item.semester}`;
    const current = summaries.get(key);

    if (current) {
      current.credits += Number(item.credits) || 0;
    } else {
      summaries.set(key, {
        key,
        year_number: item.year_number,
        semester: item.semester,
        credits: Number(item.credits) || 0,
      });
    }
  }

  return Array.from(summaries.values());
}

export function findRoadmapTermCreditViolation(items: RoadmapCreditItem[]) {
  return getRoadmapTermCreditSummaries(items).find(
    (term) =>
      term.credits < ROADMAP_TERM_MIN_CREDITS ||
      term.credits > ROADMAP_TERM_MAX_CREDITS,
  );
}
