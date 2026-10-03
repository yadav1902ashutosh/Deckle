import React from "react";
import { Flame, BookOpen, Sparkles, TrendingUp, Target, Award } from "lucide-react";

export default function ReadingStatsBanner() {
  return (
    <div className="flex flex-col h-full gap-2">
      {/* Aligned Top Subheader Label */}
      <div className="flex items-center justify-between text-xs text-text-muted h-5">
        <span className="font-semibold uppercase tracking-wider text-text-muted">
          Reading Rhythm &amp; Pace
        </span>
        <span className="text-accent font-medium flex items-center gap-1">
          <Flame className="w-3.5 h-3.5 fill-accent text-accent" /> 12-Day Streak Active
        </span>
      </div>

      {/* Main Card — Stretches to Equal Height */}
      <div className="bg-card border border-border-subtle/50 rounded-2xl p-5 flex flex-col justify-between flex-1 h-full shadow-sm relative overflow-hidden transition-colors">
        {/* Ambient subtle glow */}
        <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-accent/5 blur-2xl pointer-events-none" />

        {/* Middle Content */}
        <div className="flex flex-col justify-between gap-4 z-10 mb-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-1.5 text-accent font-semibold text-xs uppercase tracking-wider">
                <Flame className="w-4 h-4 fill-accent" />
                <span>Consecutive Momentum</span>
              </div>

              <div className="font-serif text-2xl sm:text-3xl text-text-main font-semibold tracking-tight">
                48 <span className="font-sans text-sm sm:text-base text-text-muted font-normal">mins read today</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-text-muted mt-0.5">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5 text-text-muted" /> 420K words this week
                </span>
                <span>·</span>
                <span className="text-accent font-medium">84% of weekly target</span>
              </div>
            </div>

            {/* Weekly Progress Ring Chart */}
            <div className="relative w-16 h-16 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 44 44">
                <circle
                  className="text-tag stroke-current"
                  cx="22"
                  cy="22"
                  fill="none"
                  r="18"
                  strokeWidth="3.5"
                />
                <circle
                  className="text-accent stroke-current"
                  cx="22"
                  cy="22"
                  fill="none"
                  r="18"
                  strokeDasharray="113.1"
                  strokeDashoffset="22.6"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xs font-bold text-accent">80%</span>
                <span className="text-[9px] font-semibold text-text-muted scale-90 -mt-0.5">WEEK</span>
              </div>
            </div>
          </div>

          {/* Goal track */}
          <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-tag/60 border border-border-subtle/40">
            <div className="flex items-center justify-between text-xs">
              <span className="text-text-muted flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-accent" /> Weekly Marathon Goal
              </span>
              <span className="font-semibold text-text-main">420k / 500k words</span>
            </div>
            <div className="w-full bg-border-subtle/40 h-1.5 rounded-full overflow-hidden">
              <div className="bg-accent h-full rounded-full transition-all duration-500" style={{ width: "84%" }} />
            </div>
          </div>
        </div>

        {/* Bottom Interactive Bar (Matches Left Card's h-12 Button Exactly) */}
        <div className="h-12 w-full rounded-xl bg-tag/80 border border-border-subtle/50 px-4 flex items-center justify-between text-xs text-text-muted z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="font-medium text-text-main truncate">Serene Flow Mode Active</span>
          </div>
          <button
            type="button"
            onClick={() => alert("Reading analytics: 48 mins logged across 3 sessions today.")}
            className="text-accent hover:underline cursor-pointer font-semibold text-xs flex items-center gap-1 shrink-0"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Stats Insight</span>
          </button>
        </div>
      </div>
    </div>
  );
}
