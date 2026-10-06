import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ReaderSideNav({
  controlsVisible = true,
  canNavigatePrev = true,
  canNavigateNext = true,
  onNavigatePrev,
  onNavigateNext,
}) {
  return (
    <>
      {/* Previous Chapter Left Arrow (ixdzs .read-pre) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigatePrev && onNavigatePrev();
        }}
        aria-label="Previous Chapter"
        title={
          canNavigatePrev
            ? "Previous Chapter (Press Left Arrow ←)"
            : "First Chapter (You are on the first chapter)"
        }
        className={`flex fixed left-0 sm:left-2 md:left-3 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-10 md:w-11 h-12 sm:h-13 md:h-14 bg-card/85 hover:bg-card border border-border-subtle rounded-r-xl md:rounded-r-2xl shadow-md items-center justify-center transition-all duration-300 ease-in-out group backdrop-blur-xs touch-manipulation active:scale-95 ${
          !controlsVisible
            ? "transform -translate-x-full opacity-0 pointer-events-none"
            : !canNavigatePrev
            ? "transform translate-x-0 opacity-40 hover:opacity-80 text-text-muted/60 hover:text-text-main cursor-pointer pointer-events-auto"
            : "transform translate-x-0 opacity-95 text-text-muted hover:text-accent cursor-pointer pointer-events-auto"
        }`}
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Next Chapter Right Arrow (ixdzs .read-next) */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onNavigateNext && onNavigateNext();
        }}
        aria-label="Next Chapter"
        title={
          canNavigateNext
            ? "Next Chapter (Press Right Arrow →)"
            : "Final Chapter (Reached the latest chapter)"
        }
        className={`flex fixed right-0 sm:right-2 md:right-3 top-1/2 -translate-y-1/2 z-30 w-8 sm:w-10 md:w-11 h-12 sm:h-13 md:h-14 bg-card/85 hover:bg-card border border-border-subtle rounded-l-xl md:rounded-l-2xl shadow-md items-center justify-center transition-all duration-300 ease-in-out group backdrop-blur-xs touch-manipulation active:scale-95 ${
          !controlsVisible
            ? "transform translate-x-full opacity-0 pointer-events-none"
            : !canNavigateNext
            ? "transform translate-x-0 opacity-40 hover:opacity-80 text-text-muted/60 hover:text-text-main cursor-pointer pointer-events-auto"
            : "transform translate-x-0 opacity-95 text-text-muted hover:text-accent cursor-pointer pointer-events-auto"
        }`}
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </>
  );
}
