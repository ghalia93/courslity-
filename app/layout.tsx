// Defines the root application layout, metadata, and global providers.
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
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

const themeScript = `
(function () {
  try {
    var storageKey = "coursality-theme";
    var preference = localStorage.getItem(storageKey) || "light";
    if (["light", "dark", "system"].indexOf(preference) === -1) {
      preference = "light";
    }
    var resolved = preference === "system"
      ? (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light")
      : preference;
    var root = document.documentElement;
    root.classList.toggle("dark", resolved === "dark");
    root.dataset.theme = preference;
    root.style.colorScheme = resolved;
  } catch (_) {}
})();
`;

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        suppressHydrationWarning
        className="antialiased min-h-screen flex flex-col p-0 m-0"
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <NotificationToasts />
              <main className="flex-grow w-full">{children}</main>
              <SupportChatWidget />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
