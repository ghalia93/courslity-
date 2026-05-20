"use client";

// Renders the reusable NavBar UI component.
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import NavLink from "./NavLink";
import Button from "./Button";
import { User, LogOut, ChevronDown, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

export default function NavBar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement | null>(null);

  const { user, loading, logout } = useAuth();

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!accountRef.current) return;
      if (!accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function handleLogout() {
    setAccountOpen(false);
    setMenuOpen(false);
    logout();
  }

  const displayName = user?.email.split("@")[0] ?? "";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white px-4 py-3 transition-colors dark:border-neutral-800 dark:bg-neutral-950 sm:px-6">
      <div className="flex w-full min-w-0 items-center gap-3 sm:gap-4">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-lg text-gray-600 transition-colors dark:text-neutral-300 lg:hidden"
          aria-label="Menu"
          type="button"
        >
          Menu
        </button>

        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          <span className="hidden text-2xl font-bold text-[#6155F5] dark:text-violet-300 sm:inline">
            Coursality
          </span>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="hidden lg:flex gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/university">University</NavLink>
            <NavLink href="/roadmaps">Roadmaps</NavLink>
            <NavLink href="/faqs">FAQs</NavLink>
            <NavLink href="/about">About</NavLink>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative" ref={accountRef}>
            {loading ? null : !user ? (
              <div className="hidden lg:flex gap-2">
                <Link href="/login">
                  <Button variant="elevated">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="primary">Sign Up</Button>
                </Link>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex max-w-[46vw] items-center gap-2 rounded-full bg-gray-100 py-1 pl-1 pr-2 transition hover:bg-gray-200 dark:bg-neutral-900 dark:hover:bg-neutral-800 sm:max-w-none sm:pr-3"
                  aria-label="Account menu"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#6155F5] text-white text-xs font-semibold uppercase">
                    {displayName.charAt(0)}
                  </span>
                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-gray-700 dark:text-neutral-200 sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform dark:text-neutral-400 ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 z-50 mt-2 flex w-48 max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-lg border border-gray-200 bg-white py-1 shadow-lg transition-colors dark:border-neutral-800 dark:bg-neutral-900">
                    <div className="border-b border-gray-100 px-4 py-2 dark:border-neutral-800">
                      <p className="truncate text-xs text-gray-400 dark:text-neutral-500">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#6155F5] dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-violet-300"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User size={14} />
                      View Account
                    </Link>

                    {isAdminRole(user.role) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#6155F5] dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-violet-300"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={14} />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account#report"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 transition-colors hover:bg-gray-50 hover:text-[#6155F5] dark:text-neutral-200 dark:hover:bg-neutral-800 dark:hover:text-violet-300"
                      onClick={() => setAccountOpen(false)}
                    >
                      Report a Problem
                    </Link>

                    <div className="mt-1 border-t border-gray-100 dark:border-neutral-800" />

                    <button
                      className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-500 transition-colors hover:bg-red-50 dark:text-red-300 dark:hover:bg-red-950/40"
                      onClick={handleLogout}
                    >
                      <LogOut size={14} />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className="mt-4 flex flex-col gap-3 lg:hidden">
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/">Home</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/courses">Courses</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/university">University</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/roadmaps">Roadmaps</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/faqs">FAQs</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/about">About</NavLink>
          </div>

          {!loading && !user && (
            <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link href="/login" onClick={() => setMenuOpen(false)}>
                <Button variant="elevated" className="w-full flex-1">
                  Login
                </Button>
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)}>
                <Button variant="primary" className="w-full flex-1">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
