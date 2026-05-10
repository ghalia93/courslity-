"use client";

// Provides toast notification UI for client-side feedback.
import React, { createContext, useContext, useState } from "react";

type ToastType = "success" | "error";

type Toast = {
  id: string;
  message: string;
  type: ToastType;
};

type ToastContextValue = {
  toast: (message: string, type: ToastType) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function uid() {
  return Math.random().toString(16).slice(2);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  function removeToast(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  function toast(message: string, type: ToastType) {
    const id = uid();
    setToasts((prev) => [...prev, { id, message, type }]);

    // auto-dismiss after 3s
    window.setTimeout(() => removeToast(id), 3000);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed right-4 top-4 z-[9999] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={[
              "rounded-2xl border bg-white p-4 shadow-lg",
              t.type === "success" ? "border-green-200" : "border-red-200",
            ].join(" ")}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm text-gray-800">{t.message}</p>

              <button
                onClick={() => removeToast(t.id)}
                className="text-gray-400 hover:text-gray-900"
                type="button"
                aria-label="Dismiss"
              >
                x
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
