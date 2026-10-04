import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Star,
  BookOpen,
  Users,
  TrendingUp,
  Play,
  BookmarkPlus,
  Share2,
} from "lucide-react";
import { HeroSpotlightSkeleton } from "../common/Skeletons";

export default function HeroSpotlight({ book, loading = false }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  if (loading) {
    return <HeroSpotlightSkeleton />;
  }

  if (!book) {
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
  } = book;

  const cleanHandle =
    author_handle ||
    author_name.toLowerCase().replace(/[^a-z0-9]/g, "_").replace(/^_+|_+$/g, "");

  const bookUrl = `/book/${slug || id}`;
  const readUrl = `/book/${slug || id}/chapter/1`;
  const authorUrl = `/author/@${cleanHandle}`;

  return (
    <section className="relative w-full overflow-hidden bg-card border-b border-border-subtle shadow-xs transition-colors duration-200">
      {/* Ambient artistic aura backdrop */}
      <div className="absolute -top-24 -right-20 w-96 h-96 rounded-full bg-accent/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-8 lg:py-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8 lg:gap-12">
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
                Editor's Choice
              </span>
            </div>
            {/* Tactile spine/page shadow illusion underneath */}
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

              <p className="text-sm text-text-muted font-medium">
                By{" "}
                <Link
                  to={authorUrl}
                  className="text-text-main underline decoration-border-subtle hover:text-accent cursor-pointer transition-colors"
                >
                  {author_name}
                </Link>
              </p>
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
                <span className="font-semibold text-accent">Spotlight #1</span>
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
                onClick={() => setIsBookmarked(!isBookmarked)}
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg text-sm font-medium transition-colors cursor-pointer border border-border-subtle ${
                  isBookmarked
                    ? "bg-accent/15 text-accent"
                    : "bg-tag hover:bg-border-subtle text-text-main"
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>{isBookmarked ? "In Library" : "Add to Library"}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.origin + bookUrl);
                }}
                className="p-3 rounded-lg bg-tag text-text-muted hover:text-text-main hover:bg-border-subtle border border-border-subtle transition-colors cursor-pointer"
                title="Share Novel"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
