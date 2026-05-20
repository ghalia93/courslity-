"use client";

// Renders the reusable Footer UI component.
import NavLink from "./NavLink";

export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-200 bg-white transition-colors dark:border-neutral-800 dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-6 py-12 md:px-10">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-[#6155F5] dark:text-violet-300 sm:text-4xl">Coursality</h2>
          </div>

          <div className="text-center md:text-left">
            <h3 className="mb-5 text-lg font-bold text-black dark:text-neutral-100">Quick Links</h3>
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
            <h3 className="mb-5 text-lg font-bold text-black dark:text-neutral-100">Contact Info</h3>
            <div className="flex flex-col gap-2 text-sm text-gray-500 dark:text-neutral-400">
              <a
                href="mailto:sayedahmadghalia2@gmail.com"
                className="transition-colors hover:text-[#6155F5] dark:hover:text-violet-300"
              >
                sayedahmadghalia2@gmail.com
              </a>
              <a
                href="mailto:abbas123@gmail.com"
                className="transition-colors hover:text-[#6155F5] dark:hover:text-violet-300"
              >
                abbas123@gmail.com
              </a>
              <a href="tel:+96170123456" className="transition-colors hover:text-[#6155F5] dark:hover:text-violet-300">
                +961 70 123 456
              </a>
            </div>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-gray-500 dark:text-neutral-400">
              Did you find what you were looking for? Share your feedback!
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="border-t border-gray-100 dark:border-neutral-800" />
      </div>

      <div className="py-8 text-center text-sm text-gray-400 dark:text-neutral-500">
        (c) 2026 Coursality
      </div>

    </footer>
  );
}
