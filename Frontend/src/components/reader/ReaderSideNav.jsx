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
        disabled={!canNavigatePrev}
        onClick={(e) => {
          e.stopPropagation();
          onNavigatePrev && onNavigatePrev();
        }}
        title="Previous Chapter (Press Left Arrow ←)"
        className={`hidden md:flex fixed left-3 top-1/2 -translate-y-1/2 z-30 w-11 h-14 bg-card/90 hover:bg-card border border-border-subtle rounded-r-2xl shadow-md items-center justify-center text-text-muted hover:text-accent disabled:opacity-0 transition-all duration-300 group cursor-pointer ${
          controlsVisible ? "opacity-95" : "opacity-25 hover:opacity-95"
        }`}
      >
        <ChevronLeft className="w-6 h-6 group-hover:-translate-x-0.5 transition-transform" />
      </button>

      {/* Next Chapter Right Arrow (ixdzs .read-next) */}
      <button
        type="button"
        disabled={!canNavigateNext}
        onClick={(e) => {
          e.stopPropagation();
          onNavigateNext && onNavigateNext();
        }}
        title="Next Chapter (Press Right Arrow →)"
        className={`hidden md:flex fixed right-3 top-1/2 -translate-y-1/2 z-30 w-11 h-14 bg-card/90 hover:bg-card border border-border-subtle rounded-l-2xl shadow-md items-center justify-center text-text-muted hover:text-accent disabled:opacity-0 transition-all duration-300 group cursor-pointer ${
          controlsVisible ? "opacity-95" : "opacity-25 hover:opacity-95"
        }`}
      >
        <ChevronRight className="w-6 h-6 group-hover:translate-x-0.5 transition-transform" />
      </button>
    </>
  );
}
