// Defines the public site layout with the shared navigation and footer.
import Footer from "@/components/Footer";
import NavBar from "@/components/NavBar";
import type { ReactNode } from "react";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col p-0 m-0">
      <NavBar />
      <main className="flex-grow w-full">{children}</main>
      <Footer />
    </div>
  );
}
