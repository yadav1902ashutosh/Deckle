import React, { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  BookmarkPlus,
  Share2,
  Check,
} from "lucide-react";
import { HeroSpotlightSkeleton } from "../common/Skeletons";
import { useLibrary } from "../../context/LibraryContext";
import AuthorAvatar from "../common/AuthorAvatar";

const AUTO_ROTATE_INTERVAL = 6000; // 6 seconds per featured book

export default function HeroSpotlight({ book, books = [], loading = false }) {
  const { isBookmarked, toggleLibrary } = useLibrary();

  // Normalize books array (support both `books` list and single `book`)
  const bookList = useMemo(() => {
    if (Array.isArray(books) && books.length > 0) {
      return books.slice(0, 20); // Top 10-20 books
    }
    if (book) {
      return [book];
    }
    return [];
  }, [books, book]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [copied, setCopied] = useState(false);
  const stripRef = useRef(null);

  const total = bookList.length;
  const safeIndex = total > 0 ? currentIndex % total : 0;
  const currentBook = bookList[safeIndex];

  // Auto-rotation timer
  useEffect(() => {
    if (total <= 1 || isPaused || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex((idx) => (idx + 1) % total);
    }, AUTO_ROTATE_INTERVAL);

    return () => clearInterval(timer);
  }, [total, isPaused, isHovered]);

  // Keep miniature thumbnail strip scrolled to the active item
  useEffect(() => {
    if (stripRef.current) {
      const activeBtn = stripRef.current.children[safeIndex];
      if (activeBtn) {
        activeBtn.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [safeIndex]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const handleNext = () => {
    if (total <= 1) return;
    goToSlide((safeIndex + 1) % total);
  };

  const handlePrev = () => {
    if (total <= 1) return;
    goToSlide((safeIndex - 1 + total) % total);
  };

  const handleShare = () => {
    if (!currentBook) return;
    const url = window.location.origin + `/book/${currentBook.slug || currentBook.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading) {
    return <HeroSpotlightSkeleton />;
  }

  if (!currentBook) {
    return null;
  }

  const {
    id,
    slug = "",
    title = "Untitled Series",
    author_name = "Deckle Author",
    author_handle = "",
    cover_image = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600",
    rating = "4.9",
    reviewsCount = "1.2k",
    wordCount = "450k",
    views_count = 0,
    tags = ["Speculative Fiction", "Original"],
    description = "No synopsis available yet.",
    status = "ongoing",
  } = currentBook;

  const cleanHandle =
    author_handle ||
    author_name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");

  const bookUrl = `/book/${slug || id}`;
  const readUrl = `/book/${slug || id}/chapter/1`;
  const authorUrl = `/author/@${cleanHandle}`;
  const inLibrary = isBookmarked(id);

  return (
    <section
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full overflow-hidden bg-card border-b border-border-subtle shadow-xs transition-colors duration-200"
      aria-label="Featured Serials Spotlight"
    >
      {/* Ambient artistic aura backdrop */}
      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-accent/5 blur-2xl pointer-events-none" />


      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-6 lg:py-8 relative z-10">
        {/* Top Control Bar: Carousel navigation & status */}
        {total > 1 && (
          <div className="flex items-center justify-between pb-4 border-b border-border-subtle/40 mb-6">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent bg-accent/10 px-2.5 py-1 rounded-md">
                <Sparkles className="w-3.5 h-3.5" />
                Featured #{safeIndex + 1} of {total}
              </span>
              {(isPaused || isHovered) && (
                <span className="text-[11px] text-text-muted bg-tag px-2 py-0.5 rounded border border-border-subtle">
                  Paused
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsPaused((prev) => !prev)}
                aria-label={isPaused ? "Play auto-rotation" : "Pause auto-rotation"}
                className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-tag border border-border-subtle transition-colors cursor-pointer"
                title={isPaused ? "Resume rotation" : "Pause rotation"}
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous featured book"
                className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-tag border border-border-subtle transition-colors cursor-pointer"
                title="Previous book"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next featured book"
                className="p-1.5 rounded-md text-text-muted hover:text-text-main hover:bg-tag border border-border-subtle transition-colors cursor-pointer"
                title="Next book"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Main Spotlight Body */}
        <div
          key={id || safeIndex}
          className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12 transition-opacity duration-300 animate-fadeIn"
        >
          {/* Novel Cover Canvas with Tactile Edge */}
          <Link to={bookUrl} className="relative flex-shrink-0 group block cursor-pointer">
            <div className="w-64 h-88 sm:w-72 sm:h-96 rounded-lg overflow-hidden shadow-xl bg-card-white border border-border-subtle relative transform transition-transform duration-300 group-hover:scale-[1.02]">
              <img
                className="w-full h-full object-cover"
                src={cover_image}
                alt={`${title} cover`}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60" />
              <span className="absolute top-3 left-3 bg-accent text-accent-text text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Editor's Choice #{safeIndex + 1}
              </span>
            </div>
            {/* Tactile spine/page shadow underneath */}
            <div className="absolute -bottom-2 inset-x-4 h-4 bg-text-main/10 blur-md rounded-full pointer-events-none" />
          </Link>

          {/* Novel Editorial Dossier */}
          <div className="flex-1 flex flex-col justify-between space-y-4 text-left">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted">
                <span className="uppercase tracking-widest text-accent font-semibold">
                  Featured Series
                </span>
                <span>•</span>
                <span className="capitalize">{status}</span>
                <span>•</span>
                <span className="bg-tag px-2 py-0.5 rounded text-text-main font-medium border border-border-subtle">
                  Live Serial
                </span>
              </div>

              <Link to={bookUrl} className="block group">
                <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-text-main tracking-tight font-medium group-hover:text-accent transition-colors">
                  {title}
                </h1>
              </Link>

              <div className="flex items-center gap-2 text-sm text-text-muted font-medium">
                <span>By</span>
                <Link
                  to={authorUrl}
                  className="inline-flex items-center gap-1.5 text-text-main hover:text-accent cursor-pointer transition-colors group/author"
                >
                  <AuthorAvatar
                    name={author_name}
                    avatar={currentBook.author_avatar}
                    handle={cleanHandle}
                    size="xs"
                  />
                  <span className="underline decoration-border-subtle group-hover/author:text-accent">
                    {author_name}
                  </span>
                </Link>
              </div>
            </div>

            {/* Key Metrics Cluster */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-1">
              <div className="flex items-center gap-1.5 bg-tag px-3 py-1.5 rounded-lg border border-border-subtle">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span className="text-sm font-bold text-text-main">{rating || "4.9"}</span>
                <span className="text-xs text-text-muted">
                  ({reviewsCount || "1.2k"} ratings)
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <BookOpen className="w-4 h-4 text-accent" />
                <span className="font-semibold text-text-main">{wordCount || "Serial"}</span>
                <span className="text-xs">Words</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <Users className="w-4 h-4 text-accent" />
                <span className="font-semibold text-text-main">
                  {views_count ? views_count.toLocaleString() : "Active"}
                </span>
                <span className="text-xs">Readers</span>
              </div>
              <div className="flex items-center gap-1.5 text-text-muted text-sm">
                <TrendingUp className="w-4 h-4 text-accent" />
                <span className="font-semibold text-accent">Top #{safeIndex + 1}</span>
              </div>
            </div>

            {/* Synopses Excerpt */}
            <p className="text-sm sm:text-base text-text-muted max-w-3xl line-clamp-3 leading-relaxed">
              {description}
            </p>

            {/* Interactive Genre Tags */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              {Array.isArray(tags) &&
                tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-tag text-text-main text-xs px-3 py-1 rounded border border-border-subtle font-mono"
                  >
                    #{tag}
                  </span>
                ))}
              <span className="text-xs text-text-muted ml-2 italic">
                Serialized on Deckle
              </span>
            </div>

            {/* CTA Controls */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to={readUrl}
                className="inline-flex items-center justify-center gap-2 bg-accent hover:bg-accent-hover text-accent-text px-6 py-3 rounded-lg text-sm font-medium shadow-sm transition-all hover:shadow-md cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start Reading</span>
              </Link>
              <button
                type="button"
                onClick={() => toggleLibrary(currentBook)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-border-subtle ${
                  inLibrary
                    ? "bg-accent/15 text-accent font-semibold"
                    : "bg-tag hover:bg-border-subtle text-text-main"
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{inLibrary ? "In Library" : "Add to Library"}</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-lg bg-tag text-text-muted hover:text-text-main hover:bg-border-subtle border border-border-subtle transition-colors cursor-pointer"
                title="Share Novel"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Carousel Thumbnail Strip (top 10 to 20 books) */}
        {total > 1 && (
          <div className="mt-8 pt-4 border-t border-border-subtle/50">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Top {total} Featured Showcase
              </span>
            </div>

            <div
              ref={stripRef}
              className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none scroll-smooth"
            >
              {bookList.map((b, idx) => {
                const isActive = idx === safeIndex;
                return (
                  <button
                    key={b.id || idx}
                    type="button"
                    onClick={() => goToSlide(idx)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex-shrink-0 ${
                      isActive
                        ? "bg-accent text-accent-text border-accent shadow-sm font-semibold scale-[1.02]"
                        : "bg-tag text-text-muted hover:text-text-main hover:bg-border-subtle border-border-subtle"
                    }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold ${
                        isActive ? "bg-accent-text/20 text-accent-text" : "bg-card text-text-muted"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="max-w-[120px] sm:max-w-[150px] truncate">
                      {b.title || "Untitled"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
