import React from "react";
import { Search, SlidersHorizontal, LayoutGrid, List } from "lucide-react";

export const GENRE_PILLS = [
  "All Genres",
  "Fantasy / Xuanhuan",
  "Xianxia / Cultivation",
  "Urban / Modern",
  "Sci-Fi / System",
  "Invincible Flow",
  "Transmigration",
  "Romance & Danmei",
];

export const STATUS_FILTERS = ["All", "Ongoing", "Completed", "Ranked Today"];

export default function RankingsFilters({
  searchQuery = "",
  onSearchChange = () => {},
  selectedGenre = "All Genres",
  onGenreSelect = () => {},
  selectedStatus = "All",
  onStatusSelect = () => {},
  isCompactMode = false,
  onToggleCompact = () => {},
}) {
  return (
    <section className="flex flex-col gap-3">
      {/* Search Bar */}
      <div className="relative w-full flex items-center">
        <Search className="w-4 h-4 absolute left-3.5 text-text-muted pointer-events-none" />
        <input
          type="search"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search 100,000+ serials, authors, tags..."
          className="w-full h-11 pl-10 pr-10 rounded-xl bg-card border border-border-subtle/50 text-text-main text-sm placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors shadow-2xs"
        />
        <button
          title="Advanced Filters"
          className="absolute right-2.5 w-8 h-8 flex items-center justify-center text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Live Genre Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {GENRE_PILLS.map((genre) => {
          const isActive = selectedGenre === genre;
          return (
            <button
              key={genre}
              onClick={() => onGenreSelect(genre)}
              className={`whitespace-nowrap px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? "bg-accent text-white shadow-2xs"
                  : "bg-tag hover:bg-card text-text-muted hover:text-text-main"
              }`}
            >
              {genre}
            </button>
          );
        })}
      </div>

      {/* Status Sub-Filters & Density Switcher */}
      <div className="flex items-center justify-between gap-2 pt-0.5">
        <div className="flex items-center gap-1 bg-tag/80 p-1 rounded-xl">
          {STATUS_FILTERS.map((status) => {
            const isActive = selectedStatus === status;
            return (
              <button
                key={status}
                onClick={() => onStatusSelect(status)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? "bg-card text-accent shadow-xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                {status}
              </button>
            );
          })}
        </div>

        {/* View density button */}
        <button
          onClick={onToggleCompact}
          title={isCompactMode ? "Switch to Detailed View" : "Switch to Compact View"}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-card hover:bg-tag border border-border-subtle/40 text-text-muted hover:text-text-main transition-colors cursor-pointer"
        >
          {isCompactMode ? <LayoutGrid className="w-4 h-4" /> : <List className="w-4 h-4" />}
        </button>
      </div>
    </section>
  );
}
