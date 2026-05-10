"use client";

// Renders the admin ConfirmModal interface component.
import React from "react";

type ConfirmModalProps = {
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

export default function ConfirmModal({
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white shadow-xl">
        <div className="p-5">
          <h2 className="text-base font-semibold text-gray-900">
            {title}
          </h2>
          <div className="mt-2 text-sm text-gray-500">
            {description}
          </div>
        </div>

        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-100">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            {cancelText}
          </button>

          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-sm rounded-md text-white transition ${
              variant === "danger"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-[#6155F5] hover:bg-[#4f45d4]"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}