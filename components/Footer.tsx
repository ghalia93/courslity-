"use client";

// Renders the reusable Footer UI component.
import NavLink from "./NavLink";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#6155F5] sm:text-4xl">Coursality</h2>
          </div>

          <div className="text-center md:text-left">
            <h3 className="mb-5 text-lg font-bold text-black">Quick Links</h3>
            <nav className="flex flex-col gap-3">
              <NavLink href="/">Home</NavLink>
              <NavLink href="/courses">Courses</NavLink>
              <NavLink href="/university">University</NavLink>
              <NavLink href="/roadmaps">Roadmaps</NavLink>
              <NavLink href="/faqs">FAQs</NavLink>
              <NavLink href="/about">About</NavLink>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-end text-center md:text-right">

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500">
              Did you find what you were looking for? Share your feedback!
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="border-t border-gray-100" />
      </div>

      <div className="py-8 text-center text-sm text-gray-400">
        (c) 2026 Coursality
      </div>

    </footer>
  );
}
