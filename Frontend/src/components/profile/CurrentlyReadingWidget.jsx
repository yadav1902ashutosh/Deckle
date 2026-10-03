import React from "react";
import { Link } from "react-router-dom";
import { BookMarked, Timer, Play } from "lucide-react";

export default function CurrentlyReadingWidget({
  books = [
    {
      id: 1,
      title: "Lord of the Mysteries",
      slug: "lord-of-the-mysteries",
      chapter: 1294,
      chapterTitle: "The Door of Transcendence",
      progress: 88,
      hoursSpent: "42h spent",
      coverImage: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 2,
      title: "A Record of a Mortal's Journey",
      slug: "a-record-of-a-mortals-journey",
      chapter: 510,
      chapterTitle: "The Spirit Tribulation Sea",
      progress: 42,
      hoursSpent: "28h spent",
      coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=400",
    },
    {
      id: 3,
      title: "Battle Through the Heavens",
      slug: "battle-through-the-heavens",
      chapter: 42,
      chapterTitle: "The Alchemist Grandmaster",
      progress: 68,
      hoursSpent: "16h spent",
      coverImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
    },
  ],
}) {
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
          View All ({books.length})
        </Link>
      </div>

      <div className="flex flex-col gap-3">
        {books.map((b) => (
          <div
            key={b.id}
            className="p-3 bg-tag/60 border border-border-subtle/40 rounded-xl hover:bg-tag transition-all flex gap-3 items-center"
          >
            <img
              src={b.coverImage}
              alt={b.title}
              className="w-12 h-16 rounded-md object-cover shrink-0 shadow-xs border border-border-subtle/30"
            />

            <div className="flex flex-col justify-between flex-1 min-w-0">
              <div>
                <div className="flex items-center justify-between gap-1">
                  <Link
                    to={`/book/${b.slug}`}
                    className="font-serif text-sm font-semibold text-text-main hover:text-accent transition-colors truncate"
                  >
                    {b.title}
                  </Link>
                  <span className="text-xs font-bold text-accent">{b.progress}%</span>
                </div>
                <p className="text-xs text-text-muted truncate mt-0.5">
                  Ch. {b.chapter} • {b.chapterTitle}
                </p>
              </div>

              {/* Progress bar and time */}
              <div className="mt-2">
                <div className="w-full bg-border-subtle/40 h-1.5 rounded-full overflow-hidden mb-1.5">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500"
                    style={{ width: `${b.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-text-muted">
                  <span className="flex items-center gap-1">
                    <Timer className="w-3 h-3 text-accent" /> {b.hoursSpent}
                  </span>
                  <Link
                    to={`/book/${b.slug}/chapter/${b.chapter}`}
                    className="px-2.5 py-0.5 rounded-md bg-accent text-white font-semibold hover:bg-accent-hover transition-colors shadow-2xs"
                  >
                    Resume
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
