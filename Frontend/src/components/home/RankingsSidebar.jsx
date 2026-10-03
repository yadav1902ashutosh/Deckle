import React from "react";
import { Link } from "react-router-dom";
import {
  Medal,
  ChevronsUp,
  ChevronUp,
  ChevronDown,
  Minus,
} from "lucide-react";

export const TOP_10_RANKINGS = [
  {
    rank: 1,
    title: "Heavenly Tribulation",
    author: "Fleeting Dreams",
    votes: "94.8k votes",
    slug: "heavenly-tribulation",
    movement: "double_up",
  },
  {
    rank: 2,
    title: "Xuanhuang Ding",
    author: "Nine Cauldron Master",
    votes: "88.2k votes",
    slug: "xuanhuang-ding",
    movement: "up",
  },
  {
    rank: 3,
    title: "Asura Martial God",
    author: "Kindhearted Bee",
    votes: "79.1k votes",
    slug: "asura-martial-god",
    movement: "same",
  },
  {
    rank: 4,
    title: "Nine Revolutions Devouring Heaven",
    author: "Dragon Sovereign",
    votes: "62.4k votes",
    slug: "nine-revolutions-devouring-heaven",
    movement: "up",
  },
  {
    rank: 5,
    title: "How Did I Become Invincible?",
    author: "Xinfeng",
    votes: "58.9k votes",
    slug: "how-did-i-become-invincible",
    movement: "down",
  },
  {
    rank: 6,
    title: "Cornflower Witch",
    author: "Sable Quill",
    votes: "51.2k votes",
    slug: "cornflower-witch",
    movement: "up",
  },
  {
    rank: 7,
    title: "Reincarnation of the Sword Monarch",
    author: "Frost Edge",
    votes: "46.7k votes",
    slug: "reincarnation-of-the-sword-monarch",
    movement: "same",
  },
  {
    rank: 8,
    title: "Lord of Mysteries (Translation Archive)",
    author: "Cuttlefish",
    votes: "43.0k votes",
    slug: "lord-of-mysteries",
    movement: "up",
  },
  {
    rank: 9,
    title: "Astral Pet Store",
    author: "Ancient Xi",
    votes: "39.4k votes",
    slug: "astral-pet-store",
    movement: "down",
  },
  {
    rank: 10,
    title: "Omniscient Reader's Viewpoint",
    author: "Sing Shong",
    votes: "37.8k votes",
    slug: "omniscient-readers-viewpoint",
    movement: "up",
  },
];

export default function RankingsSidebar({ rankings = TOP_10_RANKINGS }) {
  const getBadgeStyle = (rank) => {
    switch (rank) {
      case 1:
        return "bg-accent text-accent-text font-bold shadow-xs";
      case 2:
        return "bg-[#675d52] text-white font-bold shadow-xs";
      case 3:
        return "bg-[#796d5e] text-white font-bold shadow-xs";
      default:
        return "bg-tag text-text-main font-semibold border border-border-subtle";
    }
  };

  const renderMovementIcon = (movement) => {
    switch (movement) {
      case "double_up":
        return <ChevronsUp className="w-4 h-4 text-accent" />;
      case "up":
        return <ChevronUp className="w-4 h-4 text-accent" />;
      case "down":
        return <ChevronDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-3.5 h-3.5 text-text-muted" />;
    }
  };

  return (
    <div className="bg-card rounded-xl p-5 shadow-sm border border-border-subtle space-y-4 transition-colors duration-200">
      {/* Widget Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Medal className="w-5 h-5 text-accent" />
          <h2 className="font-serif text-lg font-semibold text-text-main">
            Power Rankings
          </h2>
        </div>
        <span className="text-[11px] bg-tag text-text-muted px-2 py-0.5 rounded border border-border-subtle font-medium">
          Daily Live
        </span>
      </div>

      <p className="text-xs text-text-muted">
        Ranked by active vote tokens & consecutive reading hours.
      </p>

      {/* Top 10 Ranked List */}
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
                <span>{item.author}</span>
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

      {/* Footer Link */}
      <Link
        to="/rankings"
        className="block text-center pt-2 font-medium text-xs text-accent hover:underline border-t border-border-subtle"
      >
        View Complete 100-Tier Leaderboard →
      </Link>
    </div>
  );
}
