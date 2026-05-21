"use client";

// Renders the admin AdminNavbar interface component.
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { isAdminRole } from "@/lib/roles";

import {
  Globe,
  Building2,
  BookOpen,
  Map,
  LayoutDashboard,
  Star,
  Users,
  MessageSquare,
  Settings,
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
const ADMIN_CHAT_EVENT = "admin-chat-updated";

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
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [chatNotice, setChatNotice] = useState("");

  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const latestUnreadMessageRef = useRef<number | null>(null);
  const chatSummaryLoadedRef = useRef(false);
  const chatNoticeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--admin-sidebar-width",
      collapsed ? "64px" : "200px",
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
  const canManageAcademicData = isAdminRole(user?.role);
  const canLoadChatSummary = isAdminRole(user?.role);

  const loadChatSummary = useCallback(async () => {
    if (!canLoadChatSummary) {
      setUnreadChatCount(0);
      latestUnreadMessageRef.current = null;
      chatSummaryLoadedRef.current = false;
      return;
    }

    try {
      const res = await fetch("/api/admin/support-chat?summary=1", {
        cache: "no-store",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data?.success) return;

      const unreadCount = Number(data.unreadCount || 0);
      const latestUnreadMessageId =
        data.latestUnreadMessageId === null ||
        data.latestUnreadMessageId === undefined
          ? null
          : Number(data.latestUnreadMessageId);
      const previousLatestUnreadMessageId = latestUnreadMessageRef.current;

      setUnreadChatCount(unreadCount);

      if (
        chatSummaryLoadedRef.current &&
        unreadCount > 0 &&
        latestUnreadMessageId !== null &&
        latestUnreadMessageId !== previousLatestUnreadMessageId
      ) {
        const name = String(data.latestUnreadName || "A conversation");
        setChatNotice(`${name} is waiting for your answer.`);

        if (chatNoticeTimeoutRef.current) {
          window.clearTimeout(chatNoticeTimeoutRef.current);
        }
        chatNoticeTimeoutRef.current = window.setTimeout(() => {
          setChatNotice("");
          chatNoticeTimeoutRef.current = null;
        }, 2000);
      }

      latestUnreadMessageRef.current = latestUnreadMessageId;
      chatSummaryLoadedRef.current = true;
    } catch {
      setUnreadChatCount(0);
    }
  }, [canLoadChatSummary]);

  useEffect(() => {
    const initialTimeoutId = window.setTimeout(loadChatSummary, 0);

    if (!canLoadChatSummary) {
      return () => window.clearTimeout(initialTimeoutId);
    }

    const intervalId = window.setInterval(loadChatSummary, 10000);
    window.addEventListener("focus", loadChatSummary);
    window.addEventListener(ADMIN_CHAT_EVENT, loadChatSummary);

    return () => {
      window.clearTimeout(initialTimeoutId);
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadChatSummary);
      window.removeEventListener(ADMIN_CHAT_EVENT, loadChatSummary);
    };
  }, [canLoadChatSummary, loadChatSummary]);

  useEffect(() => {
    return () => {
      if (chatNoticeTimeoutRef.current) {
        window.clearTimeout(chatNoticeTimeoutRef.current);
      }
    };
  }, []);

  const itemBase = `relative flex items-center gap-2.5 px-2.5 py-1.5 text-sm transition rounded-lg ${
    collapsed ? "justify-center" : ""
  }`;
  const mobileItem = `relative flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-lg transition w-full`;
  const activePill = "bg-[#C9C6FF] text-[#5B5BFF] font-medium";
  const inactivePill = "text-gray-600 hover:bg-gray-50";
  const unreadChatLabel =
    unreadChatCount > 99 ? "99+" : String(unreadChatCount);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 h-14 w-full bg-white border-b border-gray-200">
        <div className="flex h-full items-center px-3 gap-3 md:px-5">
          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
            onClick={() => setMobileOpen(true)}
          >
            Menu
          </button>

          <Link href="/admin" className="flex items-center gap-2 shrink-0">
            <Image src="/favicon.ico" alt="Logo" width={28} height={28} />
            <span className="hidden lg:inline text-[#6155F5] text-xl font-bold">
              Coursality
            </span>
          </Link>

          <div className="ml-auto relative" ref={userMenuRef}>
            <button
              className="flex items-center gap-3 rounded-lg px-2 py-1 hover:bg-gray-50"
              onClick={() => setUserMenuOpen((v) => !v)}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6155F5] text-sm font-semibold text-white uppercase">
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
      {chatNotice && (
        <div className="fixed right-4 top-16 z-[70] max-w-sm rounded-xl border border-[#C9C4FF] bg-white px-4 py-3 text-sm text-gray-800 shadow-xl">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#6155F5]">
              <MessageSquare size={16} />
            </span>
            <div>
              <p className="font-semibold text-gray-900">
                Conversation waiting
              </p>
              <p className="mt-0.5 text-gray-600">{chatNotice}</p>
            </div>
          </div>
        </div>
      )}
      <aside
        className={`hidden md:block fixed left-0 top-14 h-[calc(100vh-56px)] overflow-y-auto bg-white border-r border-gray-200
        ${collapsed ? "w-[64px]" : "w-[200px]"} transition-all duration-300`}
      >
        <div className={`${collapsed ? "p-2" : "p-3"} space-y-1`}>
          <div
            className={`flex ${collapsed ? "justify-center" : "justify-between"} mb-2`}
          >
            {!collapsed && (
              <span className="text-[11px] font-semibold text-gray-500 mt-2">
                NAVIGATION
              </span>
            )}
            <button
              onClick={() => setSidebarPreference(!collapsed)}
              className="p-1.5 rounded-lg hover:bg-gray-100"
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
            <div className="pt-2 text-xs text-gray-500">Manage</div>
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

              <Link
                href="/admin/roadmaps"
                className={`${itemBase} ${
                  isActive(pathname, "/admin/roadmaps")
                    ? activePill
                    : inactivePill
                }`}
              >
                <Map size={18} />
                {!collapsed && "Roadmaps"}
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
            href="/admin/chat"
            className={`${itemBase} ${
              isActive(pathname, "/admin/chat") ? activePill : inactivePill
            }`}
          >
            <span className="relative inline-flex shrink-0">
              <MessageSquare size={18} />
              {collapsed && unreadChatCount > 0 && (
                <span className="absolute -right-2 -top-2 inline-flex min-w-[18px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-semibold leading-[18px] text-white">
                  {unreadChatLabel}
                </span>
              )}
            </span>
            {!collapsed && <span className="min-w-0 flex-1">Chat</span>}
            {!collapsed && unreadChatCount > 0 && (
              <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-5 text-white">
                {unreadChatLabel}
              </span>
            )}
          </Link>

          <Link
            href="/admin/feedback"
            className={`${itemBase} ${
              isActive(pathname, "/admin/feedback") ? activePill : inactivePill
            }`}
          >
            <MessageSquare size={18} />
            {!collapsed && "Feedback & Problems"}
          </Link>

          <Link
            href="/admin/settings"
            className={`${itemBase} ${
              isActive(pathname, "/admin/settings") ? activePill : inactivePill
            }`}
          >
            <Settings size={18} />
            {!collapsed && "Settings"}
          </Link>

          <div className="pt-2 border-t border-gray-100 mt-1">
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

          <div className="absolute left-0 top-0 h-full w-[min(210px,85vw)] overflow-y-auto bg-white border-r border-gray-200">
            <div className="h-14 border-b border-gray-200 flex items-center px-3 gap-3">
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-gray-100"
                aria-label="Close menu"
                onClick={() => setMobileOpen(false)}
              >
                x
              </button>
              <div className="flex items-center gap-2">
                <Image src="/favicon.ico" alt="Logo" width={26} height={26} />
                <span className="text-lg font-bold text-[#6155F5]">
                  Coursality
                </span>
              </div>
            </div>

            <div className="p-3 space-y-1">
              <Link
                href="/admin"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin") ? activePill : inactivePill
                }`}
              >
                <LayoutDashboard size={18} className="shrink-0" />
                Dashboard
              </Link>

              <div className="pt-2 text-xs text-gray-500">Manage</div>

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

                  <Link
                    href="/admin/roadmaps"
                    className={`${mobileItem} ${
                      isActive(pathname, "/admin/roadmaps")
                        ? activePill
                        : inactivePill
                    }`}
                  >
                    <Map size={18} className="shrink-0" />
                    Roadmaps
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
                href="/admin/chat"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin/chat") ? activePill : inactivePill
                }`}
              >
                <MessageSquare size={18} className="shrink-0" />
                <span className="min-w-0 flex-1">Chat</span>
                {unreadChatCount > 0 && (
                  <span className="ml-auto inline-flex min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-semibold leading-5 text-white">
                    {unreadChatLabel}
                  </span>
                )}
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
                Feedback & Problems
              </Link>

              <Link
                href="/admin/settings"
                className={`${mobileItem} ${
                  isActive(pathname, "/admin/settings")
                    ? activePill
                    : inactivePill
                }`}
              >
                <Settings size={18} className="shrink-0" />
                Settings
              </Link>

              <div className="border-t border-gray-100 pt-2 mt-2">
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
