"use client";

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
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center gap-4 w-full">
        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="lg:hidden text-lg text-gray-600"
          aria-label="Menu"
          type="button"
        >
          ☰
        </button>

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
          <span className="hidden md:inline text-[#6155F5] text-2xl font-bold">
            Coursality
          </span>
        </Link>

        <div className="flex-1 flex justify-center">
          <div className="hidden lg:flex gap-6">
            <NavLink href="/">Home</NavLink>
            <NavLink href="/courses">Courses</NavLink>
            <NavLink href="/roadmaps">Roadmaps</NavLink>
            <NavLink href="/about">About</NavLink>
            <NavLink href="/faqs">FAQs</NavLink>
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
                  className="flex items-center gap-2 rounded-full pl-1 pr-3 py-1 bg-gray-100 hover:bg-gray-200 transition"
                  aria-label="Account menu"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-[#6155F5] text-white text-xs font-semibold uppercase">
                    {displayName.charAt(0)}
                  </span>
                  <span className="hidden sm:inline text-sm font-medium text-gray-700 max-w-[120px] truncate">
                    {displayName}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`text-gray-500 transition-transform ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50 flex flex-col py-1 overflow-hidden">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      href="/account"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6155F5] transition-colors"
                      onClick={() => setAccountOpen(false)}
                    >
                      <User size={14} />
                      View Account
                    </Link>

                    {isAdminRole(user.role) && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#6155F5] transition-colors"
                        onClick={() => setAccountOpen(false)}
                      >
                        <LayoutDashboard size={14} />
                        Admin Dashboard
                      </Link>
                    )}

                    <Link
                      href="/account#report"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setAccountOpen(false)}
                    >
                      Report a Problem
                    </Link>

                    <div className="border-t border-gray-100 mt-1" />

                    <button
                      className="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left"
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
        <div className="lg:hidden mt-4 flex flex-col gap-3">
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/">Home</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/courses">Courses</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/roadmaps">Roadmaps</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/about">About</NavLink>
          </div>
          <div onClick={() => setMenuOpen(false)}>
            <NavLink href="/faqs">FAQs</NavLink>
          </div>

          {!loading && !user && (
            <div className="flex gap-2 mt-2">
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
