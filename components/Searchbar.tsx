"use client";

import {
  Dispatch,
  SetStateAction,
  SyntheticEvent,
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Button from "@/components/Button";
import { Search } from "react-feather";
import { useRouter } from "next/navigation";

interface SearchbarProps {
  query: string;
  setQuery: Dispatch<SetStateAction<string>>;
}

type SearchSuggestion = {
  courseId: number;
  code: string;
  title: string;
  university: string;
  department: string;
};

function courseSlug(code: string) {
  return code.trim().toLowerCase().replace(/\s+/g, "-");
}

export default function SearchPage({ query, setQuery }: SearchbarProps) {
  const router = useRouter();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchId = useId();
  const suggestionListId = `${searchId}-search-suggestions`;
  const trimmedQuery = query.trim();
  const showSuggestions = isOpen && trimmedQuery.length > 0;

  useEffect(() => {
    router.prefetch("/courses");
  }, [router]);

  useEffect(() => {
    if (!trimmedQuery) {
      setSuggestions([]);
      setLoading(false);
      setError("");
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams({
          query: trimmedQuery,
          limit: "50",
        });
        const res = await fetch(`/api/search?${params.toString()}`, {
          signal: controller.signal,
        });
        const data = await res.json();

        if (!res.ok || !data?.success) {
          throw new Error(data?.message || "Search failed");
        }

        setSuggestions(data.results || []);
        setActiveIndex(-1);
      } catch (err: unknown) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSuggestions([]);
        setError("Could not load suggestions.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [trimmedQuery]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trimmedQuery) return;

    router.push(`/courses?query=${encodeURIComponent(trimmedQuery)}`);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
  };

  const openSuggestion = (suggestion: SearchSuggestion) => {
    setQuery(`${suggestion.code} ${suggestion.title}`);
    setIsOpen(false);
    setActiveIndex(-1);
    router.push(`/courses/${courseSlug(suggestion.code)}`);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0 ? -1 : (current + 1) % suggestions.length,
      );
    }

    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((current) =>
        suggestions.length === 0
          ? -1
          : current <= 0
            ? suggestions.length - 1
            : current - 1,
      );
    }

    if (e.key === "Enter" && activeIndex >= 0 && suggestions[activeIndex]) {
      e.preventDefault();
      openSuggestion(suggestions[activeIndex]);
    }

    if (e.key === "Escape") {
      setIsOpen(false);
      setActiveIndex(-1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex-1">
      <div className="flex gap-3">
        <div ref={wrapperRef} className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />

          <input
            type="text"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-controls={suggestionListId}
            aria-autocomplete="list"
            aria-activedescendant={
              activeIndex >= 0
                ? `${suggestionListId}-option-${activeIndex}`
                : undefined
            }
            placeholder="Search for a course, university, department..."
            className="w-full h-11 pl-10 pr-4 text-gray-900 placeholder-gray-400
                      rounded-md border border-gray-300 transition-colors
                      focus:outline-none focus:border-[#6155F5] 
                      focus:ring-2 focus:ring-[#6155F5]"
          />

          {showSuggestions && (
            <div
              id={suggestionListId}
              role="listbox"
              className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-30 max-h-80 overflow-y-auto rounded-md border border-gray-200 bg-white py-2 text-left shadow-xl"
            >
              {loading ? (
                <p className="px-4 py-3 text-sm text-gray-500">Searching...</p>
              ) : error ? (
                <p className="px-4 py-3 text-sm text-red-500">{error}</p>
              ) : suggestions.length === 0 ? (
                <p className="px-4 py-3 text-sm text-gray-500">
                  No matching courses found.
                </p>
              ) : (
                suggestions.map((suggestion, index) => {
                  const isActive = index === activeIndex;

                  return (
                    <button
                      id={`${suggestionListId}-option-${index}`}
                      role="option"
                      aria-selected={isActive}
                      type="button"
                      key={suggestion.courseId}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => openSuggestion(suggestion)}
                      className={`flex w-full items-start gap-3 px-4 py-3 text-left transition ${
                        isActive ? "bg-[#EEF2FF]" : "hover:bg-gray-50"
                      }`}
                    >
                      <span className="mt-0.5 shrink-0 rounded-md bg-[#EEF2FF] px-2 py-1 text-xs font-semibold text-[#6155F5]">
                        {suggestion.code}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900">
                          {suggestion.title}
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-gray-500">
                          {suggestion.university} - {suggestion.department}
                        </span>
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          )}
        </div>

        <Button className="h-11 px-6 py-0 text-sm hidden md:inline-flex">
          Search
        </Button>
      </div>
    </form>
  );
}
