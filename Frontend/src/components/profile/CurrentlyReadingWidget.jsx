import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { BookMarked, Timer, Play, BookOpen } from "lucide-react";
import readingHistoryService from "../../services/readingHistoryService/readingHistoryService";

export default function CurrentlyReadingWidget({ initialBooks = null }) {
  const [shelfBooks, setShelfBooks] = useState(initialBooks || []);
  const [loading, setLoading] = useState(!initialBooks);

  useEffect(() => {
    if (initialBooks) {
      setShelfBooks(initialBooks);
      setLoading(false);
      return;
    }

    let isMounted = true;
    async function fetchShelf() {
      try {
        setLoading(true);
        const data = await readingHistoryService.getBookshelf("Reading");
        if (isMounted) {
          setShelfBooks(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        // Fallback gracefully to recent history or empty if not logged in
        if (isMounted) {
          setShelfBooks([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchShelf();

    return () => {
      isMounted = false;
    };
  }, [initialBooks]);

  return (
    <section className="bg-card border border-border-subtle/50 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col gap-4 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookMarked className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-text-main">
            Currently Reading Shelf
          </h2>
        </div>
        <Link to="/library" className="text-xs font-semibold text-accent hover:underline">
          View Shelf ({shelfBooks.length})
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2].map((i) => (
            <div key={i} className="p-3 bg-tag/50 rounded-xl flex gap-3 items-center">
              <div className="w-12 h-16 rounded bg-tag shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-tag rounded w-3/4" />
                <div className="h-3 bg-tag/70 rounded w-1/2" />
                <div className="h-2 bg-tag/50 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : shelfBooks.length > 0 ? (
        <div className="flex flex-col gap-3">
          {shelfBooks.map((b) => {
            const bookTitle = b.title || "Untitled Serial";
            const bookSlug = b.slug || b.book_id;
            const progress = Math.round(parseFloat(b.scroll_percentage || 0));
            const chapterNum = b.last_chapter_number || 1;
            const cover =
              b.cover_image ||
              b.coverImage ||
              "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";

            return (
              <div
                key={b.history_id || b.id || b.book_id}
                className="p-3 bg-tag/60 border border-border-subtle/40 rounded-xl hover:bg-tag transition-all flex gap-3 items-center"
              >
                <img
                  src={cover}
                  alt={bookTitle}
                  className="w-12 h-16 rounded-md object-cover shrink-0 shadow-xs border border-border-subtle/30"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400";
                  }}
                />

                <div className="flex flex-col justify-between flex-1 min-w-0">
                  <div>
                    <div className="flex items-center justify-between gap-1">
                      <Link
                        to={`/book/${bookSlug}`}
                        className="font-serif text-sm font-semibold text-text-main hover:text-accent transition-colors truncate"
                      >
                        {bookTitle}
                      </Link>
                      <span className="text-xs font-bold text-accent">{progress}%</span>
                    </div>
                    <p className="text-xs text-text-muted truncate mt-0.5">
                      Chapter {chapterNum}
                    </p>
                  </div>

                  {/* Progress bar and resume link */}
                  <div className="mt-2">
                    <div className="w-full bg-border-subtle/40 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className="bg-accent h-full rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-text-muted">
                      <span className="text-text-muted">
                        In progress
                      </span>
                      <Link
                        to={`/book/${bookSlug}/chapter/${chapterNum}`}
                        className="px-2.5 py-0.5 rounded-md bg-accent text-accent-text font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
                      >
                        Resume
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-6 text-center bg-tag/40 rounded-xl border border-border-subtle/40 space-y-2">
          <BookOpen className="w-7 h-7 text-text-muted mx-auto" />
          <p className="text-xs text-text-muted">
            Your reading shelf is currently empty.
          </p>
          <Link
            to="/"
            className="inline-block text-xs font-semibold text-accent hover:underline pt-1"
          >
            Explore Serial Works →
          </Link>
        </div>
      )}
    </section>
  );
}
