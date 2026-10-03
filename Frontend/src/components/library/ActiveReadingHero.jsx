import React from "react";
import { Link } from "react-router-dom";
import { Play, BookOpen, Clock } from "lucide-react";

export default function ActiveReadingHero({
  book = {
    title: "Battle Through the Heavens",
    slug: "battle-through-the-heavens",
    currentChapterNumber: 42,
    currentChapterTitle: "The Alchemist Grandmaster",
    quote: "The flame inside the jade cauldron crackled with ethereal azure light as Xiao Yan held his breath...",
    progressPercentage: 68,
    coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    lastRead: "15m ago",
    totalChapters: 1663,
  },
}) {
  return (
    <div className="flex flex-col h-full gap-2">
      {/* Aligned Top Subheader Label */}
      <div className="flex items-center justify-between text-xs text-text-muted h-5">
        <span className="font-semibold uppercase tracking-wider text-text-muted">
          Current Scroll
        </span>
        <span className="text-accent font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" /> Read {book.lastRead}
        </span>
      </div>

      {/* Main Card — Stretches to Equal Height */}
      <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 flex flex-col justify-between flex-1 h-full shadow-sm relative overflow-hidden transition-colors">
        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

        {/* Middle Content */}
        <div className="flex gap-4 items-start z-10 mb-4">
          {/* Cover with progress badge */}
          <div className="w-20 sm:w-24 h-28 sm:h-32 rounded-xl overflow-hidden shrink-0 shadow-md relative bg-tag border border-border-subtle/40">
            <img
              src={book.coverImage}
              alt={book.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-accent/90 backdrop-blur-xs text-white text-[11px] font-bold py-0.5 text-center">
              {book.progressPercentage}%
            </div>
          </div>

          {/* Metadata */}
          <div className="flex flex-col min-w-0 flex-1 justify-between py-0.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded-full bg-tag text-text-muted text-[11px] font-semibold">
                  Cultivation
                </span>
                <span className="text-xs text-text-muted">
                  Ch. {book.currentChapterNumber} / {book.totalChapters}
                </span>
              </div>

              <Link
                to={`/book/${book.slug}`}
                className="font-serif text-lg sm:text-xl font-semibold text-text-main hover:text-accent transition-colors line-clamp-1"
              >
                {book.title}
              </Link>

              <p className="text-xs sm:text-sm font-medium text-text-muted mt-0.5 truncate">
                Ch. {book.currentChapterNumber}: {book.currentChapterTitle}
              </p>

              <p className="font-serif text-xs text-text-muted italic line-clamp-2 mt-2 leading-relaxed opacity-85">
                "{book.quote}"
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Resume CTA with Integrated Progress Bar */}
        <Link
          to={`/book/${book.slug}/chapter/${book.currentChapterNumber}`}
          className="relative w-full h-12 bg-accent hover:bg-accent-hover rounded-xl overflow-hidden flex items-center justify-between px-4 text-white font-medium text-sm shadow-md active:scale-[0.99] transition-all group z-10 shrink-0"
        >
          {/* Background Progress Tint Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-white/20 pointer-events-none transition-all duration-500"
            style={{ width: `${book.progressPercentage}%` }}
          />

          <div className="relative z-10 flex items-center gap-2 font-semibold">
            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="w-4 h-4 fill-white text-white" />
            </div>
            <span>Continue Reading</span>
          </div>

          <span className="relative z-10 text-xs font-semibold px-2.5 py-1 rounded-full bg-black/20 text-white">
            {book.progressPercentage}% Complete
          </span>
        </Link>
      </div>
    </div>
  );
}
