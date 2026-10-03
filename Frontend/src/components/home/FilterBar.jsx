import React, { useRef } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
} from "lucide-react";

export const GENRE_PILLS = [
  { id: "all", label: "All Genres (14,892)" },
  { id: "xuanhuan", label: "Xuanhuan & Eastern Fantasy" },
  { id: "xianxia", label: "Xianxia & Cultivation" },
  { id: "urban", label: "Urban Supernatural" },
  { id: "historical", label: "Historical Military" },
  { id: "cyber-dao", label: "Sci-Fi & Cyber Dao" },
];

export const STATUS_OPTIONS = ["Any", "Ongoing", "Completed", "Fast Update"];

export const SORT_CANON_OPTIONS = [
  "Most Popular (Monthly Activity)",
  "Latest Updated Chapters",
  "Reader Editorial Rating (9.0+)",
  "Epic Scale (Words > 5,000,000)",
  "New Releases (Past 30 Days)",
];

export const SCOPE_OPTIONS = [
  "All Lengths",
  "< 1,000,000 (Novella / Short Serial)",
  "1,000,000 - 3,000,000 (Medium Epoch)",
  "3,000,000 - 7,000,000 (Standard Saga)",
  "> 7,000,000 Words (Titan Monolith)",
];

export const RELEASE_RHYTHM_OPTIONS = [
  "All Release Rhythms",
  "Daily 2+ Chapters Guaranteed",
  "Daily 1 Chapter",
  "3-5 Chapters Weekly",
  "Author Hiatus Alert Filtered",
];

export default function FilterBar({
  activeGenre = "all",
  onSelectGenre,
  activeStatus = "Any",
  onSelectStatus,
  activeSort = "Most Popular (Monthly Activity)",
  onSelectSort,
  activeScope = "All Lengths",
  onSelectScope,
  activeFrequency = "All Release Rhythms",
  onSelectFrequency,
  onResetFilters,
  totalNovels = 1420,
  displayRange = "1 - 8",
}) {
  const scrollRef = useRef(null);

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === "left" ? -180 : 180,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full bg-card rounded-xl border border-border-subtle p-5 shadow-sm space-y-4 transition-colors duration-200">
      {/* 1. Genre Navigation Pills */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center w-full lg:w-auto min-w-0">
          {/* Mobile Prev Button */}
          <button
            type="button"
            onClick={() => handleScroll("left")}
            className="lg:hidden p-1.5 rounded-lg bg-tag hover:bg-border-subtle text-text-muted hover:text-text-main border border-border-subtle mr-1.5 flex-shrink-0 cursor-pointer shadow-2xs"
            aria-label="Previous genres"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Horizontally scrollable on mobile, auto-wrapped on desktop */}
          <div
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto lg:flex-wrap pb-1 lg:pb-0 no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden flex-1 scroll-smooth"
          >
            {GENRE_PILLS.map((genre) => {
              const isActive = activeGenre === genre.id;
              return (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => onSelectGenre && onSelectGenre(genre.id)}
                  className={`px-4 py-2 rounded text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                    isActive
                      ? "bg-accent text-accent-text shadow-sm"
                      : "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
                  }`}
                >
                  {genre.label}
                </button>
              );
            })}
          </div>

          {/* Mobile Next Button */}
          <button
            type="button"
            onClick={() => handleScroll("right")}
            className="lg:hidden p-1.5 rounded-lg bg-tag hover:bg-border-subtle text-text-muted hover:text-text-main border border-border-subtle ml-1.5 flex-shrink-0 cursor-pointer shadow-2xs"
            aria-label="Next genres"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Refined Mode indicator */}
        <div className="hidden lg:flex items-center gap-1.5 text-xs text-text-muted flex-shrink-0">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Refined Mode</span>
        </div>
      </div>

      {/* 2. Secondary Refinement Controls Row (4-column grid) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
        {/* Status Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
            Serial Status
          </label>
          <div className="flex items-center bg-tag rounded p-1 gap-1 border border-border-subtle">
            {STATUS_OPTIONS.map((status) => {
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => onSelectStatus && onSelectStatus(status)}
                  className={`flex-1 py-1 px-2 text-center rounded text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-card text-text-main font-semibold shadow-xs"
                      : "text-text-muted hover:text-text-main"
                  }`}
                >
                  {status}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sort Canon By Dropdown */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
            Sort Canon By
          </label>
          <div className="relative">
            <select
              value={activeSort}
              onChange={(e) => onSelectSort && onSelectSort(e.target.value)}
              className="w-full bg-tag text-text-main text-xs rounded px-3 py-1.5 appearance-none cursor-pointer border border-border-subtle focus:outline-none focus:border-accent transition-colors pr-8"
            >
              {SORT_CANON_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-card text-text-main">
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Novel Length Selector */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
            Scope / Word Count
          </label>
          <div className="relative">
            <select
              value={activeScope}
              onChange={(e) => onSelectScope && onSelectScope(e.target.value)}
              className="w-full bg-tag text-text-main text-xs rounded px-3 py-1.5 appearance-none cursor-pointer border border-border-subtle focus:outline-none focus:border-accent transition-colors pr-8"
            >
              {SCOPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-card text-text-main">
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-text-muted absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Update Schedule Filter */}
        <div className="flex flex-col space-y-1">
          <label className="text-[11px] text-text-muted uppercase tracking-wider font-semibold">
            Release Frequency
          </label>
          <div className="relative">
            <select
              value={activeFrequency}
              onChange={(e) => onSelectFrequency && onSelectFrequency(e.target.value)}
              className="w-full bg-tag text-text-main text-xs rounded px-3 py-1.5 appearance-none cursor-pointer border border-border-subtle focus:outline-none focus:border-accent transition-colors pr-8"
            >
              {RELEASE_RHYTHM_OPTIONS.map((opt) => (
                <option key={opt} value={opt} className="bg-card text-text-main">
                  {opt}
                </option>
              ))}
            </select>
            <Clock className="w-3.5 h-3.5 text-text-muted absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 3. Quick Active Metadata Summary */}
      <div className="flex items-center justify-between pt-1 border-t border-border-subtle text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span>
            Displaying <strong>{displayRange}</strong> of{" "}
            <strong>{totalNovels.toLocaleString()}</strong> serialized literary works
          </span>
        </div>
        <button
          type="button"
          onClick={onResetFilters}
          className="hover:text-accent transition-colors flex items-center gap-1 cursor-pointer font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Filters</span>
        </button>
      </div>
    </div>
  );
}
