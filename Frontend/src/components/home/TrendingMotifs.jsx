import React, { useState, useEffect } from "react";
import { Tag } from "lucide-react";
import bookService from "../../services/bookService/bookService";

export default function TrendingMotifs({ onSelectTag }) {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    bookService
      .getTrendingTags()
      .then((data) => {
        if (isMounted) {
          setTags(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load trending tags:", err);
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const fallbackTags = [
    { tag: "TimeLoop", count: 12 },
    { tag: "DungeonCrawler", count: 8 },
    { tag: "Cultivation", count: 15 },
    { tag: "FoundFamily", count: 6 },
    { tag: "AntiHero", count: 9 },
    { tag: "SlowBurn", count: 7 },
  ];

  const displayTags = tags.length > 0 ? tags : fallbackTags;

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border-subtle space-y-4 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-accent" />
        <h3 className="font-serif text-base font-semibold text-text-main">
          Trending Motifs
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {displayTags.map(({ tag, count }, idx) => (
          <button
            key={tag}
            type="button"
            onClick={() => onSelectTag && onSelectTag(tag)}
            className={`text-xs px-3 py-1.5 rounded transition-all cursor-pointer border border-border-subtle ${
              idx < 3
                ? "bg-accent/15 text-accent font-semibold hover:bg-accent hover:text-accent-text"
                : "bg-tag hover:bg-accent hover:text-accent-text text-text-main"
            }`}
          >
            #{tag}
          </button>
        ))}
      </div>
    </div>
  );
}
