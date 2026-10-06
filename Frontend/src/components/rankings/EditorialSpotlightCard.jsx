import React from "react";
import { Link } from "react-router-dom";
import AuthorAvatar from "../common/AuthorAvatar";
import { CheckCircle2, BookOpen, BookmarkPlus, BookmarkCheck, Eye, PenLine } from "lucide-react";
import { useLibrary } from "../../context/LibraryContext";

export default function EditorialSpotlightCard({
  spotlight,
  spotlightBook,
  onAddToShelf,
}) {
  const { isBookmarked, toggleLibrary } = useLibrary();

  const spotlightData = spotlight || spotlightBook || {
    id: 1,
    title: "Heavenly Tribulation",
    slug: "heavenly-tribulation",
    author: "Fleeting Dreams",
    status: "Ongoing",
    category: "#1 Fantasy",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=400",
    totalWords: "24.9M words",
    views: "43.9k",
    tags: ["Traditional Fantasy", "Ghost Cultivation", "Defying Fate"],
    excerpt: "Born cursed with five yin elements, destined to attract vengeful spirits. A grandmother's secret child bride, and a path of defying fate through karmic ghost-raising...",
  };

  const inLibrary = spotlightData?.id ? isBookmarked(spotlightData.id) : false;

  const handleShelfClick = () => {
    if (onAddToShelf) {
      onAddToShelf();
    } else {
      toggleLibrary(spotlightData);
    }
  };
  return (
    <section className="relative overflow-hidden rounded-2xl bg-card border border-border-subtle/50 p-4 sm:p-5 shadow-sm flex flex-col gap-3 transition-colors">
      {/* Contained ambient aura */}
      <div className="absolute -right-8 -bottom-8 w-44 h-44 rounded-full bg-accent/10 blur-2xl pointer-events-none" />

      {/* Header Badge */}
      <div className="flex items-center justify-between z-10">
        <div className="flex items-center gap-1.5 text-accent font-semibold text-xs tracking-wider uppercase">
          <CheckCircle2 className="w-4 h-4" />
          <span>Today's Editor Pick</span>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-accent/15 text-accent">
          {spotlightData.category || "#1 Ranked"}
        </span>
      </div>

      {/* Main Info with Cover */}
      <div className="flex gap-3 sm:gap-4 z-10">
        {/* Cover Artwork */}
        <div className="relative shrink-0 w-22 sm:w-26 h-30 sm:h-36 rounded-xl overflow-hidden shadow-md bg-tag border border-border-subtle/40">
          <img
            src={spotlightData.coverImage || spotlightData.cover_image}
            alt={spotlightData.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src =
                "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
            }}
          />
          <div className="absolute top-1 left-1 px-1.5 py-0.2 rounded bg-accent/90 text-white font-bold text-[10px] uppercase shadow-xs">
            HOT
          </div>
        </div>

        {/* Dossier */}
        <div className="flex flex-col justify-between flex-1 min-w-0">
          <div>
            <Link
              to={`/book/${spotlightData.slug || spotlightData.id}`}
              className="font-serif text-lg sm:text-xl font-semibold text-text-main hover:text-accent transition-colors line-clamp-1"
            >
              {spotlightData.title}
            </Link>

            <div className="flex items-center gap-1.5 mt-0.5 text-xs text-text-muted">
              <AuthorAvatar
                name={spotlightData.author || spotlightData.author_name}
                avatar={spotlightData.authorAvatar || spotlightData.author_avatar}
                handle={spotlightData.authorHandle || spotlightData.author_handle}
                size="xs"
              />
              <span>{spotlightData.author || spotlightData.author_name}</span>
              <span>•</span>
              <span className="text-accent font-medium">{spotlightData.status}</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-text-muted mt-1">
              <span className="flex items-center gap-1">
                <PenLine className="w-3.5 h-3.5" /> {spotlightData.totalWords}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> {spotlightData.views}
              </span>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {Array.isArray(spotlightData.tags) &&
              spotlightData.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-tag text-text-muted text-[11px] font-medium"
                >
                  {tag}
                </span>
              ))}
          </div>
        </div>
      </div>

      {/* Excerpt */}
      <p className="font-serif text-xs sm:text-sm text-text-muted line-clamp-2 z-10 italic opacity-90 leading-relaxed">
        "{spotlightData.excerpt || spotlightData.description}"
      </p>

      {/* Quick CTAs */}
      <div className="grid grid-cols-2 gap-2 pt-1 z-10">
        <Link
          to={`/book/${spotlightData.slug || spotlightData.id}/chapter/1`}
          className="h-10 rounded-xl bg-accent hover:bg-accent-hover text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          <span>Read Ch. 1</span>
        </Link>

        <button
          onClick={handleShelfClick}
          className={`h-10 rounded-xl border border-border-subtle/50 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
            inLibrary
              ? "bg-accent/15 text-accent border-accent/40"
              : "bg-tag hover:bg-card text-text-main"
          }`}
          title={inLibrary ? "In Library" : "Add to Library"}
        >
          {inLibrary ? (
            <BookmarkCheck className="w-4 h-4 text-accent" />
          ) : (
            <BookmarkPlus className="w-4 h-4 text-accent" />
          )}
          <span>{inLibrary ? "In Library" : "Add to Shelf"}</span>
        </button>
      </div>
    </section>
  );
}
