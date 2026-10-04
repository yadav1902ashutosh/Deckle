import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { ListWidgetSkeleton } from "../common/Skeletons";
import chapterService from "../../services/chapterService/chapterService";

export default function LiveSerialPulse({ books = [], loading: parentLoading = false }) {
  const [pulseChapters, setPulseChapters] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    chapterService
      .getLivePulse()
      .then((data) => {
        if (isMounted) {
          setPulseChapters(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load live pulse:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  if (parentLoading || loading) {
    return <ListWidgetSkeleton count={4} />;
  }

  // Use live chapters if available, otherwise derive from books feed
  const displayItems =
    pulseChapters.length > 0
      ? pulseChapters
      : books.slice(0, 4).map((book, idx) => ({
          id: book.id || idx,
          published_at: null,
          chapter_number: "Latest",
          book_title: book.title,
          chapter_title: "New Chapter Available",
          book_slug: book.slug || book.id,
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

      {displayItems.length > 0 ? (
        <div className="space-y-2 divide-y divide-border-subtle/50">
          {displayItems.map((item, idx) => (
            <div
              key={item.id || idx}
              className="pt-2 first:pt-0 p-1.5 rounded hover:bg-tag transition-colors"
            >
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span className="font-semibold text-accent">
                  {idx === 0 ? "Just now" : idx === 1 ? "1h ago" : "Earlier"}
                </span>
                <span className="text-[11px] bg-tag px-1.5 py-0.5 rounded border border-border-subtle">
                  Ch. {item.chapter_number}
                </span>
              </div>
              <Link
                to={`/book/${item.book_slug || item.slug}`}
                className="font-serif text-xs font-semibold text-text-main hover:text-accent truncate block mt-1"
              >
                {item.book_title || item.title}
              </Link>
              <p className="text-[11px] text-text-muted truncate mt-0.5">
                {item.chapter_title || item.title}
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
