import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CatalogPagination({
  currentPage = 1,
  totalPages = 124,
  onPageChange,
}) {
  const [jumpPage, setJumpPage] = useState(currentPage);

  const handleJump = (e) => {
    e.preventDefault();
    const pageNum = parseInt(jumpPage, 10);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      onPageChange && onPageChange(pageNum);
    }
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm border border-border-subtle flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-colors duration-200">
      {/* Current page label */}
      <div className="text-text-muted">
        Page <strong className="text-text-main font-semibold">{currentPage}</strong> of{" "}
        <strong className="text-text-main font-semibold">{totalPages}</strong>
      </div>

      {/* Numerical pagination controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1.5 rounded bg-tag text-text-muted hover:text-text-main font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors border border-border-subtle"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Prev</span>
        </button>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(1)}
          className={`w-8 h-8 rounded text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
            currentPage === 1
              ? "bg-accent text-accent-text"
              : "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
          }`}
        >
          1
        </button>
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(2)}
          className={`w-8 h-8 rounded text-xs font-semibold transition-colors cursor-pointer ${
            currentPage === 2
              ? "bg-accent text-accent-text"
              : "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
          }`}
        >
          2
        </button>
        <button
          type="button"
          onClick={() => onPageChange && onPageChange(3)}
          className={`w-8 h-8 rounded text-xs font-semibold transition-colors cursor-pointer ${
            currentPage === 3
              ? "bg-accent text-accent-text"
              : "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
          }`}
        >
          3
        </button>

        <span className="px-1 text-text-muted">...</span>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(totalPages)}
          className={`w-8 h-8 rounded text-xs font-semibold transition-colors cursor-pointer ${
            currentPage === totalPages
              ? "bg-accent text-accent-text"
              : "bg-tag hover:bg-border-subtle text-text-main border border-border-subtle"
          }`}
        >
          {totalPages}
        </button>

        <button
          type="button"
          onClick={() => onPageChange && onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="px-3 py-1.5 rounded bg-tag hover:bg-border-subtle text-text-main font-medium disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 cursor-pointer transition-colors border border-border-subtle"
        >
          <span>Next</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Rapid Jump Input */}
      <form onSubmit={handleJump} className="flex items-center gap-2">
        <span className="text-text-muted">Go to:</span>
        <input
          type="number"
          min="1"
          max={totalPages}
          value={jumpPage}
          onChange={(e) => setJumpPage(e.target.value)}
          className="w-14 bg-tag text-text-main text-xs rounded px-2 py-1 text-center border border-border-subtle focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-2.5 py-1 bg-tag hover:bg-border-subtle text-text-main rounded font-medium border border-border-subtle transition-colors cursor-pointer"
        >
          Jump
        </button>
      </form>
    </div>
  );
}
