import React from "react";
import {
  BookOpen,
  Sliders,
  Moon,
  Sun,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function ReaderFooter({
  visible = true,
  currentChapter = 1663,
  totalChapters = 1663,
  fontSize = 19,
  isDarkMode = false,
  onNavigatePrev,
  onNavigateNext,
  onProgressChange,
  onAdjustFontSize,
  onToggleTOC,
  onToggleSettings,
  onToggleDayNight,
}) {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 pb-4 px-4 pointer-events-none ${
        visible
          ? "transform translate-y-0 opacity-100"
          : "transform translate-y-full opacity-0"
      }`}
    >
      <div className="max-w-xl mx-auto bg-card/95 backdrop-blur-md border border-border-subtle rounded-2xl shadow-xl p-3 flex items-center justify-between gap-2 pointer-events-auto">
        {/* 1. Catalog Drawer Trigger */}
        <button
          type="button"
          onClick={onToggleTOC}
          className="flex flex-col items-center justify-center px-2.5 py-1 text-text-muted hover:text-accent transition-colors rounded-xl hover:bg-tag cursor-pointer shrink-0"
          title="Table of Contents (Catalog)"
        >
          <BookOpen className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Catalog</span>
        </button>

        {/* 2. Reading Progress Slider & Chapter Step (ixdzs classic) */}
        <div className="flex-1 px-2 flex flex-col justify-center min-w-0">
          <div className="flex justify-between items-center text-[11px] text-text-muted mb-1 font-medium">
            <button
              type="button"
              onClick={onNavigatePrev}
              disabled={currentChapter <= 1}
              className="hover:text-accent disabled:opacity-30 flex items-center gap-0.5 cursor-pointer"
            >
              <ChevronLeft className="w-3 h-3" />
              <span>Prev</span>
            </button>

            <span className="font-semibold text-text-main truncate max-w-[130px] sm:max-w-[180px]">
              Ch. {currentChapter} / {totalChapters}
            </span>

            <button
              type="button"
              onClick={onNavigateNext}
              disabled={currentChapter >= totalChapters}
              className="hover:text-accent disabled:opacity-30 flex items-center gap-0.5 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <input
            type="range"
            min="1"
            max={totalChapters}
            value={currentChapter}
            onChange={(e) => onProgressChange && onProgressChange(Number(e.target.value))}
            className="w-full h-1.5 bg-border-subtle/50 rounded-lg appearance-none cursor-pointer accent-accent"
          />
        </div>

        {/* 3. Quick Font Sizing (A- / A+) */}
        <div className="flex items-center gap-1 bg-tag/80 px-1 py-0.5 rounded-xl border border-border-subtle/60 shrink-0">
          <button
            type="button"
            onClick={() => onAdjustFontSize && onAdjustFontSize(-1)}
            disabled={fontSize <= 14}
            className="w-7 h-7 rounded-lg hover:bg-card text-text-main disabled:opacity-30 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            title="Decrease font size"
          >
            A-
          </button>
          <span className="text-xs font-bold text-accent px-1">
            {fontSize}
          </span>
          <button
            type="button"
            onClick={() => onAdjustFontSize && onAdjustFontSize(1)}
            disabled={fontSize >= 28}
            className="w-7 h-7 rounded-lg hover:bg-card text-text-main disabled:opacity-30 flex items-center justify-center font-bold text-xs cursor-pointer transition-colors"
            title="Increase font size"
          >
            A+
          </button>
        </div>

        {/* 4. Reader Settings Trigger */}
        <button
          type="button"
          onClick={onToggleSettings}
          className="flex flex-col items-center justify-center px-2.5 py-1 text-text-muted hover:text-accent transition-colors rounded-xl hover:bg-tag cursor-pointer shrink-0"
          title="Reader Preferences"
        >
          <Sliders className="w-5 h-5" />
          <span className="text-[10px] font-semibold mt-0.5">Settings</span>
        </button>

        {/* 5. Day / Night Quick Mode Toggle */}
        <button
          type="button"
          onClick={onToggleDayNight}
          className="flex flex-col items-center justify-center px-2.5 py-1 text-text-muted hover:text-accent transition-colors rounded-xl hover:bg-tag cursor-pointer shrink-0"
          title="Toggle Day/Night Mode"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-amber-400" />
          ) : (
            <Moon className="w-5 h-5 text-accent" />
          )}
          <span className="text-[10px] font-semibold mt-0.5">
            {isDarkMode ? "Day" : "Night"}
          </span>
        </button>
      </div>
    </div>
  );
}
