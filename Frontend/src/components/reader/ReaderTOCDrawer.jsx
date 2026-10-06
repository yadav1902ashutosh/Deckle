import React, { useState, useMemo } from "react";
import { BookOpen, Search, X, Check, ArrowUpDown } from "lucide-react";

export default function ReaderTOCDrawer({
  isOpen = false,
  onClose,
  bookTitle = "Battle Through the Heavens",
  currentChapterNum = 1663,
  chapters = [],
  onSelectChapter,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAscending, setIsAscending] = useState(true);

  const filteredChapters = useMemo(() => {
    let list = chapters.map((ch, idx) => ({
      ...ch,
      number: ch.chapter_number !== undefined && ch.chapter_number !== null ? Number(ch.chapter_number) : (ch.number ?? idx + 1),
      title: ch.title || `Chapter ${ch.chapter_number || idx + 1}`,
      chapter_type: ch.chapter_type || "regular",
      chapter_label: ch.chapter_label || null,
    }));
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (ch) =>
          ch.title.toLowerCase().includes(q) ||
          ch.number.toString().includes(q) ||
          (ch.chapter_label && ch.chapter_label.toLowerCase().includes(q)) ||
          (ch.chapter_type && ch.chapter_type.toLowerCase().includes(q))
      );
    }
    if (!isAscending) {
      list.reverse();
    }
    return list;
  }, [chapters, searchQuery, isAscending]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-start transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md h-full bg-card p-5 sm:p-6 shadow-2xl flex flex-col border-r border-border-subtle animate-in slide-in-from-left duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-tag flex items-center justify-center text-accent shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h3 className="font-serif text-base font-bold text-text-main truncate">
                Chapter Directory
              </h3>
              <p className="text-[11px] text-text-muted truncate">
                {bookTitle} ({chapters.length.toLocaleString()} Chapters)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-text-muted hover:text-text-main rounded-lg hover:bg-tag transition-colors cursor-pointer"
            aria-label="Close chapter directory"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="py-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chapters by title or #..."
              className="w-full bg-page pl-9 pr-3 py-2 rounded-xl text-xs text-text-main placeholder:text-text-muted focus:outline-none focus:border-accent border border-border-subtle transition-colors"
            />
          </div>
        </div>

        {/* Chapter List */}
        <div className="flex-1 overflow-y-auto space-y-1 pr-1 text-xs">
          {filteredChapters.map((ch) => {
            const isCurrent = ch.number === currentChapterNum;
            return (
              <button
                key={ch.number}
                type="button"
                onClick={() => {
                  onSelectChapter && onSelectChapter(ch.number);
                  onClose();
                }}
                className={`w-full px-3 py-2.5 rounded-xl transition-all flex justify-between items-center text-left cursor-pointer border ${
                  isCurrent
                    ? "bg-accent/15 text-accent font-semibold border-accent/40 shadow-xs"
                    : "hover:bg-tag text-text-muted hover:text-text-main border-transparent"
                }`}
              >
                <div className="flex items-center gap-1.5 truncate pr-2">
                  {isCurrent && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                  {ch.chapter_type && ch.chapter_type !== "regular" && (
                    <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/25 shrink-0">
                      {ch.chapter_type.replace("_", " ")}
                    </span>
                  )}
                  <span className="truncate">
                    {ch.chapter_label ? `${ch.chapter_label}: ${ch.title}` : `Ch. ${ch.number}: ${ch.title}`}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-text-muted shrink-0">
                  <span>{ch.words || "3.5k"}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-accent ml-1" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Footer Options */}
        <div className="pt-3 border-t border-border-subtle flex justify-between items-center text-xs text-text-muted">
          <span>
            Order: {isAscending ? "1 → End" : "End → 1"}
          </span>
          <button
            type="button"
            onClick={() => setIsAscending(!isAscending)}
            className="text-accent hover:text-accent-hover font-semibold flex items-center gap-1 cursor-pointer transition-colors"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
            <span>Reverse Order</span>
          </button>
        </div>
      </div>
    </div>
  );
}
