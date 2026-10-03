import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Eye,
  Clock,
  Sparkles,
  Flame,
  Award,
} from "lucide-react";

export default function RankingsList({
  novels = [],
  isCompactMode = false,
  sortBy = "popular",
  onSortChange = () => {},
  onToggleBookmark = () => {},
  bookmarkedIds = [],
}) {
  return (
    <section className="flex flex-col gap-3">
      {/* Sorter Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-baseline gap-2">
          <h3 className="font-serif text-base sm:text-lg font-semibold text-text-main">
            Serialized Leaderboard
          </h3>
          <span className="text-xs text-text-muted">{novels.length} Works</span>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <ArrowUpDown className="w-3.5 h-3.5 text-accent" />
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-card border border-border-subtle/40 rounded-lg px-2 py-1 text-xs text-text-main font-medium focus:outline-none cursor-pointer"
          >
            <option value="popular">Power Rankings</option>
            <option value="updated">Latest Update</option>
            <option value="rating">Top Rated</option>
            <option value="scale">Grand Epics (&gt;5M)</option>
          </select>
        </div>
      </div>

      {/* Novel Ranked Items (Expansive multi-column responsive layout) */}
      <div className={`grid gap-3.5 ${isCompactMode ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4" : "grid-cols-1 md:grid-cols-2 2xl:grid-cols-3"}`}>
        {novels.map((novel, idx) => {
          const rank = idx + 1;
          const isBookmarked = bookmarkedIds.includes(novel.id);

          // Custom medal colors for top 3
          let rankBadgeBg = "bg-tag text-text-muted";
          if (rank === 1) rankBadgeBg = "bg-amber-500/20 text-amber-600 font-bold border border-amber-500/40";
          if (rank === 2) rankBadgeBg = "bg-slate-400/20 text-slate-500 font-bold border border-slate-400/40";
          if (rank === 3) rankBadgeBg = "bg-amber-700/20 text-amber-700 font-bold border border-amber-700/40";

          return (
            <article
              key={novel.id}
              className="bg-card/75 hover:bg-card border border-border-subtle/50 rounded-xl p-3.5 flex flex-col gap-2 shadow-xs hover:shadow-sm transition-all group"
            >
              <div className="flex gap-3 items-start">
                {/* Rank Number Badge */}
                <div
                  className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 ${rankBadgeBg}`}
                >
                  {rank}
                </div>

                {/* Cover art */}
                <div className="relative shrink-0 w-16 sm:w-20 h-22 sm:h-28 rounded-lg overflow-hidden shadow-xs bg-tag border border-border-subtle/40">
                  <img
                    src={novel.coverImage}
                    alt={novel.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Main Information */}
                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-start justify-between gap-1">
                      <Link
                        to={`/book/${novel.slug}`}
                        className="font-serif text-sm sm:text-base font-semibold text-text-main hover:text-accent transition-colors truncate"
                      >
                        {novel.title}
                      </Link>

                      <button
                        onClick={() => onToggleBookmark(novel.id)}
                        title={isBookmarked ? "Remove Bookmark" : "Add to Shelf"}
                        className="p-1 text-text-muted hover:text-accent transition-colors shrink-0 cursor-pointer"
                      >
                        {isBookmarked ? (
                          <BookmarkCheck className="w-4 h-4 text-accent fill-accent" />
                        ) : (
                          <Bookmark className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                      <span className="hover:text-accent transition-colors">{novel.author}</span>
                      <span>•</span>
                      <span className="px-1.5 py-0.2 rounded bg-tag text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                        {novel.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-xs text-text-muted mt-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-tag text-text-main font-semibold text-[11px]">
                        {novel.totalWords}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-[11px]">
                        <Eye className="w-3.5 h-3.5" /> {novel.views}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Excerpt synopsis */}
              {!isCompactMode && novel.excerpt && (
                <p className="text-xs text-text-muted line-clamp-2 px-1 font-serif italic opacity-85 leading-relaxed">
                  "{novel.excerpt}"
                </p>
              )}

              {/* Bottom tags & update timestamp */}
              <div className="flex items-center justify-between pt-1 border-t border-border-subtle/30 text-xs">
                <div className="flex items-center gap-1.5 text-accent font-medium text-[11px]">
                  {novel.tags?.slice(0, 2).map((tag, tIdx) => (
                    <span key={tIdx} className="px-2 py-0.5 rounded-full bg-accent/10">
                      #{tag}
                    </span>
                  ))}
                </div>

                <span className="text-text-muted flex items-center gap-1 text-[11px] truncate max-w-[170px]">
                  <Clock className="w-3 h-3 text-accent" />
                  <span>Ch. {novel.latestChapterNumber} {novel.latestChapterTitle}</span>
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
