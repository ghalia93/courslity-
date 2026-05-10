"use client";

// Renders the reusable Hero UI component.
import { useState } from "react";
import Stats from "./Stats";
import Searchbar from "./Searchbar";

export default function Hero() {
  const [query, setQuery] = useState("");

  return (
    <div
      className="mx-auto max-w-4xl px-4 pt-14 pb-10 sm:px-8 sm:pt-20 sm:pb-12 lg:pt-28"
    >
      <div className="text-center">
        <h1 className="mb-5 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
          The{" "}
          <span className="bg-gradient-to-r from-[#6155F5] to-teal-500 bg-clip-text text-transparent">
            Real Truth
          </span>{" "}
          About University Courses
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg md:text-xl">
          Official descriptions lie. Get unfiltered reviews on workload, grading
          fairness, exam difficulty, and what professors won&apos;t tell you.
        </p>

        <Searchbar query={query} setQuery={setQuery} />
      </div>

      <Stats />
    </div>
  );
}
