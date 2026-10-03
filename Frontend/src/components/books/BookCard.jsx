import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, BookOpen } from "lucide-react";

export default function BookCard({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  const {
    id = "1",
    slug = "battle-through-the-heavens",
    title = "Battle Through the Heavens",
    author_name = "Tiancan Tudou (天蚕土豆)",
    cover_image = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=400&auto=format&fit=crop",
    rating = "9.6",
    reviewsCount = "112k",
    wordCount = "7.1M",
    status = "completed",
    badge = "Classic",
    description = "Here, there is no magic; only Dou Qi that has trained to its zenith! The fall of a genius into an outcast, until the ring upon his finger awakened...",
    latest_chapter_title = "Ch. 1648: Flame Emperor (Final)",
    latest_chapter_time = "Archived",
  } = book || {};

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-sm hover:shadow-md border border-border-subtle transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex gap-4">
          {/* Cover Art with Badge */}
          <Link
            to={`/book/${slug || id}`}
            className="w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-card-white shadow-xs relative border border-border-subtle block"
          >
            <img
              src={cover_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {badge && (
              <span className="absolute top-1 left-1 bg-page/90 backdrop-blur-xs text-[10px] font-semibold text-text-main px-1.5 py-0.5 rounded shadow-2xs">
                {badge}
              </span>
            )}
          </Link>

          {/* Book Metadata */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-start justify-between gap-1">
              <Link
                to={`/book/${slug || id}`}
                className="font-serif text-sm sm:text-base font-semibold text-text-main truncate group-hover:text-accent transition-colors block"
                title={title}
              >
                {title}
              </Link>
              <button
                type="button"
                onClick={toggleBookmark}
                className="text-text-muted hover:text-accent transition-colors p-1 cursor-pointer flex-shrink-0"
                title="Bookmark"
              >
                <Bookmark
                  className={`w-4 h-4 ${
                    isBookmarked ? "fill-accent text-accent" : ""
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-text-muted truncate">{author_name}</p>

            {/* Rating */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <Star className="w-3.5 h-3.5 text-accent fill-accent" />
              <span className="text-xs font-bold text-text-main">{rating}</span>
              <span className="text-[11px] text-text-muted">({reviewsCount})</span>
            </div>

            {/* Words & Status */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle">
                {wordCount} words
              </span>
              <span
                className={`px-2 py-0.5 rounded font-semibold capitalize ${
                  status === "completed"
                    ? "bg-tag text-text-muted border border-border-subtle"
                    : "bg-accent/15 text-accent"
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Synopsis Excerpt */}
        <p className="text-xs text-text-muted line-clamp-2 mt-3 leading-relaxed">
          {description}
        </p>
      </div>

      {/* Chapter jump footer with subtle backdrop */}
      <div className="pt-2.5 mt-3 flex items-center justify-between border-t border-border-subtle text-xs">
        <Link
          to={`/book/${slug || id}/chapter/latest`}
          className="text-accent hover:underline truncate max-w-[190px] flex items-center gap-1.5 font-medium"
        >
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">{latest_chapter_title}</span>
        </Link>
        <span className="text-text-muted text-[11px] flex-shrink-0">
          {latest_chapter_time}
        </span>
      </div>
    </div>
  );
}