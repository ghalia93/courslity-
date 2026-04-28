"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

import {
  Globe,
  Building2,
  BookOpen,
  LayoutDashboard,
  Star,
  Users,
  MessageSquare,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
  LogOut,
} from "lucide-react";

function isActive(pathname: string, href: string) {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

const SIDEBAR_STORAGE_KEY = "admin-sidebar";
const SIDEBAR_STORAGE_EVENT = "admin-sidebar-change";

function getSidebarSnapshot() {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "collapsed";
}

function subscribeToSidebarPreference(onStoreChange: () => void) {
  window.addEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener(SIDEBAR_STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function setSidebarPreference(collapsed: boolean) {
  localStorage.setItem(
    SIDEBAR_STORAGE_KEY,
    collapsed ? "collapsed" : "expanded",
  );
  window.dispatchEvent(new Event(SIDEBAR_STORAGE_EVENT));
}

export default function AdminNavbar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const collapsed = useSyncExternalStore(
    subscribeToSidebarPreference,
    getSidebarSnapshot,
    () => false,
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      collapsed ? "72px" : "220px",
    );
  }, [collapsed]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setMobileOpen(false);
      setUserMenuOpen(false);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target as Node))
        setUserMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const displayName = user?.email?.split("@")[0] ?? "Admin";
  const avatarLetter = displayName.charAt(0).toUpperCase();
  const canManageAcademicData =
    user?.role === "admin" || user?.role === "super_admin";

  const itemBase = `flex items-center gap-3 px-3 py-2 text-sm transition rounded-lg ${
    collapsed ? "justify-center" : ""
  }`;
  const mobileItem = `flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition w-full`;
  const activePill = "bg-[#C9C6FF] text-[#5B5BFF] font-medium";
  const inactivePill = "text-gray-600 hover:bg-gray-50";

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-16 w-full bg-white border-b border-gray-200">
        <div className="flex h-full items-center px-4 md:px-8 gap-3">
          <button
            type="button"
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            ☰
          </button>

          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Image src="/favicon.ico" alt="Logo" width={32} height={32} />
            <span className="hidden lg:inline text-[#6155F5] text-2xl font-bold">
              Coursality
            </span>
          </Link>

          <div className="ml-auto relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-50"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#6155F5] text-sm font-semibold text-white uppercase">
                {avatarLetter}
              </div>

              <div className="hidden md:block text-left leading-tight">
                <div className="text-sm font-semibold capitalize">
                  {displayName}
                </div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>

              <ChevronDown
                size={18}
                className={`text-gray-500 transition-transform ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden z-50">
                <div className="md:hidden px-4 py-2 border-b border-gray-100">
                  <p className="text-xs text-gray-400 truncate">
                    {user?.email}
                  </p>
                </div>

                <div className="border-t border-gray-100" />

                <button
                  className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  onClick={() => {
                    setUserMenuOpen(false);
                    logout();
                  }}
                >
                  <LogOut size={14} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <aside
        className={`hidden md:block fixed left-0 top-16 h-[calc(100vh-64px)] bg-white border-r border-gray-200
        ${collapsed ? "w-[72px]" : "w-[220px]"} transition-all duration-300`}
      >
        <div className={`${collapsed ? "p-3" : "p-6"} space-y-2`}>
          <div
            className={`flex ${collapsed ? "justify-center" : "justify-between"} mb-4`}
          >
            {!collapsed && (
              <span className="text-xs font-semibold text-gray-500 mt-2">
                NAVIGATION
              </span>
            )}
            <button
              onClick={() => setSidebarPreference(!collapsed)}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              {collapsed ? (
                <PanelLeftOpen size={18} />
              ) : (
                <PanelLeftClose size={18} />
              )}
            </button>
          </div>

          <Link
            href="/admin"
            className={`${itemBase} ${
              isActive(pathname, "/admin") ? activePill : inactivePill
            }`}
          >
            <LayoutDashboard size={18} />
            {!collapsed && "Dashboard"}
          </Link>

          {!collapsed && (
            <div className="pt-3 text-xs text-gray-500">Manage</div>
          )}

          {canManageAcademicData && (
            <>
              <Link
                href="/admin/universities"
                className={`${itemBase} ${
                  isActive(pathname, "/admin/universities")
                    ? activePill
                    : inactivePill
                }`}
              >
                <Building2 size={18} />
                {!collapsed && "Universities"}
              </Link>

              <Link
                href="/admin/courses"
                className={`${itemBase} ${
                  isActive(pathname, "/admin/courses")
                    ? activePill
                    : inactivePill
                }`}
              >
                <BookOpen size={18} />
                {!collapsed && "Courses"}
              </Link>
            </>
          )}

          <Link
            href="/admin/users"
            className={`${itemBase} ${
              isActive(pathname, "/admin/users") ? activePill : inactivePill
            }`}
          >
            <Users size={18} />
            {!collapsed && "Users"}
          </Link>

          <Link
            href="/admin/reviews"
            className={`${itemBase} ${
              isActive(pathname, "/admin/reviews") ? activePill : inactivePill
            }`}
          >
            <Star size={18} />
            {!collapsed && "Reviews"}
          </Link>

          <Link
            href="/admin/feedback"
            className={`${itemBase} ${
              isActive(pathname, "/admin/feedback") ? activePill : inactivePill
            }`}
          >
            <MessageSquare size={18} />
            {!collapsed && "Feedback"}
          </Link>

          <div className="pt-4 border-t border-gray-100 mt-2">
            <Link
              href="/"
              className={`${itemBase} text-gray-500 hover:bg-gray-50 hover:text-[#6155F5]`}
            >
              <Globe size={18} />
              {!collapsed && "Back to Website"}
            </Link>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-[60]">
          <button
            className="absolute inset-0 bg-black/40"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />

          <div className="absolute left-0 top-0 h-full w-[220px] bg-white border-r border-gray-200">
            <div className="h-16 border-b border-gray-200 flex items-center px-4 gap-3">
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                ✕
              </button>
              <div className="flex items-center gap-2">
                <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
                <span className="text-xl font-bold text-[#6155F5]">
                  Coursality
                </span>
              </div>
            </div>

            <div className="p-4 space-y-2">
              <Link
                href="/admin"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin") ? activePill : inactivePill
                }`}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                Dashboard
              </Link>

              <div className="pt-3 text-xs text-gray-500">Manage</div>

              {canManageAcademicData && (
                <>
                  <Link
                    href="/admin/universities"
                    className={`${mobileItem} ${
                      isActive(pathname, "/admin/universities")
                        ? activePill
                        : inactivePill
                    }`}
                  >
                    <Building2 size={18} className="shrink-0" />
                    Universities
                  </Link>

                  <Link
                    href="/admin/courses"
                    className={`${mobileItem} ${
                      isActive(pathname, "/admin/courses")
                        ? activePill
                        : inactivePill
                    }`}
                  >
                    <BookOpen size={18} className="shrink-0" />
                    Courses
                  </Link>
                </>
              )}

              <Link
                href="/admin/users"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin/users") ? activePill : inactivePill
                }`}
              >
                <Users size={18} className="shrink-0" />
                Users
              </Link>

              <Link
                href="/admin/reviews"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin/reviews")
                    ? activePill
                    : inactivePill
                }`}
              >
                <Star size={18} className="shrink-0" />
                Reviews
              </Link>

              <Link
                href="/admin/feedback"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin/feedback")
                    ? activePill
                    : inactivePill
                }`}
              >
                <MessageSquare size={18} className="shrink-0" />
                Feedback
              </Link>

              <div className="border-t border-gray-100 pt-3 mt-3">
                <Link
                  href="/"
                  className={`${mobileItem} text-gray-500 hover:bg-gray-50 hover:text-[#6155F5]`}
                >
                  <Globe size={18} className="shrink-0" />
                  Back to Website
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
