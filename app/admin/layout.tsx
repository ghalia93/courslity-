import type { ReactNode } from "react";
import AdminNavbar from "@/components/admin/AdminNavbar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <AdminNavbar />

      <div className="flex pt-16">
        <div className="hidden md:block w-(--admin-sidebar-width) transition-all duration-300" />

        <main className="flex-1 min-w-0 p-6 md:p-10 transition-all duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
