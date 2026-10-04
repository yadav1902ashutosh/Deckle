import React from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { ListWidgetSkeleton } from "../common/Skeletons";

export default function LiveSerialPulse({ books = [], loading = false }) {
  if (loading) {
    return <ListWidgetSkeleton count={4} />;
  }

  // Derive pulses from live book catalog
  const updates = books.slice(0, 4).map((book, idx) => ({
    id: book.id || idx,
    timeAgo: idx === 0 ? "15m ago" : idx === 1 ? "1h ago" : "Earlier",
    chapterNum: "Latest",
    title: book.title,
    chapterTitle: "New Chapter Available",
    slug: book.slug || book.id,
  }));

  return (
    <div className="bg-card rounded-xl p-5 shadow-xs border border-border-subtle space-y-4 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent fill-accent" />
          <h3 className="font-serif text-base font-semibold text-text-main">
            Live Serial Pulse
          </h3>
        </div>
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
      </div>

      {updates.length > 0 ? (
        <div className="space-y-2 divide-y divide-border-subtle/50">
          {updates.map((item) => (
            <div
              key={item.id}
              className="pt-2 first:pt-0 p-1.5 rounded hover:bg-tag transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="font-semibold text-accent">{item.timeAgo}</span>
                <span className="text-[11px] bg-tag px-1.5 py-0.5 rounded border border-border-subtle">
                  {item.chapterNum}
                </span>
              </div>
              <Link
                to={`/book/${item.slug}`}
                className="font-serif text-xs font-semibold text-text-main hover:text-accent truncate block mt-1"
              >
                {item.title}
              </Link>
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                {item.chapterTitle}
              </p>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted">
          No serial updates recorded yet today.
        </div>
      )}
    </div>
  );
}
