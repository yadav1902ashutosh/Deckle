import React from "react";
import { Tag } from "lucide-react";

const MOTIFS = [
  { tag: "#TimeLoop", featured: true },
  { tag: "#DungeonCrawler", featured: true },
  { tag: "#HardMagic", featured: false },
  { tag: "#FoundFamily", featured: true },
  { tag: "#AntiHero", featured: false },
  { tag: "#SlowBurn", featured: false },
  { tag: "#Deckbuilding", featured: false },
  { tag: "#Grimdark", featured: false },
  { tag: "#CozyFantasy", featured: false },
  { tag: "#EnemiesToLovers", featured: false },
  { tag: "#CyberAugments", featured: false },
  { tag: "#Investigative", featured: false },
];

export default function TrendingMotifs() {
  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border-subtle space-y-4 transition-colors duration-200">
      <div className="flex items-center gap-2">
        <Tag className="w-4 h-4 text-accent" />
        <h3 className="font-serif text-base font-semibold text-text-main">
          Trending Motifs
        </h3>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {MOTIFS.map(({ tag, featured }) => (
          <button
            key={tag}
            type="button"
            className={`text-xs px-3 py-1.5 rounded transition-all cursor-pointer border border-border-subtle ${
              featured
                ? "bg-accent/15 text-accent font-semibold hover:bg-accent hover:text-accent-text"
                : "bg-tag hover:bg-accent hover:text-accent-text text-text-main"
            }`}
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
