import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Star, Bookmark, BookOpen } from "lucide-react";

export default function BookCard({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (!book) return null;

  const {
    id,
    slug = "",
    title = "Untitled Serial",
    author_name = "Deckle Author",
    author_handle = "",
    cover_image = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400",
    rating = "4.8",
    reviewsCount = "1.2k",
    wordCount = "450k",
    status = "ongoing",
    badge = "",
    description = "No synopsis available.",
    latest_chapter_title,
    latest_chapter_time,
  } = book;

  const cleanHandle =
    author_handle ||
    author_name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");

  const bookUrl = `/book/${slug || id}`;
  const authorUrl = `/author/@${cleanHandle}`;

  const toggleBookmark = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked((prev) => !prev);
  };

  return (
    <div className="bg-card rounded-xl p-4 shadow-2xs hover:shadow-md border border-border-subtle transition-all duration-200 flex flex-col justify-between group">
      <div>
        <div className="flex gap-4">
          {/* Cover Art with Badge */}
          <Link
            to={bookUrl}
            className="w-24 h-32 flex-shrink-0 rounded overflow-hidden bg-card-white shadow-2xs relative border border-border-subtle block"
          >
            <img
              src={cover_image}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src =
                  "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
              }}
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
                to={bookUrl}
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

            <Link
              to={authorUrl}
              className="text-xs text-text-muted hover:text-accent hover:underline truncate block"
              onClick={(e) => e.stopPropagation()}
            >
              {author_name}
            </Link>

            {/* Rating */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <Star className="w-3.5 h-3.5 text-accent fill-accent" />
              <span className="text-xs font-bold text-text-main">{rating}</span>
              <span className="text-[11px] text-text-muted">
                ({reviewsCount})
              </span>
            </div>

            {/* Words & Status */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 text-[11px]">
              <span className="bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle">
                {wordCount || "Serial"}
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

      {/* Chapter jump footer */}
      <div className="pt-2.5 mt-3 flex items-center justify-between border-t border-border-subtle text-xs">
        <Link
          to={`${bookUrl}/chapter/1`}
          className="text-accent hover:underline truncate max-w-[190px] flex items-center gap-1.5 font-medium"
        >
          <BookOpen className="w-3.5 h-3.5 flex-shrink-0" />
          <span className="truncate">
            {latest_chapter_title || "Read Latest Chapter"}
          </span>
        </Link>
        <span className="text-text-muted text-[11px] flex-shrink-0">
          {latest_chapter_time || "Updated"}
        </span>
      </div>
    </div>
  );
}