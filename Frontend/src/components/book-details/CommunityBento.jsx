import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  MessageSquare,
  Trophy,
  Heart,
  Flame,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

export default function CommunityBento() {
  const [tipsCount, setTipsCount] = useState(842);
  const [hasTipped, setHasTipped] = useState(false);
  const [votesCount, setVotesCount] = useState(38910);
  const [hasVoted, setHasVoted] = useState(false);

  const handleTip = () => {
    if (!hasTipped) {
      setTipsCount((prev) => prev + 1);
      setHasTipped(true);
    }
  };

  const handleVote = () => {
    if (!hasVoted) {
      setVotesCount((prev) => prev + 1);
      setHasVoted(true);
    }
  };

  return (
    <section className="w-full grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* 1. Author Notice Board / Transmission */}
      <div className="bg-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between transition-colors">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider text-accent font-bold">
              Author's Transmission
            </span>
            <span className="text-[11px] text-text-muted">Today 18:30</span>
          </div>
          <h4 className="font-serif text-base font-bold text-text-main">
            Double Releases for Volume Finale
          </h4>
          <p className="text-xs text-text-muted leading-relaxed italic">
            “Fellow daoists, chapter 9570 marks the climax of the current Garrison
            arc. Tomorrow I will drop three continuous chapters to celebrate
            reaching 25M total words. Prepare your spiritual energy.”
          </p>
        </div>

        <div className="pt-5 flex items-center gap-2">
          <button
            type="button"
            onClick={handleTip}
            className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
              hasTipped
                ? "bg-accent text-accent-text border-accent shadow-xs"
                : "bg-tag hover:bg-page text-accent border-border-subtle"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${hasTipped ? "fill-current" : ""}`} />
            <span>
              {hasTipped ? "Tipped!" : `Support Author (${tipsCount.toLocaleString()} Tips)`}
            </span>
          </button>
        </div>
      </div>

      {/* 2. Power Ranking Visualizer Mini-Chart */}
      <div className="bg-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-accent" />
              Power Stones Ranking
            </span>
            <span className="text-xs font-bold text-accent">#2 Xuanhuan</span>
          </div>
          <p className="font-serif text-base font-bold text-text-main">
            {votesCount.toLocaleString()} Votes This Week
          </p>

          {/* 7-Day Visual Mini Bar Chart */}
          <div className="mt-4 w-full h-16 flex items-end gap-2 px-1">
            <div className="flex-1 bg-border-subtle/50 rounded-t h-[40%]" title="Mon: 3,200" />
            <div className="flex-1 bg-border-subtle/50 rounded-t h-[55%]" title="Tue: 4,400" />
            <div className="flex-1 bg-border-subtle/50 rounded-t h-[48%]" title="Wed: 3,900" />
            <div className="flex-1 bg-border-subtle/50 rounded-t h-[70%]" title="Thu: 5,600" />
            <div className="flex-1 bg-border-subtle/50 rounded-t h-[65%]" title="Fri: 5,100" />
            <div className="flex-1 bg-tag rounded-t h-[82%]" title="Sat: 6,800" />
            <div className="flex-1 bg-accent rounded-t h-[100%] shadow-2xs" title="Today (Peak): 8,400" />
          </div>

          <div className="flex justify-between text-[10px] text-text-muted mt-2 font-mono">
            <span>Mon</span>
            <span>Wed</span>
            <span className="text-accent font-semibold flex items-center gap-0.5">
              <Flame className="w-3 h-3 text-accent" /> Today (Peak)
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleVote}
          className={`mt-4 w-full py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border ${
            hasVoted
              ? "bg-accent text-accent-text border-accent shadow-xs"
              : "bg-page hover:bg-tag text-text-main border-border-subtle shadow-2xs"
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{hasVoted ? "Stone Cast for Today!" : "Cast Daily Power Stones"}</span>
        </button>
      </div>

      {/* 3. Reader Circle & Discussion Snippet */}
      <div className="bg-card rounded-2xl p-6 border border-border-subtle shadow-sm flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] uppercase tracking-wider text-text-muted font-bold flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5 text-accent" />
              Reader Circle
            </span>
            <span className="text-xs text-text-muted">3.4k active threads</span>
          </div>
          <h4 className="font-serif text-base font-bold text-text-main">
            The Mystery of the Ghost Bride’s Ring
          </h4>
          <p className="text-xs text-text-muted pt-1 leading-relaxed line-clamp-3">
            DaoistMaster99: “Has anyone connected chapter 2’s dowry chest description
            with the ancient Yin Sovereign relics mentioned back in volume 1? The
            runes match perfectly...”
          </p>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-border-subtle text-xs">
          <span className="text-text-muted text-[11px]">189 comments • 4m ago</span>
          <Link
            to="/community"
            className="font-semibold text-accent hover:text-accent-hover flex items-center gap-1 transition-colors"
          >
            <span>Join Discussion</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
