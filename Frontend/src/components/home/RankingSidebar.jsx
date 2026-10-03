import React from "react";
import { Link } from "react-router-dom";
import { Trophy, TrendingUp, ChevronRight } from "lucide-react";

const SAMPLE_RANKINGS = [
  {
    rank: 1,
    title: "Heavenly Tribulation",
    author: "Fleeting Dreams",
    votes: "94.8k votes",
    slug: "heavenly-tribulation",
  },
  {
    rank: 2,
    title: "Chronicles of the Abyssal Scholar",
    author: "Vesper Gray",
    votes: "88.2k votes",
    slug: "chronicles-of-the-abyssal-scholar",
  },
  {
    rank: 3,
    title: "Cyber Dao: Ascendance Protocol",
    author: "Neon Quill",
    votes: "76.4k votes",
    slug: "cyber-dao-ascendance",
  },
  {
    rank: 4,
    title: "Mortal's Journey to Immortality",
    author: "Wang Yu",
    votes: "69.1k votes",
    slug: "mortals-journey",
  },
  {
    rank: 5,
    title: "Cornflower Witch",
    author: "Sable Quill",
    votes: "58.7k votes",
    slug: "cornflower-witch",
  },
];

export default function RankingsSidebar({ rankings = SAMPLE_RANKINGS }) {
  const getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-amber-500 text-white shadow-xs font-bold";
      case 2:
        return "bg-slate-400 text-white shadow-xs font-bold";
      case 3:
        return "bg-amber-700 text-white shadow-xs font-bold";
      default:
        return "bg-tag text-text-muted border border-border-subtle font-medium";
    }
  };

  return (
    <aside className="w-full bg-card rounded-xl border border-border-subtle p-5 shadow-sm space-y-4 transition-colors duration-200">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-text-main">
            Power Rankings
          </h2>
        </div>
        <span className="text-[11px] bg-tag text-text-muted px-2 py-0.5 rounded-full border border-border-subtle font-medium">
          Daily Live
        </span>
      </div>

      <p className="text-xs text-text-muted">
        Ranked by active reading hours & community power votes.
      </p>

      {/* Top Ranked List */}
      <div className="space-y-1 divide-y divide-border-subtle/50">
        {rankings.map((item) => (
          <Link
            key={item.rank}
            to={`/book/${item.slug}`}
            className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-tag transition-colors group cursor-pointer"
          >
            {/* Rank Number Badge */}
            <div
              className={`w-6 h-6 flex-shrink-0 rounded-md text-xs flex items-center justify-center ${getBadgeStyle(
                item.rank,
              )}`}
            >
              {item.rank}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="text-xs sm:text-sm font-medium text-text-main truncate group-hover:text-accent transition-colors">
                {item.title}
              </h4>
              <div className="flex items-center gap-1.5 text-[11px] text-text-muted truncate">
                <span>{item.author}</span>
                <span>•</span>
                <span className="text-accent font-medium">{item.votes}</span>
              </div>
            </div>

            <TrendingUp className="w-3.5 h-3.5 text-accent opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
          </Link>
        ))}
      </div>

      {/* Footer Link */}
      <div className="pt-2 border-t border-border-subtle text-center">
        <Link
          to="/rankings"
          className="inline-flex items-center gap-1 text-xs text-accent hover:underline font-medium"
        >
          <span>View All 50 Ranked Serials</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
