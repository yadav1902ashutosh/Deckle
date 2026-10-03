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
  BellRing,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function BookHero({ book }) {
  const [isBookmarked, setIsBookmarked] = useState(true);
  const [copiedShare, setCopiedShare] = useState(false);

  const {
    slug = "heavenly-tribulation",
    title = "Heavenly Tribulation",
    originalTitle = "劫天運",
    authorName = "Fleeting Dreams",
    authorInitials = "FD",
    authorStats = "4 Works Serialized • 184k Followers",
    coverImage = "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
    rating = "9.9",
    reviewsCount = "12,419",
    totalWords = "24.9M",
    wordsPerChapter = "~2,600 w/ch",
    totalChapters = "9,568",
    activeReaders = "44.0K",
    powerRank = "#02",
    powerRankCategory = "Weekly Cultivation",
    latestChapterNum = 9568,
    latestChapterTitle = "Chapter 9568: Garrison (駐兵)",
    latestChapterTime = "2 hours ago",
    currentReadingChapter = 2,
    currentReadingTitle = "Chapter 2: The Red Bridal Veil",
    currentProgressPercent = 14,
    tags = [
      "GhostCultivation",
      "AncientArtifact",
      "Bloodline",
      "RuthlessHero",
      "Reincarnation",
      "EasternMystery",
    ],
    synopsisParagraphs = [
      "Born cursed under the inauspicious convergence of five pure Yin elements, Xia Yi was marked for the grave before he ever drew breath. In the mountain village of Xia Family Vale, the ancient covenant demanded a sacrifice: a marriage pact carved into bone, tethering his mortal essence to an unfathomable ghost bride left behind by his grandfather's occult transgressions.",
      "Armed only with ancestral talismans steeped in crimson cinnabar and an uncanny perception to glimpse the roaming specters of the Nine Springs, Xia Yi navigates a treacherous Dao of ghost refinement. When heavenly tribunals descend to obliterate what defies mortal law, he turns his lineage’s blood curse into a weapon capable of upending mortal dynasties, celestial immortals, and the cosmic order itself.",
    ],
  } = book || {};

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
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              {/* Inner artistic gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20 pointer-events-none" />

              {/* Badges Over Artwork */}
              <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                <span className="bg-accent text-accent-text text-[11px] font-bold px-2.5 py-1 rounded-md shadow-sm tracking-wider uppercase backdrop-blur-sm">
                  Cultivation
                </span>
                <span className="bg-card/90 text-text-main text-[11px] font-semibold px-2.5 py-1 rounded-md shadow-sm backdrop-blur-sm flex items-center gap-1.5 border border-border-subtle/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Daily Serial
                </span>
              </div>

              {/* Calligraphic Original Title Overlay on Cover Bottom */}
              <div className="absolute bottom-3 left-3 right-3 text-white flex items-end justify-between">
                <div>
                  <p className="font-serif text-2xl tracking-widest text-[#ffdcc5] drop-shadow-md">
                    {originalTitle}
                  </p>
                  <p className="text-[11px] text-zinc-300 font-sans tracking-wide">
                    Serialized across 32 volumes
                  </p>
                </div>
                <div className="bg-black/60 px-2 py-1 rounded backdrop-blur-md border border-white/10 text-right">
                  <span className="text-[10px] text-accent-text font-mono font-semibold">
                    Ver. 2.14
                  </span>
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
                Continue Reading Ch. {currentReadingChapter}{" "}
                <span className="opacity-80 font-normal text-xs">
                  ({currentProgressPercent}%)
                </span>
              </span>
            </Link>

            <div className="grid grid-cols-3 gap-2">
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
                className="h-10 bg-card hover:bg-tag text-text-main font-medium text-xs flex items-center justify-center gap-1.5 rounded-xl border border-border-subtle transition-colors cursor-pointer"
                title="Download for Offline Reading"
              >
                <Download className="w-4 h-4 text-text-muted" />
                <span>Archive</span>
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

          {/* Quick Reading Progress Mini-Card */}
          <div className="bg-card rounded-xl p-4 border border-border-subtle flex items-center justify-between shadow-xs">
            <div className="space-y-1 min-w-0 pr-3">
              <span className="text-[10px] text-text-muted uppercase tracking-wider font-semibold">
                Your Progress
              </span>
              <p className="text-xs font-semibold text-text-main truncate">
                {currentReadingTitle}
              </p>
              <div className="w-36 sm:w-44 bg-border-subtle/50 h-1.5 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-accent h-full rounded-full transition-all duration-300"
                  style={{ width: `${currentProgressPercent}%` }}
                />
              </div>
            </div>
            <span className="text-sm font-bold text-accent shrink-0">
              {currentProgressPercent}%
            </span>
          </div>
        </div>

        {/* ================= RIGHT COLUMN: DEEP METADATA, STATS & BLURB (8 of 12) ================= */}
        <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
          {/* Title & Author Bar */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-text-main tracking-tight">
                {title}
              </h1>
              {originalTitle && (
                <span className="font-serif text-xl sm:text-2xl text-text-muted font-normal tracking-wide">
                  {originalTitle}
                </span>
              )}
            </div>

            {/* Author Attribution Line */}
            <div className="flex items-center flex-wrap gap-4 pt-1">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-accent/20 text-accent flex items-center justify-center font-bold text-sm shadow-2xs border border-accent/30">
                  {authorInitials}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-text-main hover:text-accent cursor-pointer transition-colors">
                      {authorName}
                    </span>
                    <CheckCircle2
                      className="w-4 h-4 text-accent"
                      title="Verified Master Author"
                    />
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {authorStats}
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
                  /10 ({reviewsCount} reviews)
                </span>
              </div>
            </div>
          </div>

          {/* Stat Tiles Bento (Word Count, Chapters, Readers, Rating) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-card rounded-xl p-3 border border-border-subtle shadow-xs">
            <div className="flex flex-col p-2 bg-page/50 rounded-lg border border-border-subtle/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                Total Words
              </span>
              <span className="font-serif text-xl font-bold text-text-main mt-0.5">
                {totalWords}
              </span>
              <span className="text-[11px] text-text-muted">
                {wordsPerChapter}
              </span>
            </div>

            <div className="flex flex-col p-2 bg-page/50 rounded-lg border border-border-subtle/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                Chapter Count
              </span>
              <span className="font-serif text-xl font-bold text-text-main mt-0.5">
                {totalChapters}
              </span>
              <span className="text-[11px] text-text-muted">Active Serial</span>
            </div>

            <div className="flex flex-col p-2 bg-page/50 rounded-lg border border-border-subtle/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                Active Readers
              </span>
              <span className="font-serif text-xl font-bold text-text-main mt-0.5">
                {activeReaders}
              </span>
              <span className="text-[11px] text-text-muted">Last 7 days</span>
            </div>

            <div className="flex flex-col p-2 bg-page/50 rounded-lg border border-border-subtle/50">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-text-muted">
                Power Rank
              </span>
              <span className="font-serif text-xl font-bold text-accent mt-0.5">
                {powerRank}
              </span>
              <span className="text-[11px] text-text-muted">
                {powerRankCategory}
              </span>
            </div>
          </div>

          {/* Latest Release Alert Banner */}
          <div className="bg-tag hover:bg-tag/80 transition-colors rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-border-subtle shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-accent text-accent-text flex items-center justify-center shrink-0 shadow-2xs">
                <BellRing className="w-5 h-5 animate-bounce" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                    Latest Release
                  </span>
                  <span className="text-[11px] text-text-muted">
                    • {latestChapterTime}
                  </span>
                </div>
                <p className="text-sm font-semibold text-text-main truncate">
                  {latestChapterTitle}
                </p>
              </div>
            </div>
            <Link
              to={`/book/${slug}/chapter/${latestChapterNum}`}
              className="shrink-0 px-4 py-2 bg-card hover:bg-page text-accent font-semibold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors border border-border-subtle self-start sm:self-auto cursor-pointer"
            >
              <span>Read Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Blurb / Synopsis */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent" />
              <h3 className="text-xs uppercase tracking-wider text-text-muted font-bold">
                Synopsis
              </h3>
            </div>
            <div className="bg-card rounded-xl p-5 sm:p-6 space-y-3.5 font-serif text-sm sm:text-base text-text-main leading-relaxed border border-border-subtle shadow-xs">
              {synopsisParagraphs.map((para, idx) => (
                <p key={idx}>{para}</p>
              ))}
            </div>
          </div>

          {/* Thematic Tags & Motifs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xs text-text-muted font-semibold mr-1">
              Tags:
            </span>
            {tags.map((tag) => (
              <Link
                key={tag}
                to={`/?genre=${encodeURIComponent(tag.toLowerCase())}`}
                className="px-3 py-1 bg-card hover:bg-tag text-accent hover:text-accent-hover rounded-md text-xs font-medium border border-border-subtle transition-colors"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
