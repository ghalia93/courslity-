import { useState, useRef, useEffect } from "react";

type Props = {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchableDropdownField({
  value,
  options,
  onChange,
  placeholder,
}: Props) {
  const [showDropdown, setShowDropdown] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const normalizedValue = value.trim().toLowerCase();
  const hasExactMatch = options.some(
    (opt) => opt.toLowerCase() === normalizedValue,
  );
  const filteredOptions =
    showDropdown && hasExactMatch
      ? options
      : options.filter((opt) => opt.toLowerCase().includes(normalizedValue));

  const optionHeight = 36;
  const maxDropdownHeight = optionHeight * 5;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm
            focus:outline-none focus:ring-2 focus:ring-[#6155F5] focus:border-transparent transition pr-10"
        />

        <div
          className={`absolute right-3 top-1/2 -translate-y-1/2 
            cursor-default pointer-events-none transition-transform duration-200
            ${showDropdown ? "rotate-180" : ""}`}
        >
          <svg
            className="w-4 h-4 text-gray-400"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {showDropdown && filteredOptions.length > 0 && (
        <ul
          className="absolute top-full left-0 z-50 w-full bg-white border border-gray-200 
            rounded-xl shadow-lg overflow-auto py-1"
          style={{ maxHeight: maxDropdownHeight }}
        >
          {filteredOptions.map((opt) => (
            <li
              key={opt}
              onMouseDown={() => {
                onChange(opt);
                setShowDropdown(false);
              }}
              className={`px-3 py-2 text-sm cursor-pointer rounded-lg mx-1 transition
                ${
                  value === opt
                    ? "bg-[#6155F5]/10 text-[#6155F5] font-medium"
                    : "text-gray-700 hover:bg-[#6155F5]/10 hover:text-[#6155F5]"
                }`}
              style={{ height: optionHeight }}
            >
              {opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
