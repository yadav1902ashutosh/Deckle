import React, { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ListFilter,
  Search,
  ArrowDown,
  ArrowUp,
  Rocket,
  Check,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export const SAMPLE_CHAPTERS = [
  {
    number: 1,
    title: "Blood Oath in the Vale",
    words: "2,840 words",
    date: "Aug 14",
    status: "read",
  },
  {
    number: 2,
    title: "The Red Bridal Veil",
    words: "3,120 words",
    date: "Aug 14",
    status: "current",
    resumeNote: "Resuming at 14%",
  },
  {
    number: 3,
    title: "Grandfather’s Secret Coffer",
    words: "2,910 words",
    date: "Aug 14",
    status: "unread",
  },
  {
    number: 4,
    title: "Cinnabar Ink and Spectral Sight",
    words: "3,450 words",
    date: "Aug 15",
    status: "unread",
  },
  {
    number: 5,
    title: "The Night Walkers of Mount Yin",
    words: "2,780 words",
    date: "Aug 15",
    status: "unread",
  },
  {
    number: 6,
    title: "Seven Stars Yin Formation",
    words: "3,020 words",
    date: "Aug 16",
    status: "unread",
  },
  {
    number: 7,
    title: "The Soul-Calling Bell",
    words: "2,670 words",
    date: "Aug 16",
    status: "unread",
  },
  {
    number: 8,
    title: "Whispers from the Ancient Well",
    words: "3,110 words",
    date: "Aug 17",
    status: "unread",
  },
  {
    number: 9,
    title: "First Heavenly Lightning Shard",
    words: "2,890 words",
    date: "Aug 17",
    status: "unread",
  },
  {
    number: 10,
    title: "Blood Talisman Inscription",
    words: "3,340 words",
    date: "Aug 18",
    status: "unread",
  },
  {
    number: 11,
    title: "The Village Chief's Confession",
    words: "2,760 words",
    date: "Aug 18",
    status: "unread",
  },
  {
    number: 12,
    title: "Awakening the Nether Meridian",
    words: "3,200 words",
    date: "Aug 19",
    status: "unread",
  },
];

export const VOLUMES = [
  { id: "vol-1", name: "Vol. 1: Village of Ghosts (1-288)" },
  { id: "vol-2", name: "Vol. 2: Underworld Order (289-850)" },
  { id: "vol-3", name: "Vol. 3: Nine Heavens (851-1820)" },
];

export default function ChapterDirectory({
  bookSlug = "heavenly-tribulation",
  totalChapters = 9568,
}) {
  const [activeVolume, setActiveVolume] = useState("vol-1");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [currentPage, setCurrentPage] = useState(1);
  const [jumpInput, setJumpInput] = useState("");
  const [showJumpModal, setShowJumpModal] = useState(false);

  // Filtered & Sorted Chapters
  const filteredChapters = useMemo(() => {
    let result = [...SAMPLE_CHAPTERS];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (ch) =>
          ch.title.toLowerCase().includes(q) ||
          ch.number.toString().includes(q)
      );
    }

    if (sortOrder === "desc") {
      result.reverse();
    }

    return result;
  }, [searchQuery, sortOrder]);

  const handleJumpSubmit = (e) => {
    e.preventDefault();
    const chNum = parseInt(jumpInput, 10);
    if (!isNaN(chNum) && chNum >= 1 && chNum <= totalChapters) {
      // Navigate or close modal
      setShowJumpModal(false);
      setJumpInput("");
    }
  };

  return (
    <section className="w-full bg-card rounded-2xl p-5 sm:p-7 border border-border-subtle shadow-sm transition-colors duration-200">
      {/* 1. Directory Header & Volume Tabs */}
      <div className="flex flex-col gap-4 pb-4 border-b border-border-subtle">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-tag text-accent">
              <ListFilter className="w-5 h-5" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-text-main">
              Chapter Directory
            </h2>
            <span className="bg-tag px-2.5 py-0.5 rounded-full text-xs font-semibold text-text-muted border border-border-subtle">
              {totalChapters.toLocaleString()} Total
            </span>
          </div>

          {/* Volume Navigation Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 no-scrollbar">
            {VOLUMES.map((vol) => {
              const isActive = activeVolume === vol.id;
              return (
                <button
                  key={vol.id}
                  type="button"
                  onClick={() => setActiveVolume(vol.id)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-colors cursor-pointer border ${
                    isActive
                      ? "bg-accent text-accent-text border-accent shadow-xs"
                      : "bg-tag hover:bg-page text-text-muted hover:text-text-main border-border-subtle"
                  }`}
                >
                  {vol.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Filter, Search & Sort Sub-Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
          {/* Chapter Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters by title or #..."
              className="w-full h-9 pl-9 pr-3 bg-page rounded-lg text-xs text-text-main placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Sort & Quick Select Controls */}
          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center bg-page rounded-lg p-1 border border-border-subtle">
              <button
                type="button"
                onClick={() => setSortOrder("asc")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  sortOrder === "asc"
                    ? "bg-accent text-accent-text shadow-2xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>1 → {totalChapters}</span>
              </button>
              <button
                type="button"
                onClick={() => setSortOrder("desc")}
                className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                  sortOrder === "desc"
                    ? "bg-accent text-accent-text shadow-2xs"
                    : "text-text-muted hover:text-text-main"
                }`}
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>{totalChapters} → 1</span>
              </button>
            </div>

            {/* Jump to Chapter Quick Select */}
            <button
              type="button"
              onClick={() => setShowJumpModal(true)}
              className="h-9 px-3 bg-page hover:bg-tag rounded-lg text-text-main text-xs font-semibold flex items-center gap-1.5 transition-colors border border-border-subtle cursor-pointer shadow-2xs"
            >
              <Rocket className="w-3.5 h-3.5 text-accent" />
              <span>Jump to #</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. Chapter Directory Grid (Expansive multi-column responsive layout) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 gap-3 py-5">
        {filteredChapters.map((chapter) => {
          const isRead = chapter.status === "read";
          const isCurrent = chapter.status === "current";

          return (
            <Link
              key={chapter.number}
              to={`/book/${bookSlug}/chapter/${chapter.number}`}
              className={`group p-3 rounded-xl flex items-center justify-between transition-all duration-150 border cursor-pointer ${
                isCurrent
                  ? "bg-tag border-accent shadow-xs relative overflow-hidden ring-1 ring-accent/30"
                  : isRead
                  ? "bg-page/60 hover:bg-page border-border-subtle/60 text-text-muted"
                  : "bg-page hover:bg-tag border-border-subtle shadow-2xs"
              }`}
            >
              {isCurrent && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-accent" />
              )}

              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {/* Status Indicator Icon */}
                {isCurrent ? (
                  <span className="w-6 h-6 rounded-full bg-accent text-accent-text flex items-center justify-center shrink-0 animate-pulse">
                    <Bookmark className="w-3.5 h-3.5" />
                  </span>
                ) : isRead ? (
                  <span className="w-6 h-6 rounded-full bg-tag text-text-muted flex items-center justify-center shrink-0">
                    <Check className="w-3.5 h-3.5" />
                  </span>
                ) : (
                  <span className="w-6 h-6 rounded-full bg-card border border-border-subtle text-text-muted flex items-center justify-center shrink-0 text-[11px] font-bold">
                    {chapter.number}
                  </span>
                )}

                {/* Chapter Title & Word Info */}
                <div className="truncate">
                  <p
                    className={`text-xs font-semibold truncate group-hover:text-accent transition-colors ${
                      isCurrent
                        ? "text-accent font-bold"
                        : isRead
                        ? "text-text-muted"
                        : "text-text-main"
                    }`}
                  >
                    Ch. {chapter.number}: {chapter.title}
                  </p>
                  <span
                    className={`text-[10px] ${
                      isCurrent
                        ? "text-accent font-medium"
                        : "text-text-muted"
                    }`}
                  >
                    {chapter.words} • {isCurrent ? chapter.resumeNote : isRead ? "Read" : "Free"}
                  </span>
                </div>
              </div>

              {/* Right: Date or Current Badge */}
              {isCurrent ? (
                <span className="bg-accent text-accent-text text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-2xs">
                  Current
                </span>
              ) : (
                <span className="text-[11px] text-text-muted shrink-0">
                  {chapter.date}
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* 4. Directory Pagination / Range Indicator */}
      <div className="pt-4 border-t border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-text-muted">
        <span>
          Showing chapters{" "}
          <strong className="text-text-main">1 - 12</strong> of{" "}
          <strong className="text-text-main">
            {totalChapters.toLocaleString()}
          </strong>
        </span>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main disabled:opacity-40 border border-border-subtle transition-colors cursor-pointer"
            aria-label="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main disabled:opacity-40 border border-border-subtle transition-colors cursor-pointer"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-accent text-accent-text font-bold text-xs shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main border border-border-subtle transition-colors cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main border border-border-subtle transition-colors cursor-pointer"
          >
            3
          </button>
          <span className="px-1 text-text-muted">...</span>
          <button
            type="button"
            onClick={() => setCurrentPage(798)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main border border-border-subtle transition-colors cursor-pointer"
          >
            798
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => p + 1)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main border border-border-subtle transition-colors cursor-pointer"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(798)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-page hover:bg-tag text-text-main border border-border-subtle transition-colors cursor-pointer"
            aria-label="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jump To Chapter Modal */}
      {showJumpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card rounded-2xl p-6 w-full max-w-sm border border-border-subtle shadow-xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-text-main">
              Jump to Chapter
            </h3>
            <p className="text-xs text-text-muted">
              Enter a chapter number between 1 and {totalChapters.toLocaleString()}:
            </p>
            <form onSubmit={handleJumpSubmit} className="space-y-3">
              <input
                type="number"
                min="1"
                max={totalChapters}
                value={jumpInput}
                onChange={(e) => setJumpInput(e.target.value)}
                placeholder="e.g. 450"
                className="w-full h-10 px-3 rounded-lg bg-page border border-border-subtle text-text-main text-sm focus:outline-none focus:border-accent"
                autoFocus
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowJumpModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-text-muted hover:bg-tag"
                >
                  Cancel
                </button>
                <Link
                  to={`/book/${bookSlug}/chapter/${jumpInput || 1}`}
                  onClick={() => setShowJumpModal(false)}
                  className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-accent text-accent-text hover:bg-accent-hover"
                >
                  Go to Chapter
                </Link>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
