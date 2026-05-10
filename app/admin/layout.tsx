// Defines the layout shell for admin routes.
import type { ReactNode } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar />

      <div className="flex pt-16">
        <div className="hidden md:block w-(--admin-sidebar-width) transition-all duration-300" />

        <main className="min-w-0 flex-1 p-4 transition-all duration-300 sm:p-6 md:p-10">
          {children}
        </main>
      </div>
    </div>
  );
}
