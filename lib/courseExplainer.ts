type CourseExplainerInput = {
  code: string;
  title: string;
  description: string;
  credits?: string | number;
  level?: string;
  language?: string;
  university: string;
  department: string;
};

export type CourseExplainerScene = {
  title: string;
  caption: string;
  bullets: string[];
};

export type CourseExplainer = {
  title: string;
  durationSeconds: number;
  scenes: CourseExplainerScene[];
  narration: string;
};

const FOCUS_RULES = [
  {
    terms: ["programming", "coding", "software", "java", "algorithm"],
    label: "programming and problem solving",
  },
  {
    terms: ["network", "protocol", "routing", "lan", "tcp", "internet"],
    label: "networks, protocols, and connected systems",
  },
  {
    terms: ["communication", "modulation", "signal", "noise", "wireless"],
    label: "signals and communication systems",
  },
  {
    terms: ["circuit", "electronics", "digital", "logic", "micro"],
    label: "circuits, digital logic, and hardware design",
  },
  {
    terms: ["processor", "architecture", "memory", "cache", "mips"],
    label: "computer architecture and memory systems",
  },
  {
    terms: ["math", "calculus", "linear", "equation", "statistics"],
    label: "mathematical tools for engineering analysis",
  },
  {
    terms: ["lab", "experiment", "simulate", "test", "hardware"],
    label: "hands-on lab work and practical testing",
  },
  {
    terms: ["project", "capstone", "team", "documentation", "presentation"],
    label: "engineering projects, teamwork, and documentation",
  },
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/&/g, "and").replace(/\s+/g, " ").trim();
}

function cleanSentence(value: string) {
  return value
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:])/g, "$1")
    .trim();
}

function limitWords(value: string, maxWords: number) {
  const words = cleanSentence(value).split(/\s+/).filter(Boolean);
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}...`;
}

function formatCredits(value: string | number | undefined) {
  if (value == null || value === "") return "credit";
  const text = String(value).trim();
  return text.toLowerCase().includes("cr") ? text : `${text} cr.`;
}

function getFocusAreas(course: CourseExplainerInput) {
  const source = normalizeText(`${course.title} ${course.description}`);
  const matches = FOCUS_RULES.filter((rule) =>
    rule.terms.some((term) => source.includes(term)),
  ).map((rule) => rule.label);

  const uniqueMatches = Array.from(new Set(matches));
  if (uniqueMatches.length >= 3) return uniqueMatches.slice(0, 3);

  return [
    ...uniqueMatches,
    "core engineering concepts",
    "practical examples and applied thinking",
    "skills that support later computer engineering courses",
  ].slice(0, 3);
}

export function isLiuComputerCommunicationCourse(
  course: Pick<CourseExplainerInput, "university" | "department">,
) {
  const university = normalizeText(course.university);
  const department = normalizeText(course.department);

  const isLiu =
    university === "liu" ||
    university.includes("lebanese international university");
  const isComputerCommunicationsEngineering =
    department.includes("computer") &&
    department.includes("communication") &&
    department.includes("engineering");

  return isLiu && isComputerCommunicationsEngineering;
}

export function buildCourseExplainer(
  course: CourseExplainerInput,
): CourseExplainer {
  const focusAreas = getFocusAreas(course);
  const description =
    limitWords(course.description, 42) ||
    "This course builds important knowledge for the Computer and Communications Engineering program.";
  const credits = formatCredits(course.credits);
  const level = course.level ? `${course.level} ` : "";

  const scenes: CourseExplainerScene[] = [
    {
      title: "Course Snapshot",
      caption: `${course.code} is ${course.title}, a ${credits} ${level}course in LIU Computer and Communications Engineering.`,
      bullets: [course.department, course.university, course.language || "English"],
    },
    {
      title: "What You Study",
      caption: description,
      bullets: focusAreas,
    },
    {
      title: "Why It Matters",
      caption: `This course helps connect engineering theory with the real systems students meet in software, hardware, networks, and communication technologies.`,
      bullets: [
        "build technical vocabulary",
        "practice engineering reasoning",
        "prepare for advanced courses",
      ],
    },
    {
      title: "How To Approach It",
      caption: `Review the basics before each lecture, keep notes from labs or examples, and use Coursality reviews to understand workload, exams, attendance, and grading expectations.`,
      bullets: [
        "study the description first",
        "check prerequisites",
        "compare student ratings",
      ],
    },
  ];

  const narration = scenes
    .map(
      (scene) =>
        `${scene.title}. ${scene.caption} Key points: ${scene.bullets.join(", ")}.`,
    )
    .join(" ");

  return {
    title: `${course.code} ${course.title} explainer`,
    durationSeconds: 110,
    scenes,
    narration,
  };
}
