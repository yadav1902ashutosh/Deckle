import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, Users } from "lucide-react";
import bookService from "../../services/bookService/bookService";

export default function RelatedRecommendations({ currentCategory, currentSlug }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (!currentSlug) return;

    bookService
      .getRecommendations(currentSlug)
      .then((data) => {
        if (isMounted) {
          setRecommendations(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.warn("Failed to fetch recommendations:", err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentSlug]);

  if (loading && recommendations.length === 0) {
    return null;
  }

  if (!loading && recommendations.length === 0) {
    return null;
  }

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
        {recommendations.slice(0, 4).map((book) => (
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
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-page/90 backdrop-blur-xs text-[10px] font-semibold text-text-main px-2 py-0.5 rounded shadow-2xs">
                  {book.genre_name || currentCategory || "Serial"}
                </span>
                <span className="absolute bottom-2 right-2 bg-black/75 backdrop-blur-xs text-[10px] font-medium text-white px-1.5 py-0.5 rounded">
                  {book.status || "Ongoing"}
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
                Author: {book.author_name || "Author"}
              </p>
              <p className="text-xs text-text-muted line-clamp-2 mt-2 leading-relaxed">
                {book.description || "A masterfully serialized narrative with escalating stakes."}
              </p>
            </div>

            {/* Bottom Rating & Readers Row */}
            <div className="pt-3 flex items-center justify-between text-xs text-text-muted border-t border-border-subtle/60 mt-3 font-medium">
              <span className="flex items-center gap-1 text-accent font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{book.rating || "5.0"}</span>
              </span>
              <span className="flex items-center gap-1 text-[11px]">
                <Users className="w-3 h-3 text-text-muted" />
                <span>{book.views_count ? `${book.views_count} Reads` : "Popular"}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
