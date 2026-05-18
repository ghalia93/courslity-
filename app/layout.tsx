// Defines the root application layout, metadata, and global providers.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/components/toast/Toastprovider";
import NotificationToasts from "@/components/NotificationToasts";
import SupportChatWidget from "@/components/SupportChatWidget";

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
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col p-0 m-0"
      >
        <AuthProvider>
          <ToastProvider>
            <NotificationToasts />
            <main className="flex-grow w-full">{children}</main>
            <SupportChatWidget />
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
