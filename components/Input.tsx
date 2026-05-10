"use client";

// Renders the reusable Input UI component.
import React from "react";

type InputProps = {
  label: string;
  type?: string;
  value?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function Input({
  label,
  className = "",
  ...props
}: InputProps) {
  return (
    <div className="space-y-2">
      <label className="block text-2xl font-semibold text-[#1E1E1E]">
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-full border border-gray-200 bg-white/60 px-6 py-4 text-lg text-gray-800 placeholder:text-gray-400 shadow-inner outline-none focus:bg-white focus:ring-2 focus:ring-indigo-400 ${className}`}
      />
    </div>
  );
}
