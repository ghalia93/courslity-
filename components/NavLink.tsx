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
      className="text-black text-md transition-colors duration-200"
      style={{ color: "black" }}
      onMouseEnter={(e) => (e.currentTarget.style.color = "#6155F5")}
      onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
    >
      {children}
    </Link>
  );
}
