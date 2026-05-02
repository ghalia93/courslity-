import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/toast/Toastprovider";

export const metadata: Metadata = {
  title: "Coursality",
  description: "University course reviews and insights",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col p-0 m-0"
      >
        <AuthProvider>
          <ToastProvider>
            <main className="flex-grow w-full">{children}</main>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
