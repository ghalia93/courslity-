"use client";

import clsx from "clsx";
import { Monitor, Moon, Sun } from "lucide-react";
import { ThemePreference, useTheme } from "@/context/ThemeContext";

const themeOptions: {
  value: ThemePreference;
  label: string;
  icon: typeof Sun;
}[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function ThemeModeControl() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="grid grid-cols-3 gap-1 rounded-xl border border-gray-200 bg-gray-100 p-1 dark:border-neutral-700 dark:bg-neutral-950">
      {themeOptions.map(({ value, label, icon: Icon }) => {
        const selected = theme === value;

        return (
          <button
            key={value}
            type="button"
            onClick={() => setTheme(value)}
            aria-pressed={selected}
            aria-label={`${label} mode`}
            title={`${label} mode`}
            className={clsx(
              "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-2 text-sm font-medium transition-colors",
              selected
                ? "bg-white text-[#6155F5] shadow-sm dark:bg-neutral-800 dark:text-violet-300"
                : "text-gray-600 hover:bg-white/70 hover:text-gray-900 dark:text-neutral-300 dark:hover:bg-neutral-800/70 dark:hover:text-white",
            )}
          >
            <Icon size={16} aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
