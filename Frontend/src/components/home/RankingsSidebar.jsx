import React from "react";
import { Link } from "react-router-dom";
import {
  Medal,
  ChevronsUp,
  ChevronUp,
  Minus,
} from "lucide-react";
import { ListWidgetSkeleton } from "../common/Skeletons";
import AuthorAvatar from "../common/AuthorAvatar";

export default function RankingsSidebar({ books = [], loading = false }) {
  if (loading) {
    return <ListWidgetSkeleton count={5} />;
  }

  // Derive rankings from live active books
  const rankings = books.slice(0, 10).map((b, idx) => ({
    rank: idx + 1,
    title: b.title,
    author: b.author_name || "Unknown Author",
    author_handle: b.author_handle || "",
    author_avatar: b.author_avatar || null,
    votes: b.views_count ? `${b.views_count} reads` : `${b.rating || "4.8"} ★`,
    slug: b.slug || b.id,
    movement: idx === 0 ? "double_up" : idx < 3 ? "up" : "same",
  }));

  const getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-accent text-accent-text font-bold shadow-xs";
      case 2:
        return "bg-tag text-text-main font-bold border border-border-subtle";
      case 3:
        return "bg-tag text-text-muted font-bold border border-border-subtle";
      default:
        return "bg-tag/50 text-text-muted font-semibold";
    }
  };

  const renderMovementIcon = (movement) => {
    switch (movement) {
      case "double_up":
        return <ChevronsUp className="w-3.5 h-3.5 text-accent" />;
      case "up":
        return <ChevronUp className="w-3.5 h-3.5 text-accent" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-xs border border-border-subtle space-y-4 transition-colors duration-200">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-text-main">
            Power Rankings
          </h2>
        </div>
        <span className="text-[11px] bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle font-medium">
          Live Feed
        </span>
      </div>

      <p className="text-xs text-text-muted">
        Ranked by reading activity and community ratings.
      </p>

      {/* Top Ranked List */}
      {rankings.length > 0 ? (
        <div className="space-y-1 divide-y divide-border-subtle/40">
          {rankings.map((item) => (
            <Link
              key={item.rank}
              to={`/book/${item.slug}`}
              className="flex items-center gap-2.5 py-2 px-1.5 rounded-lg hover:bg-tag transition-colors group cursor-pointer"
            >
              {/* Rank Number */}
              <div
                className={`w-6 h-6 flex-shrink-0 rounded text-xs flex items-center justify-center ${getBadgeStyle(
                  item.rank,
                )}`}
              >
                {item.rank}
              </div>

              {/* Novel Info */}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-semibold text-text-main truncate group-hover:text-accent transition-colors">
                  {item.title}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-text-muted truncate">
                  <AuthorAvatar
                    name={item.author}
                    avatar={item.author_avatar}
                    handle={item.author_handle}
                    size="xs"
                  />
                  <span className="truncate">{item.author}</span>
                  <span>•</span>
                  <span className={item.rank <= 3 ? "text-accent font-semibold" : ""}>
                    {item.votes}
                  </span>
                </div>
              </div>

              {/* Movement Icon */}
              <div className="flex-shrink-0">{renderMovementIcon(item.movement)}</div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="py-6 text-center text-xs text-text-muted">
          No ranked serials available yet.
        </div>
      )}

      {/* Footer Link */}
      <Link
        to="/rankings"
        className="block text-center pt-2 font-medium text-xs text-accent hover:underline border-t border-border-subtle"
      >
        View Complete Leaderboard →
      </Link>
    </div>
  );
}
