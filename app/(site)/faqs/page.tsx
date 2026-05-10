// Renders the site faqs page.
import Link from "next/link";
import { HelpCircle, MessageSquareText, Search, ShieldCheck } from "lucide-react";
import Button from "@/components/Button";

const faqs = [
  {
    question: "What is Coursality?",
    answer:
      "Coursality helps students compare university courses using real student reviews about workload, grading, attendance, and exam difficulty.",
  },
  {
    question: "Do I need an account to browse courses?",
    answer:
      "No. You can search and browse courses without an account. You only need an account for features that depend on your student identity.",
  },
  {
    question: "Are reviews anonymous?",
    answer:
      "Yes. Reviews are shown without exposing the student who submitted them, so students can share honest course experiences.",
  },
  {
    question: "How do I find a course?",
    answer:
      "Use the search bar to look by course code, title, department, university name, or university abbreviation like AUB, LAU, LIU, BAU, USJ, or UOB.",
  },
  {
    question: "Can I search using university abbreviations?",
    answer:
      "Yes. The search understands common abbreviations for the universities in the project, including AUB, LAU, LIU, BAU, USJ, and UOB.",
  },
  {
    question: "What do the course ratings mean?",
    answer:
      "Ratings summarize student feedback about exam difficulty, workload, attendance expectations, and grading fairness.",
  },
  {
    question: "Why can't I find a course?",
    answer:
      "The course may not be in the database yet, or it may use a different code or title. Try searching by university or department.",
  },
  {
    question: "How can I report a problem?",
    answer:
      "If something looks wrong, use the report option from your account page so the team can review it.",
  },
];

const highlights = [
  {
    title: "Search Faster",
    description: "Find courses by code, title, university, or department.",
    icon: Search,
  },
  {
    title: "Read Real Reviews",
    description: "Compare workload, exams, grading, and attendance.",
    icon: MessageSquareText,
  },
  {
    title: "Stay Anonymous",
    description: "Share feedback without exposing your identity.",
    icon: ShieldCheck,
  },
];

export default function FAQsPage() {
  return (
    <main className="bg-white">
      <section className="px-4 pt-20 pb-12 sm:px-6 sm:pt-28 md:pt-32">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#EEF2FF] text-[#6155F5]">
              <HelpCircle className="h-6 w-6" />
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-5xl">
              Frequently Asked Questions
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg sm:leading-8">
              Quick answers about searching courses, reading reviews, and using
              Coursality with confidence.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {highlights.map(({ title, description, icon: Icon }) => (
              <div
                key={title}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm"
              >
                <Icon className="h-6 w-6 text-[#6155F5]" />
                <h2 className="mt-4 text-base font-semibold text-gray-900">
                  {title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-gray-500">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 sm:pb-20">
        <div className="mx-auto max-w-3xl">
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-[#6155F5]/40"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-base font-semibold text-gray-900">
                  <span>{faq.question}</span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gray-100 text-lg leading-none text-[#6155F5] transition group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 text-sm leading-7 text-gray-600">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>

          <div className="mt-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Ready to explore courses?
            </h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-gray-500">
              Search the course catalog and compare real student experiences
              before choosing what to take next.
            </p>
            <div className="mt-6">
              <Link href="/courses">
                <Button className="h-11">Browse Courses</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
