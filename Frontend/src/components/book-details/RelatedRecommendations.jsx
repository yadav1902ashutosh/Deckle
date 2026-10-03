import React from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, BookOpen, Users } from "lucide-react";

export const RECOMMENDATIONS = [
  {
    id: "rec-1",
    slug: "mortals-journey",
    title: "Record of a Mortal's Journey",
    author: "Wang Yu (忘语)",
    coverImage:
      "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80",
    genre: "Xianxia",
    chapters: "4,210 Ch.",
    synopsis:
      "An ordinary youth from a poor mountain village stumbles upon an ancient green vial that distills heavenly celestial essence.",
    rating: "9.8",
    readers: "31.2k Readers",
  },
  {
    id: "rec-2",
    slug: "lord-of-the-mysteries",
    title: "Lord of the Mysteries",
    author: "Cuttlefish That Loves Diving (爱潜水的乌贼)",
    coverImage:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&auto=format&fit=crop&q=80",
    genre: "Mystery • Steampunk",
    chapters: "1,432 Ch.",
    synopsis:
      "Awakening in a world of tarot divination, eldritch potions, and airships, Klein Moretti becomes the Fool of the spirit realm.",
    rating: "9.9",
    readers: "68.4k Readers",
  },
  {
    id: "rec-3",
    slug: "renegade-immortal",
    title: "Renegade Immortal",
    author: "Er Gen (耳根)",
    coverImage:
      "https://images.unsplash.com/photo-1514539079130-25950c84af65?w=600&auto=format&fit=crop&q=80",
    genre: "Dark Xianxia",
    chapters: "2,088 Ch.",
    synopsis:
      "Wang Lin knows the immortal realm is not about enlightenment, but slaughter and defying the merciless mandate of the heavens.",
    rating: "9.7",
    readers: "28.1k Readers",
  },
  {
    id: "rec-4",
    slug: "my-house-of-horrors",
    title: "My House of Horrors",
    author: "I Fix Air Conditioner (我会修空调)",
    coverImage:
      "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=600&auto=format&fit=crop&q=80",
    genre: "Supernatural",
    chapters: "1,208 Ch.",
    synopsis:
      "Chen Ge inherits his missing parents' dilapidated haunted house along with a mysterious black phone offering bizarre supernatural missions.",
    rating: "9.8",
    readers: "42.9k Readers",
  },
];

export default function RelatedRecommendations() {
  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-5">
        <div>
          <span className="text-[11px] uppercase tracking-wider text-accent font-bold">
            Curated Recommendations
          </span>
          <h3 className="font-serif text-2xl font-bold text-text-main">
            Readers Also Enjoyed
          </h3>
        </div>
        <Link
          to="/"
          className="text-xs text-accent hover:text-accent-hover font-semibold flex items-center gap-1 transition-colors"
        >
          <span>Explore Entire Catalog</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 4-Card Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {RECOMMENDATIONS.map((book) => (
          <div
            key={book.id}
            className="bg-card rounded-2xl p-3.5 border border-border-subtle shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
          >
            <div>
              {/* Cover Art Frame */}
              <Link
                to={`/book/${book.slug}`}
                className="relative aspect-[3/4] w-full rounded-xl bg-card-white overflow-hidden mb-3 block border border-border-subtle/40"
              >
                <img
                  src={book.coverImage}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-page/90 backdrop-blur-xs text-[10px] font-semibold text-text-main px-2 py-0.5 rounded shadow-2xs">
                  {book.genre}
                </span>
                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white px-1.5 py-0.5 rounded">
                  {book.chapters}
                </span>
              </Link>

              {/* Title & Author */}
              <Link
                to={`/book/${book.slug}`}
                className="font-serif text-sm font-bold text-text-main group-hover:text-accent transition-colors truncate block"
                title={book.title}
              >
                {book.title}
              </Link>
              <p className="text-[11px] text-text-muted mt-0.5 truncate">
                Author: {book.author}
              </p>
              <p className="text-xs text-text-muted line-clamp-2 mt-2 leading-relaxed">
                {book.synopsis}
              </p>
            </div>

            {/* Bottom Rating & Readers Row */}
            <div className="pt-3 flex items-center justify-between text-xs text-text-muted border-t border-border-subtle/60 mt-3 font-medium">
              <span className="flex items-center gap-1 text-accent font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{book.rating}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3 text-text-muted" />
                <span>{book.readers}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
