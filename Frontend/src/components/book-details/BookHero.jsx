import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Bookmark,
  BookmarkCheck,
  Download,
  Share2,
  Star,
  CheckCircle2,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function BookHero({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);

  if (!book) return null;

  const {
    slug = "",
    title = "Untitled Novel",
    originalTitle = "",
    author_name = "",
    authorName = "",
    author_handle = "",
    authorHandle = "",
    authorInitials = "",
    authorStats = "Serialized Author",
    cover_image = "",
    coverImage = "",
    rating = "4.9",
    reviewsCount = "1.2k",
    totalWords = "Serial",
    wordsPerChapter = "~2,600 w/ch",
    totalChapters = "1",
    activeReaders = "Active",
    powerRank = "#01",
    powerRankCategory = "Catalog",
    status = "ongoing",
    latestChapterNum = 1,
    latestChapterTitle = "Chapter 1",
    latestChapterTime = "Recent",
    currentReadingChapter = 1,
    currentReadingTitle = "Chapter 1",
    currentProgressPercent = 5,
    tags = [],
    synopsisParagraphs = [],
    description = "",
    genre_name = "",
  } = book;

  const resolvedTitle = title;
  const resolvedAuthor = author_name || authorName || "Deckle Author";
  const resolvedHandle =
    author_handle ||
    authorHandle ||
    resolvedAuthor.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");
  const resolvedCover =
    cover_image ||
    coverImage ||
    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800";
  const resolvedInitials =
    authorInitials ||
    resolvedAuthor
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  const primaryGenre = genre_name || (Array.isArray(tags) && tags[0]) || "Serial";

  const paragraphs =
    Array.isArray(synopsisParagraphs) && synopsisParagraphs.length > 0
      ? synopsisParagraphs
      : description
      ? [description]
      : ["No synopsis available for this serial."];

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <section className="w-full">
      <div className="grid grid-cols-12 gap-6 lg:gap-10 items-start">
        {/* ================= LEFT COLUMN: COVER & DIRECT ACTIONS (4 of 12) ================= */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-5">
          {/* Cover Art Container */}
          <div className="relative group bg-card rounded-2xl p-3 shadow-md hover:shadow-xl border border-border-subtle transition-all duration-300">
            <div className="relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-card-white shadow-inner">
              <img
                src={resolvedCover}
                alt={resolvedTitle}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

              {/* Badges Over Artwork */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-accent text-accent-text text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wider uppercase backdrop-blur-sm">
                  {primaryGenre}
                </span>
                <span className="bg-card/90 text-text-main text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm flex items-center gap-1.5 border border-border-subtle/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="capitalize">{status}</span>
                </span>
              </div>

              {/* Title Overlay on Cover Bottom */}
              <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                <div>
                  <p className="font-serif text-lg tracking-wide text-white drop-shadow-md line-clamp-1">
                    {resolvedTitle}
                  </p>
                  <p className="text-[11px] text-zinc-300 font-sans tracking-wide">
                    By @{resolvedHandle}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-col gap-2">
            <Link
              to={`/book/${slug}/chapter/${currentReadingChapter || 1}`}
              className="w-full h-12 bg-accent text-accent-text font-semibold text-sm flex items-center justify-center gap-2 rounded-xl shadow-sm hover:bg-accent-hover transition-all group cursor-pointer"
            >
              <BookOpen className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span>
                Start Reading Ch. {currentReadingChapter || 1}
              </span>
            </Link>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`h-10 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 border border-border-subtle transition-colors cursor-pointer ${
                  isBookmarked
                    ? "bg-tag text-accent font-semibold"
                    : "bg-card hover:bg-tag text-text-main"
                }`}
                title="Save to Library"
              >
                {isBookmarked ? (
                  <BookmarkCheck className="w-4 h-4 text-accent" />
                ) : (
                  <Bookmark className="w-4 h-4 text-text-muted" />
                )}
                <span>{isBookmarked ? "In Library" : "Add to Shelf"}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="h-10 bg-card hover:bg-tag text-text-main font-medium text-xs flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle transition-colors cursor-pointer"
                title="Share Novel"
              >
                <Share2 className="w-4 h-4 text-text-muted" />
                <span>{copiedShare ? "Copied!" : "Share"}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DEEP METADATA, STATS & BLURB (8 of 12) ================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Title & Author Bar */}
          <div className="space-y-2">
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main tracking-tight">
              {resolvedTitle}
            </h1>

            {/* Author Attribution Line */}
            <div className="flex items-center flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm shadow-2xs border border-accent/30">
                  {resolvedInitials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <Link
                      to={`/author/@${resolvedHandle}`}
                      className="text-sm font-semibold text-text-main hover:text-accent hover:underline cursor-pointer transition-colors"
                    >
                      {resolvedAuthor}
                    </Link>
                    <CheckCircle2
                      className="w-4 h-4 text-accent"
                      title="Verified Author"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted">
                    @{resolvedHandle}
                  </span>
                </div>
              </div>

              <div className="h-4 w-[1px] bg-border-subtle hidden sm:block" />

              <div className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="text-base text-text-main font-bold">
                  {rating}
                </span>
                <span className="text-xs text-text-muted">
                  / 5.0 ({reviewsCount} ratings)
                </span>
              </div>
            </div>
          </div>

          {/* Granular Tag Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {primaryGenre && (
              <span className="bg-accent/15 text-accent border border-accent/30 font-semibold px-2.5 py-1 rounded text-xs">
                {primaryGenre}
              </span>
            )}
            {Array.isArray(tags) &&
              tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-tag hover:bg-tag/80 text-text-main border border-border-subtle px-2.5 py-1 rounded text-xs transition-colors"
                >
                  #{tag}
                </span>
              ))}
          </div>

          {/* Synopsis Blurb */}
          <div className="bg-card border border-border-subtle/80 rounded-2xl p-6 shadow-xs space-y-3">
            <h3 className="font-serif font-bold text-base text-text-main">
              Synopsis
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-text-muted leading-relaxed">
              {paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>

          {/* Key Stats Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-card border border-border-subtle rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Status
              </span>
              <p className="text-sm font-bold text-text-main capitalize">
                {status}
              </p>
            </div>
            <div className="bg-card border border-border-subtle rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Word Count
              </span>
              <p className="text-sm font-bold text-text-main">
                {totalWords}
              </p>
            </div>
            <div className="bg-card border border-border-subtle rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Total Chapters
              </span>
              <p className="text-sm font-bold text-text-main">
                {totalChapters}
              </p>
            </div>
            <div className="bg-card border border-border-subtle rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] uppercase font-bold text-text-muted tracking-wider">
                Platform
              </span>
              <p className="text-sm font-bold text-accent">
                Deckle Serial
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
