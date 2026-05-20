"use client";

// Renders the reusable NavLink UI component.
import Link from "next/link";

type NavLinkProps = {
  href: string;
  children: React.ReactNode;
};

export default function NavLink({ href, children }: NavLinkProps) {
  return (
    <Link
      href={href}
      className="text-md text-gray-900 transition-colors duration-200 hover:text-[#6155F5] dark:text-neutral-100 dark:hover:text-violet-300"
    >
      {children}
    </Link>
  );
}
