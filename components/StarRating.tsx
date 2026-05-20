"use client";

// Renders the reusable StarRating UI component.
import { useState } from "react";

type StarRatingProps = {
  value: number; 
  onChange?: (value: number) => void;
  readOnly?: boolean; 
  className?: string;
};

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  className = "",
}: StarRatingProps) {
  const [hovered, setHovered] = useState<number | null>(null);
  const safeValue = Math.max(0, Math.min(5, value));
  const displayValue = readOnly ? safeValue : hovered ?? safeValue;

  return (
    <div className={`flex items-center gap-1 select-none ${className}`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const star = i + 1;
        const filled = star <= displayValue;

        return (
          <button
            key={star}
            type="button"
            disabled={readOnly}
            onClick={() => {
              if (readOnly) return;
              onChange?.(star);
            }}
            onMouseEnter={() => {
              if (!readOnly) setHovered(star);
            }}
            onMouseLeave={() => {
              if (!readOnly) setHovered(null);
            }}
            className={readOnly ? "cursor-default" : "cursor-pointer"}
            aria-label={`${star} star`}
          >
            <span
              className={[
                "leading-none",
                "text-lg sm:text-xl md:text-2xl",
                filled ? "text-[#F5B301]" : "text-gray-300 dark:text-neutral-700",
              ].join(" ")}
            >
              {"\u2605"}
            </span>
          </button>
        );
      })}

      <span className="ml-2 text-sm font-semibold text-gray-900 dark:text-neutral-100 sm:text-base">
        {safeValue}
      </span>
    </div>
  );
}
