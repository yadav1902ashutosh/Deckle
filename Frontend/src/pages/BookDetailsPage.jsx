import React, { useEffect, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import BookHero from "../components/book-details/BookHero";
import ChapterDirectory from "../components/book-details/ChapterDirectory";
import CommunityBento from "../components/book-details/CommunityBento";
import RelatedRecommendations from "../components/book-details/RelatedRecommendations";
import { STITCH_CATALOG } from "./HomePage";

// Canonical primary dataset from Stitch Design #6
const DEFAULT_NOVEL_DATA = {
  slug: "heavenly-tribulation",
  title: "Heavenly Tribulation",
  originalTitle: "劫天運",
  authorName: "Fleeting Dreams",
  authorInitials: "FD",
  authorStats: "4 Works Serialized • 184k Followers",
  coverImage:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAGe9INHSnugiywjymG_i5i33iBLXpxXDOh0f2twUTwQ3xC922EfxmEZX7TGnrK6kdxuboZlg9PB41vybRdDKveGj8quW0sf6SLbIfdlWTtEvkh3mVKPSTOliFJebDQuCYLltjlldp0aqlqcporD8okGD3sOSqtv21p4P9oR04Jy9DDTmfXZ0by9VVCqSNUEhvKkMHZ0GLfytoGM3d4YFThCcnAqnKje4Sa6zIzWzcxNLMJooSvH0Cg",
  genre: "Eastern Cultivation & Xuanhuan",
  rating: "9.9",
  reviewsCount: "12,419",
  totalWords: "24.9M",
  wordsPerChapter: "~2,600 w/ch",
  totalChapters: "9,568",
  totalChaptersNum: 9568,
  activeReaders: "44.0K",
  powerRank: "#02",
  powerRankCategory: "Weekly Cultivation",
  latestChapterNum: 9568,
  latestChapterTitle: "Chapter 9568: Garrison (駐兵)",
  latestChapterTime: "2 hours ago",
  currentReadingChapter: 2,
  currentReadingTitle: "Chapter 2: The Red Bridal Veil",
  currentProgressPercent: 14,
  tags: [
    "GhostCultivation",
    "AncientArtifact",
    "Bloodline",
    "RuthlessHero",
    "Reincarnation",
    "EasternMystery",
  ],
  synopsisParagraphs: [
    "Born cursed under the inauspicious convergence of five pure Yin elements, Xia Yi was marked for the grave before he ever drew breath. In the mountain village of Xia Family Vale, the ancient covenant demanded a sacrifice: a marriage pact carved into bone, tethering his mortal essence to an unfathomable ghost bride left behind by his grandfather's occult transgressions.",
    "Armed only with ancestral talismans steeped in crimson cinnabar and an uncanny perception to glimpse the roaming specters of the Nine Springs, Xia Yi navigates a treacherous Dao of ghost refinement. When heavenly tribunals descend to obliterate what defies mortal law, he turns his lineage’s blood curse into a weapon capable of upending mortal dynasties, celestial immortals, and the cosmic order itself.",
  ],
};

export default function BookDetailsPage() {
  const { slug } = useParams();

  // Scroll to top on slug change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [slug]);

  // Match with catalog or default
  const bookData = useMemo(() => {
    if (!slug || slug === "heavenly-tribulation") {
      return DEFAULT_NOVEL_DATA;
    }

    const matched = STITCH_CATALOG.find((b) => b.slug === slug || b.id === slug);
    if (matched) {
      return {
        ...DEFAULT_NOVEL_DATA,
        slug: matched.slug,
        title: matched.title,
        originalTitle: "",
        authorName: matched.author_name,
        authorInitials: matched.author_name.slice(0, 2).toUpperCase(),
        authorStats: "Serialized Author • Popular Canon",
        coverImage: matched.cover_image,
        genre: matched.tags?.[0] || "Cultivation & Fantasy",
        rating: matched.rating,
        reviewsCount: matched.reviewsCount,
        totalWords: matched.wordCount,
        tags: matched.tags || ["Cultivation"],
        synopsisParagraphs: [
          matched.description,
          "The legend spreads throughout myriad mortal worlds and celestial planes as ancient covenants re-awaken and heroes clash for supremacy.",
        ],
      };
    }

    return DEFAULT_NOVEL_DATA;
  }, [slug]);

  return (
    <div className="relative w-full min-h-screen pb-16 bg-page transition-colors duration-200">
      {/* Ambient background depth lights */}
      <div className="absolute -top-24 right-1/4 w-[480px] h-[480px] bg-accent/5 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-96 -left-32 w-[380px] h-[380px] bg-tag/40 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Full-Width Content Container */}
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 space-y-8 sm:space-y-12">
        {/* 1. Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="pt-4 sm:pt-6 flex items-center gap-1.5 text-xs text-text-muted flex-wrap"
        >
          <Link
            to="/"
            className="hover:text-accent transition-colors font-medium"
          >
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          <Link
            to="/"
            className="hover:text-accent transition-colors font-medium"
          >
            Catalog
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          <Link
            to={`/?genre=${encodeURIComponent(bookData.genre.toLowerCase())}`}
            className="hover:text-accent transition-colors font-medium"
          >
            {bookData.genre}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
          <span className="text-text-main font-semibold truncate max-w-[200px] sm:max-w-xs">
            {bookData.title}
          </span>
        </nav>

        {/* 2. Novel Overview / Hero Block */}
        <BookHero book={bookData} />

        {/* 3. Interactive Chapter Directory & Table of Contents */}
        <ChapterDirectory
          bookSlug={bookData.slug}
          totalChapters={bookData.totalChaptersNum || 9568}
        />

        {/* 4. Community & Author Insight Bento Callout */}
        <CommunityBento />

        {/* 5. Recommendations Grid ('Readers Also Enjoyed') */}
        <RelatedRecommendations />
      </div>
    </div>
  );
}
